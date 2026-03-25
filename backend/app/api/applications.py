from __future__ import annotations

from collections import Counter, defaultdict
from datetime import datetime, timezone
import logging
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.db.client import get_supabase_admin
from app.dependencies.auth import get_current_profile, require_admin
from app.core.email import send_email
from app.models.applications import (
    ApplicationCreateRequest,
    ApplicationDecideRequest,
    ApplicationDetail,
    ApplicationListItem,
    ApplicationPatchRequest,
    ApplicationStatusLog,
    ApplicationSubmitRequest,
)

router = APIRouter(prefix="/api/applications", tags=["applications"])
logger = logging.getLogger("app.applications")

SECTOR_ORDER = ("telecom", "broadcasting", "postal", "internet")


def _derive_sector_from_licence_type(licence_type: str | None) -> str:
    label = (licence_type or "").strip().lower()
    if "broadcast" in label:
        return "broadcasting"
    if "postal" in label:
        return "postal"
    if "vans" in label or "internet" in label:
        return "internet"
    return "telecom"


def _extract_region_candidates(value: Any) -> list[str]:
    candidates: list[str] = []
    if isinstance(value, dict):
        for key, nested in value.items():
            key_lower = str(key).lower()
            if key_lower in {"district", "region", "city", "town", "location"}:
                if isinstance(nested, str) and nested.strip():
                    candidates.append(nested.strip())
            elif "district" in key_lower or "region" in key_lower:
                if isinstance(nested, str) and nested.strip():
                    candidates.append(nested.strip())
                elif isinstance(nested, list):
                    for item in nested:
                        if isinstance(item, str) and item.strip():
                            candidates.append(item.strip())
            candidates.extend(_extract_region_candidates(nested))
    elif isinstance(value, list):
        for item in value:
            candidates.extend(_extract_region_candidates(item))
    return candidates


def _get_profile_full_name(supabase, user_id: str) -> str | None:
    result = (
        supabase.table("profiles")
        .select("full_name")
        .eq("id", user_id)
        .limit(1)
        .execute()
    )
    rows = result.data or []
    first = rows[0] if rows else None
    if isinstance(first, dict):
        full_name = str(first.get("full_name") or "").strip()
        return full_name or None
    return None


def _get_auth_email(supabase, user_id: str) -> str | None:
    try:
        admin_client = getattr(supabase.auth, "admin", None)
        if admin_client is None:
            return None
        response = admin_client.get_user_by_id(user_id)
        user = getattr(response, "user", None)
        email = getattr(user, "email", None)
        return str(email).strip() if email else None
    except Exception as exc:
        logger.warning("application_notification_lookup_failed user_id=%s error=%s", user_id, exc)
        return None


def _send_application_submission_ack_email(
    supabase,
    *,
    applicant_id: str,
    reference_number: str,
    licence_type: str,
) -> None:
    email = _get_auth_email(supabase, applicant_id)
    if not email:
        return
    full_name = _get_profile_full_name(supabase, applicant_id) or "Applicant"
    subject = f"BOCRA Application Acknowledgement - {reference_number}"
    body = (
        f"Dear {full_name},\n\n"
        f"We acknowledge receipt of your application.\n"
        f"Application Number: {reference_number}\n"
        f"Licence Type: {licence_type}\n"
        f"Current Status: submitted\n\n"
        "You can track status updates in the BOCRA customer portal.\n\n"
        "Regards,\nBOCRA"
    )
    send_email(to_email=email, subject=subject, body=body)


def _send_application_status_email(
    supabase,
    *,
    applicant_id: str,
    reference_number: str,
    licence_type: str,
    new_status: str,
) -> None:
    email = _get_auth_email(supabase, applicant_id)
    if not email:
        return
    full_name = _get_profile_full_name(supabase, applicant_id) or "Applicant"
    subject = f"BOCRA Application Status Update - {reference_number}"
    body = (
        f"Dear {full_name},\n\n"
        "Your application status has been updated.\n"
        f"Application Number: {reference_number}\n"
        f"Licence Type: {licence_type}\n"
        f"New Status: {new_status}\n\n"
        "Please log in to the customer portal for details.\n\n"
        "Regards,\nBOCRA"
    )
    send_email(to_email=email, subject=subject, body=body)


def _generate_reference_number(supabase_admin, current_year: int) -> str:
    """
    Generate a reference number in format BOCRA-YYYY-NNNN.
    Queries max existing number for the year and increments.
    Note: This is racey; document for user retry on conflict.
    """
    result = (
        supabase_admin.table("applications")
        .select("reference_number", count="exact")
        .filter("reference_number", "ilike", f"BOCRA-{current_year}-%")
        .execute()
    )

    rows = result.data or []
    max_num = 0
    for row in rows:
        if row.get("reference_number"):
            parts = row["reference_number"].split("-")
            try:
                if len(parts) == 3:
                    max_num = max(max_num, int(parts[2]))
            except ValueError:
                pass

    next_num = max_num + 1
    return f"BOCRA-{current_year}-{next_num:04d}"


def _log_status_change(
    supabase_admin,
    application_id: UUID,
    old_status: str | None,
    new_status: str,
    changed_by: UUID,
    reason: str | None = None,
) -> None:
    """Insert a row into application_status_log."""
    try:
        supabase_admin.table("application_status_log").insert({
            "application_id": str(application_id),
            "old_status": old_status,
            "new_status": new_status,
            "changed_by": str(changed_by),
            "reason": reason,
            "created_at": datetime.utcnow().isoformat(),
        }).execute()
    except Exception as e:
        logger.warning("Failed to log status change for application %s: %s", application_id, e)


@router.get("", response_model=list[ApplicationListItem])
async def list_applications(
    current_profile: dict[str, Any] = Depends(get_current_profile),
    status_filter: str | None = Query(None),
    applicant_id: str | None = Query(None),
) -> list[ApplicationListItem]:
    """
    List applications.
    - Normal users see only their own.
    - Admins see all (optionally filtered by status or applicant_id).
    """
    supabase = get_supabase_admin()
    is_admin = current_profile.get("role") == "admin"
    current_user_id = current_profile["id"]

    query = supabase.table("applications").select(
        "id,reference_number,licence_type,status,submitted_at,created_at,updated_at"
    )

    if not is_admin:
        query = query.eq("applicant_id", str(current_user_id))
    elif is_admin and applicant_id:
        query = query.eq("applicant_id", applicant_id)

    if status_filter:
        query = query.eq("status", status_filter)

    query = query.order("created_at", desc=True)
    result = query.execute()

    items = []
    for row in result.data or []:
        items.append(ApplicationListItem(
            id=UUID(row["id"]),  # type: ignore
            reference_number=row["reference_number"],  # type: ignore
            licence_type=row["licence_type"],  # type: ignore
            status=row["status"],  # type: ignore
            submitted_at=datetime.fromisoformat(row["submitted_at"]) if row.get("submitted_at") else None,  # type: ignore
            created_at=datetime.fromisoformat(row["created_at"]),  # type: ignore
            updated_at=datetime.fromisoformat(row["updated_at"]),  # type: ignore
        ))

    logger.info("list_applications user_id=%s count=%d is_admin=%s", current_user_id, len(items), is_admin)
    return items


@router.get("/analytics")
async def applications_analytics(
    current_profile: dict[str, Any] = Depends(require_admin),
) -> dict[str, Any]:
    """
    Admin analytics for dashboard:
    - licence type distribution
    - regional coverage by sector and licence type
    """
    _ = current_profile
    supabase = get_supabase_admin()

    result = supabase.table("applications").select(
        "licence_type,status,form_data_a,form_data_b,form_data_c,form_data_d"
    ).execute()
    rows = [row for row in (result.data or []) if isinstance(row, dict)]

    licence_counter: Counter[str] = Counter()
    region_sector_counter: dict[str, Counter[str]] = defaultdict(Counter)
    region_licence_counter: dict[str, Counter[str]] = defaultdict(Counter)

    eligible_rows = [
        row for row in rows if str(row.get("status") or "").lower() not in {"draft", "rejected"}
    ]

    for row in eligible_rows:
        licence_type = str(row.get("licence_type") or "Unknown").strip() or "Unknown"
        sector = _derive_sector_from_licence_type(licence_type)
        licence_counter[licence_type] += 1

        all_regions: list[str] = []
        all_regions.extend(_extract_region_candidates(row.get("form_data_a")))
        all_regions.extend(_extract_region_candidates(row.get("form_data_b")))
        all_regions.extend(_extract_region_candidates(row.get("form_data_c")))
        all_regions.extend(_extract_region_candidates(row.get("form_data_d")))

        regions = sorted({region for region in all_regions if region})
        if not regions:
            regions = ["Unknown"]

        for region in regions:
            region_sector_counter[region][sector] += 1
            region_licence_counter[region][licence_type] += 1

    licence_distribution = [
        {"licence_type": licence_type, "count": count}
        for licence_type, count in licence_counter.most_common()
    ]

    regional_coverage = []
    for region in sorted(region_sector_counter.keys()):
        by_sector = {sector: int(region_sector_counter[region].get(sector, 0)) for sector in SECTOR_ORDER}
        by_licence_type = [
            {"licence_type": licence_type, "count": count}
            for licence_type, count in region_licence_counter[region].most_common()
        ]
        regional_coverage.append(
            {
                "region": region,
                "total": int(sum(by_sector.values())),
                "by_sector": by_sector,
                "by_licence_type": by_licence_type,
            }
        )

    return {
        "total_eligible_licences": len(eligible_rows),
        "licence_type_distribution": licence_distribution,
        "regional_coverage": regional_coverage,
    }


@router.post("", response_model=ApplicationDetail, status_code=status.HTTP_201_CREATED)
async def create_application(
    payload: ApplicationCreateRequest,
    current_profile: dict[str, Any] = Depends(get_current_profile),
) -> ApplicationDetail:
    """
    Create a new application (draft status).
    Retries up to 3 times on reference number collisions.
    """
    supabase = get_supabase_admin()
    current_user_id = UUID(current_profile["id"])
    now = datetime.utcnow()
    current_year = now.year

    max_retries = 3
    reference_number = None
    app_row = None
    
    for attempt in range(max_retries):
        reference_number = _generate_reference_number(supabase, current_year)
        
        app_data = {
            "applicant_id": str(current_user_id),
            "reference_number": reference_number,
            "licence_type": payload.licence_type,
            "status": "draft",
            "form_data_a": payload.form_data_a,
            "form_data_b": payload.form_data_b,
            "form_data_c": payload.form_data_c,
            "form_data_d": payload.form_data_d,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
        }

        try:
            result = supabase.table("applications").insert(app_data).execute()
            if result.data:
                app_row = result.data[0]
                logger.info("create_application user_id=%s ref=%s attempt=%d", current_user_id, reference_number, attempt + 1)
                break
        except Exception as e:
            error_str = str(e).lower()
            # Only retry on reference number uniqueness violations
            if "unique" in error_str and "reference" in error_str:
                if attempt < max_retries - 1:
                    logger.warning("Reference number collision (attempt %d/%d): %s", attempt + 1, max_retries, e)
                    continue
                else:
                    logger.error("Failed to create application after %d retries (reference collision): %s", max_retries, e)
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=f"Unable to generate unique reference number after {max_retries} attempts. Please try again.",
                    )
            else:
                logger.error("Failed to create application: %s", e)
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    if not app_row:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create application")

    return ApplicationDetail(
        id=UUID(app_row["id"]), # type: ignore
        applicant_id=UUID(app_row["applicant_id"]), # type: ignore
        reference_number=app_row["reference_number"], # type: ignore
        licence_type=app_row["licence_type"], # type: ignore
        status=app_row["status"], # type: ignore
        form_data_a=app_row.get("form_data_a"), # type: ignore
        form_data_b=app_row.get("form_data_b"), # type: ignore
        form_data_c=app_row.get("form_data_c"), # type: ignore
        form_data_d=app_row.get("form_data_d"), # type: ignore
        admin_notes=app_row.get("admin_notes"), # type: ignore
        decision_reason=app_row.get("decision_reason"), # type: ignore
        decided_by=UUID(app_row["decided_by"]) if app_row.get("decided_by") else None, # type: ignore
        decided_at=datetime.fromisoformat(app_row["decided_at"]) if app_row.get("decided_at") else None, # type: ignore
        submitted_at=None, # type: ignore
        created_at=datetime.fromisoformat(app_row["created_at"]), # type: ignore
        updated_at=datetime.fromisoformat(app_row["updated_at"]), # type: ignore
    )


@router.get("/{application_id}", response_model=ApplicationDetail)
async def get_application(
    application_id: UUID,
    current_profile: dict[str, Any] = Depends(get_current_profile),
) -> ApplicationDetail:
    """
    Get application detail.
    - Normal user can only see their own.
    - Admin can see any.
    """
    supabase = get_supabase_admin()
    current_user_id = UUID(current_profile["id"])
    is_admin = current_profile.get("role") == "admin"

    result = supabase.table("applications").select("*").eq("id", str(application_id)).execute()

    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    app_row = result.data[0]
    app_applicant_id = UUID(app_row["applicant_id"]) # type: ignore

    if not is_admin and app_applicant_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    logger.info("get_application app_id=%s user_id=%s", application_id, current_user_id)

    return ApplicationDetail(
        id=UUID(app_row["id"]), # type: ignore
        applicant_id=app_applicant_id, # type: ignore
        reference_number=app_row["reference_number"], # type: ignore
        licence_type=app_row["licence_type"], # type: ignore
        status=app_row["status"], # type: ignore
        form_data_a=app_row.get("form_data_a"), # type: ignore
        form_data_b=app_row.get("form_data_b"), # type: ignore
        form_data_c=app_row.get("form_data_c"), # type: ignore
        form_data_d=app_row.get("form_data_d"), # type: ignore
        admin_notes=app_row.get("admin_notes"), # type: ignore
        decision_reason=app_row.get("decision_reason"), # type: ignore
        decided_by=UUID(app_row["decided_by"]) if app_row.get("decided_by") else None, # type: ignore
        decided_at=datetime.fromisoformat(app_row["decided_at"]) if app_row.get("decided_at") else None, # type: ignore
        submitted_at=datetime.fromisoformat(app_row["submitted_at"]) if app_row.get("submitted_at") else None, # type: ignore
        created_at=datetime.fromisoformat(app_row["created_at"]), # type: ignore
        updated_at=datetime.fromisoformat(app_row["updated_at"]), # type: ignore
    )


@router.patch("/{application_id}", response_model=ApplicationDetail)
async def patch_application(
    application_id: UUID,
    payload: ApplicationPatchRequest,
    current_profile: dict[str, Any] = Depends(get_current_profile),
) -> ApplicationDetail:
    """
    Update application.
    - Normal user: can only edit form_data and licence_type while status='draft'.
    - Admin: can edit status, admin_notes, decision_reason, and form fields.
    """
    supabase = get_supabase_admin()
    current_user_id = UUID(current_profile["id"])
    is_admin = current_profile.get("role") == "admin"

    result = supabase.table("applications").select("*").eq("id", str(application_id)).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    app_row = result.data[0]
    app_applicant_id = UUID(app_row["applicant_id"]) # type: ignore
    old_status = app_row["status"] # type: ignore

    if not is_admin and app_applicant_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if not is_admin:
        # Normal user: only allow draft edits
        if app_row["status"] != "draft": # type: ignore
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only edit draft applications",
            )
        # Disallow setting admin-only fields
        if payload.status is not None or payload.admin_notes is not None or payload.decision_reason is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot set admin-only fields",
            )

    update_data = {
        "updated_at": datetime.utcnow().isoformat(),
    }

    if payload.licence_type is not None:
        update_data["licence_type"] = payload.licence_type
    if payload.form_data_a is not None:
        update_data["form_data_a"] = payload.form_data_a # type: ignore
    if payload.form_data_b is not None:
        update_data["form_data_b"] = payload.form_data_b # type: ignore
    if payload.form_data_c is not None:
        update_data["form_data_c"] = payload.form_data_c # type: ignore
    if payload.form_data_d is not None:
        update_data["form_data_d"] = payload.form_data_d # type: ignore

    if is_admin:
        if payload.status is not None:
            update_data["status"] = payload.status
        if payload.admin_notes is not None:
            update_data["admin_notes"] = payload.admin_notes
        if payload.decision_reason is not None:
            update_data["decision_reason"] = payload.decision_reason

    update_result = (
        supabase.table("applications")
        .update(update_data)
        .eq("id", str(application_id))
        .execute()
    )

    if not update_result.data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Update failed")

    updated_row = update_result.data[0]
    new_status = updated_row.get("status", old_status) # type: ignore

    if is_admin and new_status != old_status:
        _log_status_change(supabase, application_id, old_status, new_status, current_user_id, reason="Admin update") # type: ignore
        applicant_id = str(updated_row.get("applicant_id") or "")
        reference_number = str(updated_row.get("reference_number") or "")
        licence_type = str(updated_row.get("licence_type") or "")
        if applicant_id and reference_number:
            _send_application_status_email(
                supabase,
                applicant_id=applicant_id,
                reference_number=reference_number,
                licence_type=licence_type,
                new_status=str(new_status),
            )

    logger.info("patch_application app_id=%s user_id=%s is_admin=%s", application_id, current_user_id, is_admin)

    return ApplicationDetail(
        id=UUID(updated_row["id"]), # type: ignore
        applicant_id=UUID(updated_row["applicant_id"]), # type: ignore
        reference_number=updated_row["reference_number"], # type: ignore
        licence_type=updated_row["licence_type"], # type: ignore
        status=updated_row["status"], # type: ignore
        form_data_a=updated_row.get("form_data_a"), # type: ignore
        form_data_b=updated_row.get("form_data_b"), # type: ignore
        form_data_c=updated_row.get("form_data_c"), # type: ignore
        form_data_d=updated_row.get("form_data_d"), # type: ignore
        admin_notes=updated_row.get("admin_notes"), # type: ignore
        decision_reason=updated_row.get("decision_reason"), # type: ignore
        decided_by=UUID(updated_row["decided_by"]) if updated_row.get("decided_by") else None, # type: ignore
        decided_at=datetime.fromisoformat(updated_row["decided_at"]) if updated_row.get("decided_at") else None, # type: ignore
        submitted_at=datetime.fromisoformat(updated_row["submitted_at"]) if updated_row.get("submitted_at") else None, # type: ignore
        created_at=datetime.fromisoformat(updated_row["created_at"]), # type: ignore
        updated_at=datetime.fromisoformat(updated_row["updated_at"]), # type: ignore
    )


@router.post("/{application_id}/submit", response_model=ApplicationDetail)
async def submit_application(
    application_id: UUID,
    payload: ApplicationSubmitRequest,
    current_profile: dict[str, Any] = Depends(get_current_profile),
) -> ApplicationDetail:
    """
    Submit application (draft -> submitted).
    - Owner only.
    - Only from draft status.
    """
    supabase = get_supabase_admin()
    current_user_id = UUID(current_profile["id"])

    result = supabase.table("applications").select("*").eq("id", str(application_id)).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    app_row = result.data[0]
    app_applicant_id = UUID(app_row["applicant_id"]) # type: ignore

    if app_applicant_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owner can submit")

    if app_row["status"] != "draft": # type: ignore
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Can only submit draft applications (current status: {app_row['status']})",  # type: ignore
        )

    now = datetime.utcnow()
    update_data = {
        "status": "submitted",
        "submitted_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }

    update_result = (
        supabase.table("applications")
        .update(update_data)
        .eq("id", str(application_id))
        .execute()
    )

    if not update_result.data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Submit failed")

    updated_row = update_result.data[0]
    _log_status_change(
        supabase,
        application_id,
        "draft",
        "submitted",
        current_user_id,
        reason="User submitted application",
    )
    applicant_id = str(updated_row.get("applicant_id") or "")
    reference_number = str(updated_row.get("reference_number") or "")
    licence_type = str(updated_row.get("licence_type") or "")
    if applicant_id and reference_number:
        _send_application_submission_ack_email(
            supabase,
            applicant_id=applicant_id,
            reference_number=reference_number,
            licence_type=licence_type,
        )

    logger.info("submit_application app_id=%s user_id=%s", application_id, current_user_id)

    return ApplicationDetail(
        id=UUID(updated_row["id"]), # type: ignore
        applicant_id=UUID(updated_row["applicant_id"]), # type: ignore
        reference_number=updated_row["reference_number"], # type: ignore
        licence_type=updated_row["licence_type"], # type: ignore
        status=updated_row["status"], # type: ignore
        form_data_a=updated_row.get("form_data_a"), # type: ignore
        form_data_b=updated_row.get("form_data_b"), # type: ignore
        form_data_c=updated_row.get("form_data_c"), # type: ignore
        form_data_d=updated_row.get("form_data_d"), # type: ignore
        admin_notes=updated_row.get("admin_notes"), # type: ignore
        decision_reason=updated_row.get("decision_reason"), # type: ignore
        decided_by=UUID(updated_row["decided_by"]) if updated_row.get("decided_by") else None, # type: ignore
        decided_at=datetime.fromisoformat(updated_row["decided_at"]) if updated_row.get("decided_at") else None, # type: ignore
        submitted_at=datetime.fromisoformat(updated_row["submitted_at"]) if updated_row.get("submitted_at") else None, # type: ignore
        created_at=datetime.fromisoformat(updated_row["created_at"]), # type: ignore
        updated_at=datetime.fromisoformat(updated_row["updated_at"]), # type: ignore
    )


@router.post("/{application_id}/decide", response_model=ApplicationDetail)
async def decide_application(
    application_id: UUID,
    payload: ApplicationDecideRequest,
    current_profile: dict[str, Any] = Depends(require_admin),
) -> ApplicationDetail:
    """
    Admin approve/reject application with mandatory decision_reason.
    Status must be exactly 'approved' or 'rejected'.
    Decision reason must not be blank/whitespace.
    """
    supabase = get_supabase_admin()
    current_user_id = UUID(current_profile["id"])

    # Validate status is exactly 'approved' or 'rejected'
    if payload.status not in ("approved", "rejected"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be exactly 'approved' or 'rejected'",
        )

    # Validate decision_reason is not blank/whitespace
    if not payload.decision_reason or not payload.decision_reason.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Decision reason cannot be blank or whitespace",
        )

    result = supabase.table("applications").select("*").eq("id", str(application_id)).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    app_row = result.data[0]
    old_status = app_row["status"] # type: ignore

    now = datetime.now(timezone.utc)
    update_data = {
        "status": payload.status,
        "decision_reason": payload.decision_reason,
        "decided_by": str(current_user_id),
        "decided_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }

    if payload.admin_notes is not None:
        update_data["admin_notes"] = payload.admin_notes

    update_result = (
        supabase.table("applications")
        .update(update_data)
        .eq("id", str(application_id))
        .execute()
    )

    if not update_result.data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Decision failed")

    updated_row = update_result.data[0]
    _log_status_change(
        supabase,
        application_id,
        old_status, # type: ignore
        payload.status,
        current_user_id,
        reason=f"Admin decision: {payload.decision_reason}",
    )
    applicant_id = str(updated_row.get("applicant_id") or "")
    reference_number = str(updated_row.get("reference_number") or "")
    licence_type = str(updated_row.get("licence_type") or "")
    if applicant_id and reference_number:
        _send_application_status_email(
            supabase,
            applicant_id=applicant_id,
            reference_number=reference_number,
            licence_type=licence_type,
            new_status=str(payload.status),
        )

    logger.info(
        "decide_application app_id=%s decision=%s admin_id=%s",
        application_id,
        payload.status,
        current_user_id,
    )

    return ApplicationDetail(
        id=UUID(updated_row["id"]),  # type: ignore
        applicant_id=UUID(updated_row["applicant_id"]),  # type: ignore
        reference_number=updated_row["reference_number"],  # type: ignore
        licence_type=updated_row["licence_type"],  # type: ignore
        status=updated_row["status"],  # type: ignore
        form_data_a=updated_row.get("form_data_a"),  # type: ignore
        form_data_b=updated_row.get("form_data_b"),  # type: ignore
        form_data_c=updated_row.get("form_data_c"),  # type: ignore
        form_data_d=updated_row.get("form_data_d"),  # type: ignore
        admin_notes=updated_row.get("admin_notes"),  # type: ignore
        decision_reason=updated_row.get("decision_reason"),  # type: ignore
        decided_by=UUID(updated_row["decided_by"]) if updated_row.get("decided_by") else None,  # type: ignore
        decided_at=datetime.fromisoformat(updated_row["decided_at"]) if updated_row.get("decided_at") else None,  # type: ignore
        submitted_at=datetime.fromisoformat(updated_row["submitted_at"]) if updated_row.get("submitted_at") else None,  # type: ignore
        created_at=datetime.fromisoformat(updated_row["created_at"]),  # type: ignore
        updated_at=datetime.fromisoformat(updated_row["updated_at"]),  # type: ignore
    )


@router.get("/{application_id}/history", response_model=list[ApplicationStatusLog])
async def get_application_history(
    application_id: UUID,
    current_profile: dict[str, Any] = Depends(get_current_profile),
) -> list[ApplicationStatusLog]:
    """
    Get status change history for an application.
    - Owner or admin only.
    - Ordered oldest to newest.
    """
    supabase = get_supabase_admin()
    current_user_id = UUID(current_profile["id"])
    is_admin = current_profile.get("role") == "admin"

    # Check access
    app_result = supabase.table("applications").select("applicant_id").eq("id", str(application_id)).execute()
    if not app_result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    app_applicant_id = UUID(app_result.data[0]["applicant_id"])  # type: ignore
    if not is_admin and app_applicant_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    result = (
        supabase.table("application_status_log")
        .select("*")
        .eq("application_id", str(application_id))
        .order("created_at", desc=False)
        .execute()
    )

    logs = []
    for row in result.data or []:
        logs.append(ApplicationStatusLog(
            id=UUID(row["id"]),  # type: ignore
            old_status=row.get("old_status"),  # type: ignore
            new_status=row["new_status"],  # type: ignore
            changed_by=UUID(row["changed_by"]) if row.get("changed_by") else None,  # type: ignore
            reason=row.get("reason"),  # type: ignore
            created_at=datetime.fromisoformat(row["created_at"]),  # type: ignore
        ))

    logger.info("get_application_history app_id=%s user_id=%s count=%d", application_id, current_user_id, len(logs))
    return logs

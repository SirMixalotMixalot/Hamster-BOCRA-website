from __future__ import annotations

import logging
import mimetypes
import os
import uuid
from typing import Any
from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.db.client import get_supabase_admin
from app.dependencies.auth import get_current_profile
from app.models.documents import (
    DocumentResponse,
    DocumentUploadResponse,
    PublicDocumentListItem,
)

router = APIRouter(prefix="/api/documents", tags=["documents"])
logger = logging.getLogger("app.documents")

# ===== CONFIGURATION =====

# Bucket and category mapping
CATEGORY_BUCKET_MAPPING = {
    "application": "application-documents",
    "profile_photo": "profile-photos",
    "evidence": "evidence-uploads",
    "public": "public-documents",
}

# Allowed MIME types and extensions by category
CATEGORY_VALIDATION = {
    "application": {
        "extensions": {".pdf", ".jpg", ".jpeg", ".png"},
        "mime_types": {"application/pdf", "image/jpeg", "image/png"},
        "max_size_bytes": 10 * 1024 * 1024,  # 10 MB
    },
    "profile_photo": {
        "extensions": {".jpg", ".jpeg", ".png"},
        "mime_types": {"image/jpeg", "image/png"},
        "max_size_bytes": 5 * 1024 * 1024,  # 5 MB
    },
    "evidence": {
        "extensions": {".pdf", ".jpg", ".jpeg", ".png", ".mp4"},
        "mime_types": {"application/pdf", "image/jpeg", "image/png", "video/mp4"},
        "max_size_bytes": 10 * 1024 * 1024,  # 10 MB
    },
    "public": {
        "extensions": {".pdf"},
        "mime_types": {"application/pdf"},
        "max_size_bytes": 20 * 1024 * 1024,  # 20 MB
    },
}

PUBLIC_DOCUMENT_SECTIONS = {"news", "tenders", "forms", "publications", "legislation", "annual-reports"}


# ===== HELPER FUNCTIONS =====

def _validate_file_upload(
    file: UploadFile,
    category: str,
) -> tuple[str, str]:
    """
    Validate file upload against category rules.
    Checks: extension allowlist, client MIME allowlist, and cross-validates with filename-derived MIME.
    Returns (safe_extension, mime_type) on success.
    Raises HTTPException on validation failure.
    Note: This is not full content-sniffing; actual file content is validated in upload_document() after reading.
    """
    if category not in CATEGORY_VALIDATION:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category. Allowed: {', '.join(CATEGORY_VALIDATION.keys())}",
        )

    rules = CATEGORY_VALIDATION[category]

    # Extract extension from filename
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must have a filename",
        )

    # Validate extension against allowlist
    _, ext = os.path.splitext(file.filename.lower())
    if not ext or ext not in rules["extensions"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File extension '{ext}' not allowed for category '{category}'. Allowed: {', '.join(rules['extensions'])}",
        )

    # Validate MIME type: check client-provided MIME against allowlist
    client_mime = file.content_type or "application/octet-stream"
    if client_mime not in rules["mime_types"]:
        logger.warning(
            "Rejected file '%s' with MIME type '%s' for category '%s' (allowed: %s)",
            file.filename,
            client_mime,
            category,
            rules["mime_types"],
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"MIME type '{client_mime}' not allowed for category '{category}'",
        )

    # Cross-validate with filename-derived MIME if available
    detected_mime, _ = mimetypes.guess_type(file.filename)
    if detected_mime and detected_mime != client_mime and detected_mime not in rules["mime_types"]:
        # Suspicious conflict: filename suggests a different MIME, and that MIME is not allowed
        logger.warning(
            "Rejected file '%s': filename-derived MIME '%s' conflicts with client MIME '%s' and is not allowed for category '%s'",
            file.filename,
            detected_mime,
            client_mime,
            category,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File extension and MIME type conflict; possible file masquerading",
        )

    return ext, client_mime


def _get_upload_path(user_id: str, category: str, filename: str) -> str:
    """
    Generate the storage path for the file.
    Private buckets: <user_id>/<generated_filename>
    Public bucket: public/<generated_filename>
    """
    # Generate unique filename with UUID to avoid collisions
    file_stem = str(uuid.uuid4())
    _, ext = os.path.splitext(filename.lower())
    safe_filename = f"{file_stem}{ext}"

    if category == "public":
        return f"public/{safe_filename}"
    else:
        return f"{user_id}/{safe_filename}"


def _extract_public_section_and_name(file_name: str) -> tuple[str, str]:
    if "::" not in file_name:
        return "uncategorized", file_name

    section, display_name = file_name.split("::", 1)
    normalized_section = section.strip().lower()
    cleaned_name = display_name.strip() or file_name

    if normalized_section not in PUBLIC_DOCUMENT_SECTIONS:
        return "uncategorized", file_name

    return normalized_section, cleaned_name


def _get_public_download_url(supabase, *, bucket_name: str, file_path: str) -> str | None:
    try:
        public_url = supabase.storage.from_(bucket_name).get_public_url(path=file_path)
        if isinstance(public_url, dict):
            return public_url.get("publicUrl")
        if isinstance(public_url, str):
            return public_url
    except (AttributeError, TypeError):
        return f"{supabase.storage.url}/object/public/{bucket_name}/{file_path}"
    except Exception as exc:
        logger.warning("Failed to build public download URL for path '%s': %s", file_path, exc)

    return None


def _check_application_ownership(
    supabase, 
    application_id: str,
    user_id: str,
    profile: dict[str, Any],
) -> None:
    """
    Verify that the user owns the application or is an admin.
    Raises HTTPException if not authorized.
    """
    if profile.get("role") == "admin":
        return  # Admin can attach to any application

    # Fetch application and verify ownership
    result = (
        supabase.table("applications")
        .select("applicant_id")
        .eq("id", application_id)
        .limit(1)
        .execute()
    )

    rows = result.data or []
    if not rows:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application '{application_id}' not found",
        )

    app_row = rows[0]
    if str(app_row.get("applicant_id")) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only attach documents to your own applications",
        )


# ===== ENDPOINTS =====

@router.post(
    "/upload",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form(...),
    application_id: str | None = Form(None),
    current_profile: dict[str, Any] = Depends(get_current_profile),
) -> DocumentUploadResponse:
    """
    Upload a document to Supabase storage and record metadata in the database.

    - **file**: The file to upload (multipart/form-data)
    - **category**: Document category (application, profile_photo, evidence, public)
    - **application_id** (optional): UUID of associated application (if applicable)

    Returns the created document metadata.
    """
    user_id = current_profile.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in profile",
        )

    # Validate category-specific constraints
    if application_id and category == "public":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot attach application_id to public documents",
        )
    if category == "profile_photo" and application_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile photos cannot be attached to applications",
        )

    # Only admins can upload to the public bucket
    if category == "public" and current_profile.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can upload to the public bucket",
        )

    # Validate file (extension, MIME type)
    ext, mime_type = _validate_file_upload(file, category)

    # Validate application ownership if application_id is provided
    if application_id:
        supabase = get_supabase_admin()
        _check_application_ownership(supabase, application_id, user_id, current_profile)

    # Generate storage path
    upload_path = _get_upload_path(user_id, category, file.filename)
    bucket_name = CATEGORY_BUCKET_MAPPING[category]

    # Upload to Supabase storage
    supabase = get_supabase_admin()
    try:
        file_content = await file.read()
        
        # Validate actual file size after reading (enforce max_size_bytes from category rules)
        rules = CATEGORY_VALIDATION[category]
        actual_size = len(file_content)
        if actual_size > rules["max_size_bytes"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size {actual_size} bytes exceeds limit of {rules['max_size_bytes']} bytes for category '{category}'",
            )
        
        supabase.storage.from_(bucket_name).upload(
            path=upload_path,
            file=file_content,
            file_options={
                "content-type": mime_type,
                "cache-control": "3600",
            },
        )
        logger.info(
            "Uploaded file to bucket '%s' at path '%s' for user '%s'",
            bucket_name,
            upload_path,
            user_id,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Failed to upload file to bucket '%s': %s",
            bucket_name,
            e,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload file to storage",
        )

    # Insert metadata into documents table
    try:
        doc_id = str(uuid.uuid4())
        result = (
            supabase.table("documents")
            .insert({
                "id": doc_id,
                "application_id": application_id or None,
                "uploaded_by": user_id,
                "file_name": file.filename,
                "file_path": upload_path,
                "file_type": mime_type,
                "file_size": len(file_content),
                "category": category,
                "created_at": datetime.utcnow().isoformat(),
            })
            .execute()
        )
        logger.info(
            "Created document record '%s' for user '%s'",
            doc_id,
            user_id,
        )
    except Exception as e:
        logger.error(
            "Failed to insert document metadata for user '%s': %s",
            user_id,
            e,
        )
        # Attempt to clean up storage; don't fail if this also fails
        try:
            supabase.storage.from_(bucket_name).remove([upload_path])
            logger.info("Cleaned up storage file after metadata insert failure")
        except Exception as cleanup_err:
            logger.warning("Failed to clean up storage file: %s", cleanup_err)

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save document metadata",
        )

    # Parse inserted row
    rows = result.data or []
    if not rows:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Document created but could not retrieve metadata",
        )

    doc_row = rows[0]
    return DocumentUploadResponse(
        id=doc_row["id"],
        application_id=doc_row.get("application_id"),
        uploaded_by=doc_row["uploaded_by"],
        file_name=doc_row["file_name"],
        file_type=doc_row["file_type"],
        file_size=doc_row["file_size"],
        category=doc_row["category"],
        created_at=datetime.fromisoformat(doc_row["created_at"]),
    )


@router.get("/public", response_model=list[PublicDocumentListItem])
async def list_public_documents() -> list[PublicDocumentListItem]:
    """List public documents grouped for website downloads."""
    supabase = get_supabase_admin()

    try:
        result = (
            supabase.table("documents")
            .select("id,file_name,file_path,file_type,file_size,category,created_at")
            .eq("category", "public")
            .order("created_at", desc=True)
            .execute()
        )
    except Exception as exc:
        logger.error("Failed to list public documents: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load public documents",
        )

    items: list[PublicDocumentListItem] = []
    for row in result.data or []:
        file_name = str(row.get("file_name") or "").strip()
        if not file_name:
            continue

        section, display_name = _extract_public_section_and_name(file_name)
        file_path = str(row.get("file_path") or "").strip()

        items.append(
            PublicDocumentListItem(
                id=row["id"],
                file_name=display_name,
                section=section,
                category="public",
                file_type=str(row.get("file_type") or "application/pdf"),
                file_size=int(row.get("file_size") or 0),
                created_at=datetime.fromisoformat(row["created_at"]),
                download_url=_get_public_download_url(
                    supabase,
                    bucket_name=CATEGORY_BUCKET_MAPPING["public"],
                    file_path=file_path,
                ) if file_path else None,
            )
        )

    return items


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    current_profile: dict[str, Any] = Depends(get_current_profile),
) -> DocumentResponse:
    """
    Get document metadata and generate a download URL.

    - Owner can download their own documents
    - Admin can download any document
    - Private buckets return signed download URLs
    - Public bucket returns public URL
    """
    user_id = current_profile.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in profile",
        )

    supabase = get_supabase_admin()

    # Fetch document metadata
    try:
        result = (
            supabase.table("documents")
            .select("*")
            .eq("id", document_id)
            .limit(1)
            .execute()
        )
    except Exception as e:
        logger.error("Failed to query document '%s': %s", document_id, e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve document",
        )

    rows = result.data or []
    if not rows:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document '{document_id}' not found",
        )

    doc_row = rows[0]

    # Check authorization: owner or admin
    uploaded_by = doc_row.get("uploaded_by")
    if uploaded_by != user_id and current_profile.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this document",
        )

    # Generate download URL
    category = doc_row.get("category")
    file_path = doc_row.get("file_path")
    bucket_name = CATEGORY_BUCKET_MAPPING.get(category)

    download_url: str | None = None
    if bucket_name and file_path:
        try:
            if category == "public":
                # Public documents: use Supabase storage helper for public URL
                try:
                    download_url = supabase.storage.from_(bucket_name).get_public_url(path=file_path)
                    if isinstance(download_url, dict):
                        download_url = download_url.get("publicUrl")
                except (AttributeError, TypeError):
                    # Fallback: manually construct public URL if helper not available
                    download_url = f"{supabase.storage.url}/object/public/{bucket_name}/{file_path}"
            else:
                # Private documents: request a signed URL (valid for 1 hour)
                signed_response = supabase.storage.from_(bucket_name).create_signed_url(
                    path=file_path,
                    expires_in=3600,  # 1 hour
                )
                # Handle different return types: string, dict with 'signedURL', or dict with 'SignedURL'
                if isinstance(signed_response, str):
                    download_url = signed_response
                elif isinstance(signed_response, dict):
                    download_url = signed_response.get("signedURL") or signed_response.get("SignedURL")
                # else: download_url remains None if response is unexpected shape
        except Exception as e:
            logger.warning("Failed to generate download URL for document '%s': %s", document_id, e)
            # Don't fail the entire request, just return without URL

    return DocumentResponse(
        id=doc_row["id"],
        application_id=doc_row.get("application_id"),
        uploaded_by=doc_row["uploaded_by"],
        file_name=doc_row["file_name"],
        file_type=doc_row["file_type"],
        file_size=doc_row["file_size"],
        category=doc_row["category"],
        created_at=datetime.fromisoformat(doc_row["created_at"]),
        download_url=download_url,
    )


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: str,
    current_profile: dict[str, Any] = Depends(get_current_profile),
) -> None:
    """
    Delete a document from storage and remove its metadata.

    - Owner only: only the user who uploaded the document can delete it
    - Storage is deleted first; if successful, the database record is then deleted
    - If storage deletion fails, the database row remains intact
    - If storage succeeds but database deletion fails, returns 500 and logs the inconsistency
    """
    user_id = current_profile.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in profile",
        )

    supabase = get_supabase_admin()

    # Fetch document metadata
    try:
        result = (
            supabase.table("documents")
            .select("*")
            .eq("id", document_id)
            .limit(1)
            .execute()
        )
    except Exception as e:
        logger.error("Failed to query document '%s': %s", document_id, e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve document for deletion",
        )

    rows = result.data or []
    if not rows:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document '{document_id}' not found",
        )

    doc_row = rows[0]

    # Check authorization: owner only
    uploaded_by = doc_row.get("uploaded_by")
    if uploaded_by != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own documents",
        )

    file_path = doc_row.get("file_path")
    category = doc_row.get("category")
    bucket_name = CATEGORY_BUCKET_MAPPING.get(category)

    # Delete from storage first (prioritize data integrity in storage)
    if bucket_name and file_path:
        try:
            supabase.storage.from_(bucket_name).remove([file_path])
            logger.info("Deleted file from bucket '%s' at path '%s'", bucket_name, file_path)
        except Exception as e:
            logger.error(
                "Failed to delete file from storage (bucket '%s', path '%s'): %s. Database row not deleted.",
                bucket_name,
                file_path,
                e,
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete file from storage",
            )

    # Delete from database
    try:
        supabase.table("documents").delete().eq("id", document_id).execute()
        logger.info("Deleted document record '%s'", document_id)
    except Exception as e:
        logger.error(
            "Failed to delete document record '%s' after successful storage deletion: %s. Inconsistency: file gone but DB row remains.",
            document_id,
            e,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete document metadata (file was already removed from storage)",
        )

    return None

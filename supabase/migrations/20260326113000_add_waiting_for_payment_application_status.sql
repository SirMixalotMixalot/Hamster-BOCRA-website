alter table public.applications
  drop constraint if exists applications_status_check;

alter table public.applications
  add constraint applications_status_check check (
    status in (
      'draft',
      'submitted',
      'under_review',
      'waiting_for_payment',
      'approved',
      'rejected',
      'requires_action'
    )
  );

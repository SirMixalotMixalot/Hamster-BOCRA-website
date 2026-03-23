begin;

do $$
begin
  if to_regprocedure('public.is_admin(uuid)') is null then
    raise exception 'Expected helper function public.is_admin(uuid) to exist before applying RLS policies';
  end if;
end $$;

alter table public.applications enable row level security;
alter table public.application_status_log enable row level security;
alter table public.documents enable row level security;
alter table public.complaints enable row level security;
alter table public.complaint_status_log enable row level security;
alter table public.payments enable row level security;
alter table public.news enable row level security;
alter table public.telecom_stats enable row level security;
alter table public.regulatory_decisions enable row level security;
alter table public.support_tickets enable row level security;
alter table public.audit_log enable row level security;

drop policy if exists applications_select_own on public.applications;
drop policy if exists applications_insert_own on public.applications;
drop policy if exists applications_update_own on public.applications;
drop policy if exists applications_delete_own on public.applications;
drop policy if exists applications_admin_select_all on public.applications;
drop policy if exists applications_admin_update_all on public.applications;

create policy applications_select_own
on public.applications
for select
to authenticated
using (applicant_id = auth.uid());

create policy applications_insert_own
on public.applications
for insert
to authenticated
with check (applicant_id = auth.uid());

drop policy if exists applications_update_own on public.applications;

create policy applications_update_own
on public.applications
for update
to authenticated
using (applicant_id = auth.uid() and status = 'draft')
with check (applicant_id = auth.uid() and status = 'draft');

drop policy if exists applications_delete_own on public.applications;

create policy applications_delete_own
on public.applications
for delete
to authenticated
using (applicant_id = auth.uid() and status = 'draft');

create policy applications_admin_select_all
on public.applications
for select
to authenticated
using (public.is_admin(auth.uid()));

create policy applications_admin_update_all
on public.applications
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists application_status_log_select_own on public.application_status_log;
drop policy if exists application_status_log_admin_select_all on public.application_status_log;
drop policy if exists application_status_log_admin_insert on public.application_status_log;

create policy application_status_log_select_own
on public.application_status_log
for select
to authenticated
using (
  exists (
    select 1
    from public.applications a
    where a.id = application_status_log.application_id
      and a.applicant_id = auth.uid()
  )
);

create policy application_status_log_admin_select_all
on public.application_status_log
for select
to authenticated
using (public.is_admin(auth.uid()));

create policy application_status_log_admin_insert
on public.application_status_log
for insert
to authenticated
with check (public.is_admin(auth.uid()));

drop policy if exists documents_select_own on public.documents;
drop policy if exists documents_insert_own on public.documents;
drop policy if exists documents_admin_select_all on public.documents;
drop policy if exists documents_delete_own on public.documents;

create policy documents_select_own
on public.documents
for select
to authenticated
using (
  uploaded_by = auth.uid()
  or exists (
    select 1
    from public.applications a
    where a.id = documents.application_id
      and a.applicant_id = auth.uid()
  )
);

create policy documents_insert_own
on public.documents
for insert
to authenticated
with check (
  uploaded_by = auth.uid()
  and (
    application_id is null
    or exists (
      select 1
      from public.applications a
      where a.id = documents.application_id
        and a.applicant_id = auth.uid()
    )
  )
);

create policy documents_admin_select_all
on public.documents
for select
to authenticated
using (public.is_admin(auth.uid()));

create policy documents_delete_own
on public.documents
for delete
to authenticated
using (
  uploaded_by = auth.uid()
  or public.is_admin(auth.uid())
);

drop policy if exists complaints_select_own on public.complaints;
drop policy if exists complaints_insert_own on public.complaints;
drop policy if exists complaints_admin_select_all on public.complaints;
drop policy if exists complaints_admin_update_all on public.complaints;

create policy complaints_select_own
on public.complaints
for select
to authenticated
using (complainant_id = auth.uid());

create policy complaints_insert_own
on public.complaints
for insert
to authenticated
with check (complainant_id = auth.uid());

create policy complaints_admin_select_all
on public.complaints
for select
to authenticated
using (public.is_admin(auth.uid()));

create policy complaints_admin_update_all
on public.complaints
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists complaint_status_log_select_own on public.complaint_status_log;
drop policy if exists complaint_status_log_admin_select_all on public.complaint_status_log;
drop policy if exists complaint_status_log_admin_insert on public.complaint_status_log;

create policy complaint_status_log_select_own
on public.complaint_status_log
for select
to authenticated
using (
  exists (
    select 1
    from public.complaints c
    where c.id = complaint_status_log.complaint_id
      and c.complainant_id = auth.uid()
  )
);

create policy complaint_status_log_admin_select_all
on public.complaint_status_log
for select
to authenticated
using (public.is_admin(auth.uid()));

create policy complaint_status_log_admin_insert
on public.complaint_status_log
for insert
to authenticated
with check (public.is_admin(auth.uid()));

drop policy if exists payments_select_own on public.payments;
drop policy if exists payments_admin_select_all on public.payments;

create policy payments_select_own
on public.payments
for select
to authenticated
using (payer_id = auth.uid());

create policy payments_admin_select_all
on public.payments
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists news_public_read_published on public.news;
drop policy if exists news_admin_insert on public.news;
drop policy if exists news_admin_update on public.news;
drop policy if exists news_admin_delete on public.news;

create policy news_public_read_published
on public.news
for select
to anon, authenticated
using (published = true);

create policy news_admin_insert
on public.news
for insert
to authenticated
with check (public.is_admin(auth.uid()));

create policy news_admin_update
on public.news
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy news_admin_delete
on public.news
for delete
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists telecom_stats_public_read on public.telecom_stats;
drop policy if exists telecom_stats_admin_insert on public.telecom_stats;
drop policy if exists telecom_stats_admin_update on public.telecom_stats;
drop policy if exists telecom_stats_admin_delete on public.telecom_stats;

create policy telecom_stats_public_read
on public.telecom_stats
for select
to anon, authenticated
using (true);

create policy telecom_stats_admin_insert
on public.telecom_stats
for insert
to authenticated
with check (public.is_admin(auth.uid()));

create policy telecom_stats_admin_update
on public.telecom_stats
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy telecom_stats_admin_delete
on public.telecom_stats
for delete
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists regulatory_decisions_public_read on public.regulatory_decisions;
drop policy if exists regulatory_decisions_admin_insert on public.regulatory_decisions;
drop policy if exists regulatory_decisions_admin_update on public.regulatory_decisions;
drop policy if exists regulatory_decisions_admin_delete on public.regulatory_decisions;

create policy regulatory_decisions_public_read
on public.regulatory_decisions
for select
to anon, authenticated
using (is_public = true);

create policy regulatory_decisions_admin_insert
on public.regulatory_decisions
for insert
to authenticated
with check (public.is_admin(auth.uid()));

create policy regulatory_decisions_admin_update
on public.regulatory_decisions
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy regulatory_decisions_admin_delete
on public.regulatory_decisions
for delete
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists support_tickets_select_own on public.support_tickets;
drop policy if exists support_tickets_insert_own on public.support_tickets;
drop policy if exists support_tickets_admin_select_all on public.support_tickets;
drop policy if exists support_tickets_admin_update_all on public.support_tickets;

create policy support_tickets_select_own
on public.support_tickets
for select
to authenticated
using (customer_id = auth.uid());

create policy support_tickets_insert_own
on public.support_tickets
for insert
to authenticated
with check (customer_id = auth.uid());

create policy support_tickets_admin_select_all
on public.support_tickets
for select
to authenticated
using (public.is_admin(auth.uid()));

create policy support_tickets_admin_update_all
on public.support_tickets
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists audit_log_admin_read_all on public.audit_log;
drop policy if exists audit_log_admin_insert on public.audit_log;

-- audit_log inserts should happen through backend/system flow using
-- a server-side Supabase key, not through client-authenticated sessions.

create policy audit_log_admin_read_all
on public.audit_log
for select
to authenticated
using (public.is_admin(auth.uid()));

commit;

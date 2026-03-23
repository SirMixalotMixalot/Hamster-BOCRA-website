begin;

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  reference_number text unique,
  licence_type text,
  status text not null default 'draft',
  form_data_a jsonb,
  form_data_b jsonb,
  form_data_c jsonb,
  form_data_d jsonb,
  admin_notes text,
  decision_reason text,
  decided_by uuid references public.profiles(id),
  decided_at timestamptz,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint applications_status_check check (
    status in ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'needs_info')
  )
);

create table public.application_status_log (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  old_status text,
  new_status text,
  changed_by uuid references public.profiles(id),
  reason text,
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.applications(id) on delete set null,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_type text,
  file_size bigint,
  category text,
  created_at timestamptz not null default now()
);

create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  complainant_id uuid not null references public.profiles(id) on delete cascade,
  reference_number text unique,
  subject text not null,
  category text,
  description text not null,
  status text not null default 'open',
  admin_response text,
  evidence_file_ids uuid[],
  resolved_by uuid references public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint complaints_status_check check (
    status in ('open', 'in_progress', 'resolved', 'closed')
  )
);

create table public.complaint_status_log (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  old_status text,
  new_status text,
  changed_by uuid references public.profiles(id),
  note text,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  payer_id uuid not null references public.profiles(id) on delete cascade,
  stripe_payment_id text,
  amount numeric,
  currency text not null default 'BWP',
  status text,
  receipt_url text,
  created_at timestamptz not null default now(),
  constraint payments_status_check check (
    status is null or status in ('pending', 'succeeded', 'failed', 'refunded', 'canceled')
  )
);

create table public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  content text,
  tag text,
  published boolean not null default false,
  author_id uuid references public.profiles(id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.telecom_stats (
  id uuid primary key default gen_random_uuid(),
  metric_name text not null,
  value numeric,
  unit text,
  period text,
  sector text,
  source text,
  created_at timestamptz not null default now()
);

create table public.regulatory_decisions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  decision_type text,
  document_url text,
  is_public boolean not null default true,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null,
  category text,
  message text not null,
  attachment_ids uuid[],
  status text not null default 'open',
  admin_reply text,
  replied_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint support_tickets_status_check check (
    status in ('open', 'in_progress', 'resolved', 'closed')
  )
);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  action text not null,
  resource_type text not null,
  resource_id uuid,
  ip_address text,
  details jsonb,
  created_at timestamptz not null default now()
);

alter table public.applications
  drop constraint if exists applications_status_check;

alter table public.applications
  add constraint applications_status_check check (
    status in ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'requires_action')
  );

alter table public.complaints
  drop constraint if exists complaints_status_check;

alter table public.complaints
  add constraint complaints_status_check check (
    status in ('open', 'investigating', 'resolved', 'closed')
  );

alter table public.support_tickets
  drop constraint if exists support_tickets_status_check;

alter table public.support_tickets
  add constraint support_tickets_status_check check (
    status in ('open', 'replied', 'closed')
  );

alter table public.payments
  drop constraint if exists payments_amount_non_negative;

alter table public.payments
  add constraint payments_amount_non_negative check (
    amount is null or amount >= 0
  );

create index if not exists idx_applications_applicant_id on public.applications(applicant_id);
create index if not exists idx_applications_decided_by on public.applications(decided_by);
create index if not exists idx_applications_status on public.applications(status);
create index if not exists idx_applications_submitted_at on public.applications(submitted_at);
create index if not exists idx_applications_reference_number on public.applications(reference_number);

create index if not exists idx_application_status_log_application_id on public.application_status_log(application_id);
create index if not exists idx_application_status_log_changed_by on public.application_status_log(changed_by);
create index if not exists idx_application_status_log_created_at on public.application_status_log(created_at);

create index if not exists idx_documents_application_id on public.documents(application_id);
create index if not exists idx_documents_uploaded_by on public.documents(uploaded_by);
create index if not exists idx_documents_category on public.documents(category);

create index if not exists idx_complaints_complainant_id on public.complaints(complainant_id);
create index if not exists idx_complaints_resolved_by on public.complaints(resolved_by);
create index if not exists idx_complaints_status on public.complaints(status);
create index if not exists idx_complaints_reference_number on public.complaints(reference_number);

create index if not exists idx_complaint_status_log_complaint_id on public.complaint_status_log(complaint_id);
create index if not exists idx_complaint_status_log_changed_by on public.complaint_status_log(changed_by);
create index if not exists idx_complaint_status_log_created_at on public.complaint_status_log(created_at);

create index if not exists idx_payments_application_id on public.payments(application_id);
create index if not exists idx_payments_payer_id on public.payments(payer_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_stripe_payment_id on public.payments(stripe_payment_id);

create index if not exists idx_news_published on public.news(published);
create index if not exists idx_news_published_at on public.news(published_at);
create index if not exists idx_news_author_id on public.news(author_id);

create index if not exists idx_telecom_stats_metric_name on public.telecom_stats(metric_name);
create index if not exists idx_telecom_stats_period on public.telecom_stats(period);
create index if not exists idx_telecom_stats_sector on public.telecom_stats(sector);

create index if not exists idx_regulatory_decisions_is_public on public.regulatory_decisions(is_public);
create index if not exists idx_regulatory_decisions_decided_at on public.regulatory_decisions(decided_at);

create index if not exists idx_support_tickets_customer_id on public.support_tickets(customer_id);
create index if not exists idx_support_tickets_replied_by on public.support_tickets(replied_by);
create index if not exists idx_support_tickets_status on public.support_tickets(status);

create index if not exists idx_audit_log_user_id on public.audit_log(user_id);
create index if not exists idx_audit_log_resource on public.audit_log(resource_type, resource_id);
create index if not exists idx_audit_log_created_at on public.audit_log(created_at);

drop trigger if exists set_applications_updated_at on public.applications;
create trigger set_applications_updated_at
before update on public.applications
for each row execute procedure public.set_profiles_updated_at();

drop trigger if exists set_complaints_updated_at on public.complaints;
create trigger set_complaints_updated_at
before update on public.complaints
for each row execute procedure public.set_profiles_updated_at();

drop trigger if exists set_news_updated_at on public.news;
create trigger set_news_updated_at
before update on public.news
for each row execute procedure public.set_profiles_updated_at();

drop trigger if exists set_support_tickets_updated_at on public.support_tickets;
create trigger set_support_tickets_updated_at
before update on public.support_tickets
for each row execute procedure public.set_profiles_updated_at();

commit;

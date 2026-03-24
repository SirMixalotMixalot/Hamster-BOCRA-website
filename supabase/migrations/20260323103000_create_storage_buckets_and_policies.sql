begin;

do $$
begin
  if to_regprocedure('public.is_admin(uuid)') is null then
    raise exception 'Expected helper function public.is_admin(uuid) to exist before applying storage policies';
  end if;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'application-documents',
    'application-documents',
    false,
    10485760,
    array['application/pdf', 'image/jpeg', 'image/png']
  ),
  (
    'profile-photos',
    'profile-photos',
    false,
    5242880,
    array['image/jpeg', 'image/png']
  ),
  (
    'evidence-uploads',
    'evidence-uploads',
    false,
    10485760,
    array['application/pdf', 'image/jpeg', 'image/png', 'video/mp4']
  ),
  (
    'public-documents',
    'public-documents',
    true,
    20971520,
    array['application/pdf']
  )
on conflict (id)
do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  -- In hosted Supabase, this may require table ownership. Skip if not permitted.
  begin
    alter table storage.objects enable row level security;
  exception
    when insufficient_privilege then
      raise notice 'Skipping enable RLS on storage.objects: insufficient privilege (RLS is normally managed by Supabase)';
  end;
end $$;

-- Remove prior storage policies to keep this migration idempotent.
drop policy if exists private_buckets_owner_read on storage.objects;
drop policy if exists private_buckets_owner_insert on storage.objects;
drop policy if exists private_buckets_owner_update on storage.objects;
drop policy if exists private_buckets_owner_delete on storage.objects;
drop policy if exists private_buckets_admin_read_all on storage.objects;
drop policy if exists private_buckets_admin_update_all on storage.objects;
drop policy if exists private_buckets_admin_delete_all on storage.objects;
drop policy if exists public_documents_read_all on storage.objects;
drop policy if exists public_documents_admin_insert on storage.objects;
drop policy if exists public_documents_admin_update on storage.objects;
drop policy if exists public_documents_admin_delete on storage.objects;

create policy private_buckets_owner_read
on storage.objects
for select
to authenticated
using (
  bucket_id in ('application-documents', 'profile-photos', 'evidence-uploads')
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy private_buckets_owner_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('application-documents', 'profile-photos', 'evidence-uploads')
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy private_buckets_owner_update
on storage.objects
for update
to authenticated
using (
  bucket_id in ('application-documents', 'profile-photos', 'evidence-uploads')
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id in ('application-documents', 'profile-photos', 'evidence-uploads')
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy private_buckets_owner_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id in ('application-documents', 'profile-photos', 'evidence-uploads')
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy private_buckets_admin_read_all
on storage.objects
for select
to authenticated
using (
  bucket_id in ('application-documents', 'profile-photos', 'evidence-uploads')
  and public.is_admin(auth.uid())
);

create policy private_buckets_admin_update_all
on storage.objects
for update
to authenticated
using (
  bucket_id in ('application-documents', 'profile-photos', 'evidence-uploads')
  and public.is_admin(auth.uid())
)
with check (
  bucket_id in ('application-documents', 'profile-photos', 'evidence-uploads')
  and public.is_admin(auth.uid())
);

create policy private_buckets_admin_delete_all
on storage.objects
for delete
to authenticated
using (
  bucket_id in ('application-documents', 'profile-photos', 'evidence-uploads')
  and public.is_admin(auth.uid())
);

create policy public_documents_read_all
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'public-documents');

create policy public_documents_admin_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'public-documents'
  and public.is_admin(auth.uid())
);

create policy public_documents_admin_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'public-documents'
  and public.is_admin(auth.uid())
)
with check (
  bucket_id = 'public-documents'
  and public.is_admin(auth.uid())
);

create policy public_documents_admin_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'public-documents'
  and public.is_admin(auth.uid())
);

commit;

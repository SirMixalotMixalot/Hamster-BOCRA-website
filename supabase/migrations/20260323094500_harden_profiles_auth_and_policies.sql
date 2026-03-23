-- Ensure profiles schema matches backend auth requirements.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer',
  full_name text,
  id_number text,
  gender text,
  date_of_birth date,
  phone text,
  address text,
  profile_photo_url text,
  consent_given boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists role text,
  add column if not exists full_name text,
  add column if not exists id_number text,
  add column if not exists gender text,
  add column if not exists date_of_birth date,
  add column if not exists phone text,
  add column if not exists address text,
  add column if not exists profile_photo_url text,
  add column if not exists consent_given boolean,
  add column if not exists created_at timestamptz,
  add column if not exists updated_at timestamptz;

alter table public.profiles
  alter column role set default 'customer',
  alter column consent_given set default false,
  alter column created_at set default now(),
  alter column updated_at set default now();

update public.profiles
set role = coalesce(role, 'customer'),
    consent_given = coalesce(consent_given, false),
    created_at = coalesce(created_at, now()),
    updated_at = coalesce(updated_at, now())
where role is null
   or consent_given is null
   or created_at is null
   or updated_at is null;

alter table public.profiles
  alter column role set not null,
  alter column consent_given set not null,
  alter column created_at set not null,
  alter column updated_at set not null;

alter table public.profiles enable row level security;

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id and role = 'admin'
  );
$$;

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists profiles_admin_read_all on public.profiles;

create policy profiles_select_own
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy profiles_update_own
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy profiles_admin_read_all
on public.profiles
for select
to authenticated
using (public.is_admin(auth.uid()));

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_profiles_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role, consent_given)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    'customer',
    false
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

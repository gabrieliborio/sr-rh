-- Role structure kept ready for future expansion.
-- Today every authenticated user has full access (see RLS migration) — nothing
-- here restricts by role yet, it only gives us a place to plug that in later.

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

insert into public.roles (name, description) values
  ('rh_admin', 'Equipe de RH com acesso total ao sistema');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role_id uuid references public.roles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile (defaulted to rh_admin) whenever a new Supabase Auth
-- user is created. RH adds new logins directly in the Supabase Auth dashboard.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role_id)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    (select id from public.roles where name = 'rh_admin')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

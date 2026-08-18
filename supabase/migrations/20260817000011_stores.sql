-- Stores and their licenses. License status is never stored (it would go
-- stale) — it is computed on read via v_store_licenses.

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  cnpj text,
  phone text,
  opened_at date
);

create type public.store_license_type_enum as enum (
  'certificado_conformidade', 'alvara_funcionamento', 'licenca_sanitaria'
);

create table public.store_licenses (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  type public.store_license_type_enum not null,
  file_url text,
  issue_date date,
  expiry_date date,
  created_at timestamptz not null default now()
);

create index store_licenses_store_id_idx on public.store_licenses (store_id);

create view public.v_store_licenses as
select
  sl.*,
  case
    when sl.expiry_date is null then 'sem_validade'
    when sl.expiry_date < current_date then 'vencido'
    when sl.expiry_date <= current_date + 30 then 'vencendo_em_breve'
    else 'valido'
  end as status
from public.store_licenses sl;

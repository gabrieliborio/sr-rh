-- Configurable per-unit discount rates (never hardcoded), and medical
-- certificates whose discount is calculated from them but only ever applied
-- to payroll manually by RH.

create type public.benefit_type_enum as enum ('vt', 'alimentacao');

-- unit = NULL means "default rate for the benefit type, used when no
-- unit-specific row exists". Today: VT has a Fortaleza-wide default plus
-- overrides for Caucaia and Maracanaú; Alimentação has a single default
-- that applies to every unit.
create table public.benefit_discount_rates (
  id uuid primary key default gen_random_uuid(),
  benefit_type public.benefit_type_enum not null,
  unit public.unit_enum,
  daily_rate numeric(10, 2) not null,
  updated_at timestamptz not null default now(),
  unique (benefit_type, unit)
);

create trigger set_benefit_discount_rates_updated_at
  before update on public.benefit_discount_rates
  for each row execute function public.set_updated_at();

insert into public.benefit_discount_rates (benefit_type, unit, daily_rate) values
  ('vt', null, 11.00),
  ('vt', 'Caucaia', 9.60),
  ('vt', 'Maracanaú', 11.60),
  ('alimentacao', null, 14.10);

create table public.medical_certificates (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  start_date date not null,
  end_date date not null,
  days_count integer not null,
  attachment_url text,
  discount_calculated boolean not null default false,
  discount_applied boolean not null default false,
  vt_discount_value numeric(10, 2) not null default 0,
  meal_discount_value numeric(10, 2) not null default 0,
  total_discount_value numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index medical_certificates_employee_id_idx on public.medical_certificates (employee_id);

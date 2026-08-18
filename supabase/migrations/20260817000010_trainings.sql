-- Training catalog and per-employee attendance/certificate records.

create table public.trainings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  default_workload_hours numeric(5, 2)
);

create table public.training_attendances (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  training_id uuid not null references public.trainings (id),
  attended boolean not null default true,
  training_date date not null,
  workload_hours numeric(5, 2),
  signed_by_name text,
  signed_by_role text,
  certificate_code text unique,
  certificate_pdf_url text,
  created_at timestamptz not null default now()
);

create index training_attendances_employee_id_idx on public.training_attendances (employee_id);
create index training_attendances_training_id_idx on public.training_attendances (training_id);

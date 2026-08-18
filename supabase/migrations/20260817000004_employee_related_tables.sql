-- Satellite tables attached to an employee's file.

-- Document type is intentionally free text (not a Postgres enum) so RH can
-- use whatever label makes sense without a code change/migration.
create table public.employee_documents (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  file_name text not null,
  google_drive_file_id text not null,
  google_drive_url text not null,
  document_type text not null default 'outro',
  uploaded_at timestamptz not null default now()
);

create index employee_documents_employee_id_idx on public.employee_documents (employee_id);

create table public.uniform_history (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  sent_date date not null,
  notes text
);

create index uniform_history_employee_id_idx on public.uniform_history (employee_id);

create type public.disciplinary_status_enum as enum ('suspensao', 'advertencia');

create table public.disciplinary_records (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  reason text not null,
  status public.disciplinary_status_enum not null,
  start_date date not null,
  end_date date,
  attachment_url text
);

create index disciplinary_records_employee_id_idx on public.disciplinary_records (employee_id);

create table public.onboarding (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  completed boolean not null default false,
  completed_date date,
  notes text
);

create unique index onboarding_employee_id_key on public.onboarding (employee_id);

create table public.negotiations (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  description text not null,
  agreement_date date not null,
  attachment_url text,
  notes text
);

create index negotiations_employee_id_idx on public.negotiations (employee_id);

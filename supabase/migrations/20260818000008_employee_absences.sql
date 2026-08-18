create table public.employee_absences (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  date date not null,
  justified boolean not null default false,
  reason text,
  created_at timestamptz not null default now()
);

create index employee_absences_employee_id_idx on public.employee_absences (employee_id);
create index employee_absences_date_idx on public.employee_absences (date);

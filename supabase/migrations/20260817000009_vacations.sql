create table public.vacations (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  start_date date not null,
  end_date date not null,
  paid boolean not null default false,
  negotiated boolean not null default false,
  notes text
);

create index vacations_employee_id_idx on public.vacations (employee_id);
create index vacations_start_date_idx on public.vacations (start_date);

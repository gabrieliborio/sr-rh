-- Core `employees` table plus its fixed enums.

create type public.unit_enum as enum (
  'Adm', 'Aldeota', 'Caucaia', 'Centro', 'Jóquei', 'Maracanaú',
  'Messejana', 'North Shopping', 'Parangaba', 'Rio Mar', 'Digital'
);

create type public.employee_status_enum as enum (
  'ativo', 'ferias', 'afastado', 'desligado'
);

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cpf text not null unique,
  employee_number text not null unique,
  birth_date date,
  hire_date date not null,
  admission_exam_date date,
  status public.employee_status_enum not null default 'ativo',
  unit public.unit_enum not null,
  role text,
  current_salary numeric(12, 2),
  manager_id uuid references public.employees (id),
  notes text,
  has_hapvida boolean not null default false,
  has_ifood boolean not null default false,
  has_wellhub boolean not null default false,
  full_registration_complete boolean not null default false,
  -- Derived evaluation-window dates, used by the UI to badge
  -- "em período de avaliação (30/90 dias)" vs hire_date.
  evaluation_30_date date generated always as (hire_date + 30) stored,
  evaluation_90_date date generated always as (hire_date + 90) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index employees_unit_idx on public.employees (unit);
create index employees_status_idx on public.employees (status);
create index employees_manager_id_idx on public.employees (manager_id);

create trigger set_employees_updated_at
  before update on public.employees
  for each row execute function public.set_updated_at();

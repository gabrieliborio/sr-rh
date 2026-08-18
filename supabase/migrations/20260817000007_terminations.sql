-- Termination flow. `employees.status` is only moved to 'desligado' once
-- `form_completed = true` — enforced in the application layer (server action),
-- since it involves conditionally-required Drive attachments (resignation
-- letter, exam) that are simplest to validate outside the database.

create type public.termination_requested_by_enum as enum ('empresa', 'funcionario');

create table public.terminations (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  notice_period_fulfilled boolean not null default false,
  termination_reason text,
  just_cause boolean not null default false,
  requested_by public.termination_requested_by_enum not null,
  resignation_letter_url text,
  termination_exam_done boolean not null default false,
  termination_exam_url text,
  agreement_notes text,
  form_completed boolean not null default false,
  termination_date date,
  created_at timestamptz not null default now(),
  constraint resignation_letter_required_when_employee_requested check (
    requested_by <> 'funcionario' or resignation_letter_url is not null
  ),
  constraint termination_exam_url_required_when_done check (
    termination_exam_done = false or termination_exam_url is not null
  )
);

create index terminations_employee_id_idx on public.terminations (employee_id);

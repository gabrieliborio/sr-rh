-- Recruitment pipeline. `current_stage` is free text (the hiring stages vary
-- per role/manager and shouldn't require a migration to relabel).

create type public.candidate_status_enum as enum (
  'em_andamento', 'aprovado', 'reprovado', 'contratado', 'desistiu'
);

create table public.candidates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  role_applied text,
  resume_url text,
  current_stage text not null default 'triagem',
  status public.candidate_status_enum not null default 'em_andamento',
  rejection_stage text,
  rejection_reason text,
  hired_employee_id uuid references public.employees (id),
  notes text,
  created_at timestamptz not null default now()
);

create index candidates_status_idx on public.candidates (status);

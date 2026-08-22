-- Redesigns "trainings" from a flat table (one row per attendee per
-- session, with session-level fields like date/workload/instructor
-- duplicated across every attendee) into catalog + session + roster:
--   trainings            -- reusable type/template (unchanged)
--   training_sessions    -- one row per real-world dated occurrence
--   training_attendances -- one row per (session, employee): just the
--                           roster + attendance flag + certificate
-- This lets RH create a session once, then fill out a fast checklist of
-- who attended, instead of repeating date/workload/instructor per person.

create table public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references public.trainings (id),
  session_date date not null,
  workload_hours numeric(5, 2),
  instructor_name text,
  instructor_role text,
  topics_covered text,
  created_at timestamptz not null default now()
);

create index training_sessions_training_id_idx on public.training_sessions (training_id);
create index training_sessions_session_date_idx on public.training_sessions (session_date desc);

-- Backfill: existing training_attendances rows carry session-level data
-- redundantly per attendee. Group rows that share every session-level
-- field into one session (this is exactly the real-world session they
-- described). If the table is empty today, this is a no-op.
insert into public.training_sessions (training_id, session_date, workload_hours, instructor_name, instructor_role, created_at)
select training_id, training_date, workload_hours, signed_by_name, signed_by_role, min(created_at)
from public.training_attendances
group by training_id, training_date, workload_hours, signed_by_name, signed_by_role;

do $$
declare
  session_count integer;
  attendance_count integer;
begin
  select count(*) into session_count from public.training_sessions;
  select count(*) into attendance_count from public.training_attendances;
  if attendance_count > 0 then
    raise notice 'Backfilled % training_sessions row(s) from % existing training_attendances row(s). If two distinct real sessions happened to share the same training/date/workload/instructor, they were merged into one — spot-check training_sessions manually.', session_count, attendance_count;
  end if;
end $$;

alter table public.training_attendances
  add column session_id uuid references public.training_sessions (id) on delete cascade;

update public.training_attendances ta
set session_id = ts.id
from public.training_sessions ts
where ta.training_id = ts.training_id
  and ta.training_date = ts.session_date
  and ta.workload_hours is not distinct from ts.workload_hours
  and ta.signed_by_name is not distinct from ts.instructor_name
  and ta.signed_by_role is not distinct from ts.instructor_role;

do $$
declare
  unmatched integer;
begin
  select count(*) into unmatched from public.training_attendances where session_id is null;
  if unmatched > 0 then
    raise notice '% training_attendances row(s) could not be matched to a backfilled session — investigate before session_id becomes NOT NULL.', unmatched;
  end if;
end $$;

alter table public.training_attendances alter column session_id set not null;

alter table public.training_attendances drop column training_id;
alter table public.training_attendances drop column training_date;
alter table public.training_attendances drop column workload_hours;
alter table public.training_attendances drop column signed_by_name;
alter table public.training_attendances drop column signed_by_role;
alter table public.training_attendances drop column certificate_pdf_url; -- dead: never written by app code

-- One roster row per (session, employee) — the ON CONFLICT target the
-- bulk-checklist save action upserts against, so re-saving mid-session
-- (RH checking people off as they arrive) never errors on duplicates.
alter table public.training_attendances
  add constraint training_attendances_session_employee_key unique (session_id, employee_id);

-- Fix existing bug: certificate_code was generated unconditionally on
-- insert, even for attended = false rows. Clean up any such rows before
-- adding a constraint that would otherwise reject them.
do $$
declare
  cleared integer;
begin
  update public.training_attendances set certificate_code = null where not attended and certificate_code is not null;
  get diagnostics cleared = row_count;
  if cleared > 0 then
    raise notice 'Cleared certificate_code on % training_attendances row(s) marked attended = false.', cleared;
  end if;
end $$;

alter table public.training_attendances
  add constraint training_attendances_certificate_requires_attendance check (certificate_code is null or attended);

create index training_attendances_session_id_idx on public.training_attendances (session_id);

-- One row per session with roster counts, for the /treinamentos list page.
create view public.v_training_sessions as
select
  ts.*,
  t.name as training_name,
  count(ta.id) filter (where ta.attended) as attended_count,
  count(ta.id) as roster_count
from public.training_sessions ts
join public.trainings t on t.id = ts.training_id
left join public.training_attendances ta on ta.session_id = ts.id
group by ts.id, t.name;

alter view public.v_training_sessions set (security_invoker = on);

alter table public.training_sessions enable row level security;
create policy training_sessions_authenticated_full_access
  on public.training_sessions for all to authenticated using (true) with check (true);

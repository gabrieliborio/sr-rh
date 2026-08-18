-- Tracks which store an employee was at, and when — needed to resolve the
-- correct VT/meal rate for a past event (certificate, absence, vacation)
-- even after the employee has since transferred stores. Maintained
-- automatically by a trigger rather than app code, so it stays correct
-- regardless of which code path changes `employees.store_id`.

create table public.employee_store_history (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  store_id uuid not null references public.stores (id),
  start_date date not null,
  end_date date,
  created_at timestamptz not null default now()
);

create index employee_store_history_employee_id_idx on public.employee_store_history (employee_id);
create index employee_store_history_store_id_idx on public.employee_store_history (store_id);
-- At most one open-ended (current) history row per employee.
create unique index employee_store_history_one_open_row on public.employee_store_history (employee_id) where end_date is null;

create or replace function public.handle_employee_store_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.employee_store_history (employee_id, store_id, start_date)
    values (new.id, new.store_id, new.hire_date);
  elsif tg_op = 'UPDATE' and new.store_id is distinct from old.store_id then
    update public.employee_store_history
    set end_date = greatest(current_date - 1, start_date)
    where employee_id = new.id and end_date is null;

    insert into public.employee_store_history (employee_id, store_id, start_date)
    values (new.id, new.store_id, current_date);
  end if;
  return new;
end;
$$;

create trigger employees_store_history
  after insert or update on public.employees
  for each row execute function public.handle_employee_store_change();

-- Backfill one open history row for any employee that already existed
-- before this migration (no-op today since there are none).
insert into public.employee_store_history (employee_id, store_id, start_date)
select id, store_id, hire_date
from public.employees e
where not exists (
  select 1 from public.employee_store_history h where h.employee_id = e.id
);

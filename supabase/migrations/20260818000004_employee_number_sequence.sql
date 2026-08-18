-- employee_number moves from manual entry to system-generated (SRO-0001,
-- SRO-0002, ...). The sequence (not a max()+1 lookup) is what makes this
-- safe under concurrent inserts. Employees that already have a number keep
-- it — the trigger only fills the value in when the app doesn't supply one.

create sequence if not exists public.employees_number_seq start 1;

-- Seed the sequence past any existing "SRO-####" numbers so it never
-- collides with manually-entered history.
do $$
declare
  max_num integer;
begin
  select coalesce(max((regexp_match(employee_number, '^SRO-(\d+)$'))[1]::integer), 0)
  into max_num
  from public.employees
  where employee_number ~ '^SRO-\d+$';

  perform setval('public.employees_number_seq', max_num + 1, false);
end $$;

create or replace function public.set_employee_number()
returns trigger
language plpgsql
as $$
begin
  if new.employee_number is null or new.employee_number = '' then
    new.employee_number := 'SRO-' || lpad(nextval('public.employees_number_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

create trigger set_employees_employee_number
  before insert on public.employees
  for each row execute function public.set_employee_number();

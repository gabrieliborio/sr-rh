-- `unit` (fixed enum) and `manager_id` (set directly on the employee) move
-- to being derived from the store. This migration is written to be safe to
-- run against real data (per the request), but the project currently has
-- zero employees, so in practice every step below is a no-op on existing
-- rows and only changes the schema.

alter table public.employees add column store_id uuid references public.stores (id);

update public.employees e
set store_id = s.id
from public.stores s
where e.store_id is null and s.name = e.unit::text;

do $$
declare
  rec record;
begin
  for rec in
    select id, unit from public.employees where store_id is null
  loop
    raise notice 'employees.unit "%" (employee_id=%) não encontrou loja correspondente pelo nome — defina store_id manualmente antes de prosseguir.', rec.unit, rec.id;
  end loop;
end $$;

-- Fails loudly (instead of silently) if any employee above didn't resolve
-- to a store — fix those manually and re-run this statement.
alter table public.employees alter column store_id set not null;

create index employees_store_id_idx on public.employees (store_id);

-- Carry manager_id over to the corresponding store. If employees of the
-- same store already point at different managers today, that's flagged
-- instead of silently picking one.
do $$
declare
  rec record;
begin
  for rec in
    select store_id, array_agg(distinct manager_id) as managers
    from public.employees
    where manager_id is not null
    group by store_id
  loop
    if array_length(rec.managers, 1) > 1 then
      raise notice 'Conflito ao migrar gestor: loja % tem colaboradores apontando para gestores diferentes (%) — defina stores.manager_id manualmente.', rec.store_id, rec.managers;
    else
      update public.stores
      set manager_id = rec.managers[1]
      where id = rec.store_id and manager_id is null;
    end if;
  end loop;
end $$;

alter table public.employees drop column manager_id;
drop index if exists public.employees_unit_idx;
alter table public.employees drop column unit;
drop type public.unit_enum;

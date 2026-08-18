-- `employees.role` moves from free text to a fixed, selectable list of job
-- titles. Existing values that don't match the fixed list exactly are not
-- silently dropped: they're logged via RAISE NOTICE and preserved in
-- `notes` so RH can reconcile them manually from the employee's file.

create type public.employee_role_enum as enum (
  'Auxiliar de vendas',
  'Vendedor',
  'Consultor de vendas',
  'Consultor comercial',
  'Auxiliar de Laboratório',
  'Montador Óptico',
  'Gerente de Laboratório',
  'Gerente de loja',
  'Gerente Comercial',
  'Assistente administrativo',
  'Auxiliar administrativo',
  'Estoquista',
  'Motoqueiro',
  'Assistente de estoque',
  'Assistente de operações',
  'Assistente de departamento de pessoas',
  'Motoboy',
  'Balcão',
  'Auxiliar de manutenção',
  'Assistente de Marketing',
  'Auxiliar de atendimento'
);

alter table public.employees add column role_new public.employee_role_enum;

do $$
declare
  rec record;
  valid_roles text[] := enum_range(null::public.employee_role_enum)::text[];
begin
  update public.employees
  set role_new = role::public.employee_role_enum
  where role = any(valid_roles);

  for rec in
    select id, role from public.employees
    where role is not null and not (role = any(valid_roles))
  loop
    raise notice 'employees.role não corresponde à lista fixa de cargos — employee_id=%, valor original=%. Texto original preservado em notes para ajuste manual.', rec.id, rec.role;

    update public.employees
    set notes = trim(both E'\n' from coalesce(notes, '') || E'\n' ||
      format('[migração de cargo %s] valor original: "%s" — ajustar manualmente na ficha do colaborador', to_char(now(), 'YYYY-MM-DD'), rec.role))
    where id = rec.id;
  end loop;
end $$;

alter table public.employees drop column role;
alter table public.employees rename column role_new to role;

-- Manager and benefit values move from the employee (and a generic
-- per-unit config table) to the store itself — they describe the store,
-- not the person. `observes_fortaleza_holidays` replaces the old
-- hardcoded "Caucaia/Maracanaú are their own municipality" branch in the
-- business-days calculation, now configurable per store instead of
-- name-matched in code.

alter table public.stores
  add column manager_id uuid references public.employees (id),
  add column transport_benefit_value numeric(10, 2),
  add column meal_benefit_value numeric(10, 2),
  add column observes_fortaleza_holidays boolean not null default true;

-- Seed a store per existing fixed unit, if one doesn't already exist with
-- that name.
insert into public.stores (name)
select unit_name
from (
  values
    ('Adm'), ('Aldeota'), ('Caucaia'), ('Centro'), ('Jóquei'), ('Maracanaú'),
    ('Messejana'), ('North Shopping'), ('Parangaba'), ('Rio Mar'), ('Digital')
) as u(unit_name)
where not exists (select 1 from public.stores s where s.name = u.unit_name);

-- Carry over the VT rates that used to live in benefit_discount_rates.
update public.stores
set transport_benefit_value = case
  when name = 'Caucaia' then 9.60
  when name = 'Maracanaú' then 11.60
  else 11.00
end
where transport_benefit_value is null;

-- The meal/iFood rate used to be one global value (R$ 14,10) — now it's
-- per store, seeded from that same value but editable individually from
-- here on.
update public.stores
set meal_benefit_value = 14.10
where meal_benefit_value is null;

update public.stores
set observes_fortaleza_holidays = false
where name in ('Caucaia', 'Maracanaú');

alter table public.stores alter column transport_benefit_value set not null;
alter table public.stores alter column meal_benefit_value set not null;

-- Superseded by the per-store columns above.
drop table public.benefit_discount_rates;
drop type public.benefit_type_enum;

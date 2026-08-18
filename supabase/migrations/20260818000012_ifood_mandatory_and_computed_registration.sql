-- iFood (vale-refeição) is mandatory for every employee, not an optional
-- per-employee toggle. "Registro completo" becomes a computed value in the
-- app (based on which fields are filled) instead of a manually-set flag.
-- Neither column is used anywhere else (has_ifood never fed the discount
-- calculation, which already applies stores.meal_benefit_value to everyone).
alter table public.employees
  drop column has_ifood,
  drop column full_registration_complete;

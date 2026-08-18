-- Unpaid vacation days now feed the same VT/meal discount calculation as
-- medical certificates. Paid vacations are never discounted, so these stay
-- at their zero defaults for those rows.

alter table public.vacations
  add column days_count integer,
  add column discount_calculated boolean not null default false,
  add column discount_applied boolean not null default false,
  add column vt_discount_value numeric(10, 2) not null default 0,
  add column meal_discount_value numeric(10, 2) not null default 0,
  add column total_discount_value numeric(10, 2) not null default 0;

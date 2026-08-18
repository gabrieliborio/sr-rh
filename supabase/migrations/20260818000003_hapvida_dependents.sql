alter table public.employees
  add column hapvida_dependents_count integer not null default 0;

-- Defense in depth: the app zeroes this out whenever `has_hapvida` is
-- unchecked, but the constraint keeps the data consistent even if a write
-- ever bypasses that app logic.
alter table public.employees
  add constraint hapvida_dependents_require_plan check (
    has_hapvida = true or hapvida_dependents_count = 0
  );

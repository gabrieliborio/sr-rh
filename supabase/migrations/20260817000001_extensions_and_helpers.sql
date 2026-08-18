-- Extensions and shared helpers used across the schema.

create extension if not exists "pgcrypto";

-- Generic trigger to keep `updated_at` current on any table that has the column.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

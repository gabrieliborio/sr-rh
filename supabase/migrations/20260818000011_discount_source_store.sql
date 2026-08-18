-- Snapshot of which store's rate was used at calculation time, so the
-- discount screen can show "valor calculado com a loja X" without
-- re-walking employee_store_history on every read.
alter table public.medical_certificates add column store_id uuid references public.stores (id);
alter table public.vacations add column store_id uuid references public.stores (id);

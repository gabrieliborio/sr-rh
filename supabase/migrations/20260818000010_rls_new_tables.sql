alter table public.employee_store_history enable row level security;
create policy employee_store_history_authenticated_full_access
  on public.employee_store_history for all to authenticated using (true) with check (true);

alter table public.employee_absences enable row level security;
create policy employee_absences_authenticated_full_access
  on public.employee_absences for all to authenticated using (true) with check (true);

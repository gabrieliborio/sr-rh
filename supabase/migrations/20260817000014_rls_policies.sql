-- RLS: this is a single-team internal tool. Every table just requires the
-- request to come from an authenticated Supabase Auth session — there is no
-- per-row ownership or role-based restriction yet (see `roles`/`profiles`
-- for where that would plug in later).

do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'profiles',
      'employees',
      'employee_documents',
      'uniform_history',
      'disciplinary_records',
      'onboarding',
      'negotiations',
      'medical_certificates',
      'benefit_discount_rates',
      'terminations',
      'employee_purchases',
      'employee_purchase_installments',
      'vacations',
      'trainings',
      'training_attendances',
      'stores',
      'store_licenses',
      'candidates',
      'holidays',
      'notifications_log',
      'roles'
    ])
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (true) with check (true)',
      t || '_authenticated_full_access', t
    );
  end loop;
end $$;

alter view public.v_store_licenses set (security_invoker = on);

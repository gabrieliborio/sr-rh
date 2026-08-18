-- Employee purchases and their installment schedule.

create table public.employee_purchases (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  purchase_date date not null,
  os_number text,
  total_value numeric(12, 2) not null,
  installments_count integer not null default 1,
  created_at timestamptz not null default now()
);

create index employee_purchases_employee_id_idx on public.employee_purchases (employee_id);

create type public.installment_status_enum as enum ('pago', 'nao_pago');

create table public.employee_purchase_installments (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.employee_purchases (id) on delete cascade,
  installment_number integer not null,
  due_date date not null,
  value numeric(12, 2) not null,
  status public.installment_status_enum not null default 'nao_pago',
  paid_at timestamptz,
  whatsapp_notified boolean not null default false,
  whatsapp_notified_at timestamptz,
  unique (purchase_id, installment_number)
);

create index employee_purchase_installments_purchase_id_idx on public.employee_purchase_installments (purchase_id);
create index employee_purchase_installments_due_date_idx on public.employee_purchase_installments (due_date);

create type public.notification_type_enum as enum (
  'aniversario', 'ferias', 'desconto', 'licenca_vencendo', 'avaliacao', 'pagamento_compra'
);

create table public.notifications_log (
  id uuid primary key default gen_random_uuid(),
  type public.notification_type_enum not null,
  related_table text not null,
  related_id uuid not null,
  sent_via text not null default 'whatsapp',
  sent_at timestamptz not null default now(),
  payload jsonb
);

create index notifications_log_related_idx on public.notifications_log (related_table, related_id);

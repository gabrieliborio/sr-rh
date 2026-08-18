-- Holidays feed the business-days calculation used by medical certificate
-- discounts. Editable by RH directly, no code change needed to add/remove one.

create type public.holiday_scope_enum as enum ('nacional', 'ceara', 'fortaleza');

create table public.holidays (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  name text not null,
  scope public.holiday_scope_enum not null,
  unique (date, scope)
);

-- Seed: fixed-date national holidays for 2026, plus Ceará/Fortaleza fixed-date
-- holidays. Movable holidays (Carnaval, Sexta-feira Santa, Corpus Christi)
-- vary year to year and are left for RH to add manually.
insert into public.holidays (date, name, scope) values
  ('2026-01-01', 'Confraternização Universal', 'nacional'),
  ('2026-04-21', 'Tiradentes', 'nacional'),
  ('2026-05-01', 'Dia do Trabalho', 'nacional'),
  ('2026-09-07', 'Independência do Brasil', 'nacional'),
  ('2026-10-12', 'Nossa Senhora Aparecida', 'nacional'),
  ('2026-11-02', 'Finados', 'nacional'),
  ('2026-11-15', 'Proclamação da República', 'nacional'),
  ('2026-11-20', 'Dia Nacional de Zumbi e da Consciência Negra', 'nacional'),
  ('2026-12-25', 'Natal', 'nacional'),
  ('2026-03-25', 'Abolição da Escravatura no Ceará', 'ceara'),
  ('2026-04-13', 'Aniversário de Fortaleza', 'fortaleza');

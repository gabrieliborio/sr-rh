-- Needed to send WhatsApp notifications (purchase installments, etc.) to the
-- employee — missing from the original employees table.
alter table public.employees add column phone text;

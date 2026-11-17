-- Commitment fee state for offers paid through Fiuu: Pending | Paid | Failed.
-- Older offers (submitted before online payment) stay null.
alter table offers add column if not exists payment_status text;

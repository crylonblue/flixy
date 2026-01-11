-- Add recipient email field to invoices for email sending
-- This is separate from customer_snapshot and can be edited after invoice is finalized
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS recipient_email TEXT;

COMMENT ON COLUMN invoices.recipient_email IS 'Email address for sending the invoice. Can be changed independently of customer_snapshot.';

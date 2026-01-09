-- Add accounting email and SMTP settings to companies table
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS accounting_email TEXT,
  ADD COLUMN IF NOT EXISTS smtp_settings JSONB DEFAULT '{}'::jsonb;

-- Add comments to document the structure
COMMENT ON COLUMN companies.accounting_email IS 'Email address where finalized invoices will be sent';
COMMENT ON COLUMN companies.smtp_settings IS 'SMTP configuration: { host, port, secure, auth: { user, pass }, from }';

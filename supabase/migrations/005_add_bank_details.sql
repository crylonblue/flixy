-- Add bank_details column to companies table
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS bank_details JSONB DEFAULT '{}'::jsonb;

-- Add comment to document the structure
COMMENT ON COLUMN companies.bank_details IS 'Bank account details: { bank_name, iban, bic, account_holder }';


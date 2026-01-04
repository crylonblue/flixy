-- Add issuer_snapshot column to invoices table
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS issuer_snapshot JSONB;

-- Add comment to document the structure
COMMENT ON COLUMN invoices.issuer_snapshot IS 'Issuer/Company snapshot when invoice is finalized: { name, address, vat_id, tax_id, bank_details }';


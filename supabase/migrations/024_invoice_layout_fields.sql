-- Add buyer_reference field to invoices table for PO/reference number
ALTER TABLE invoices
ADD COLUMN buyer_reference TEXT;

-- Add legal information fields to companies table for PDF footer
ALTER TABLE companies
ADD COLUMN court TEXT,
ADD COLUMN register_number TEXT,
ADD COLUMN managing_director TEXT;

-- Add comment for documentation
COMMENT ON COLUMN invoices.buyer_reference IS 'Buyer PO/reference number (REFERENZ field in invoice)';
COMMENT ON COLUMN companies.court IS 'Court of registration (e.g., Amtsgericht München)';
COMMENT ON COLUMN companies.register_number IS 'Commercial register number (e.g., HRB 123456)';
COMMENT ON COLUMN companies.managing_director IS 'Managing director name(s) (Geschäftsführer)';

-- Add PDF and XML file URLs to invoices table
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS xml_url TEXT;


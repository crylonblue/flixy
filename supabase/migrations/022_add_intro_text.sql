-- Add default_intro_text and default_outro_text fields to companies table for user-configurable defaults
ALTER TABLE companies
ADD COLUMN default_intro_text TEXT,
ADD COLUMN default_outro_text TEXT;

-- Add intro_text and outro_text fields to invoices table (snapshot of company settings at time of creation)
ALTER TABLE invoices
ADD COLUMN intro_text TEXT,
ADD COLUMN outro_text TEXT;

-- Set sensible default texts for existing companies (German)
UPDATE companies
SET 
  default_intro_text = 'Vielen Dank für Ihr Vertrauen. Bitte überweisen Sie den Rechnungsbetrag innerhalb der angegebenen Zahlungsfrist.',
  default_outro_text = 'Vielen Dank für Ihren Auftrag. Bei Fragen zu dieser Rechnung stehen wir Ihnen gerne zur Verfügung.';

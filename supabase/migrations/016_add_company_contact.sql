-- Seller Contact (BR-DE-2) - Pflichtfeld fuer XRechnung
-- Diese Felder werden fuer die XRechnung-konforme XML-Generierung benoetigt

ALTER TABLE companies ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Kommentar zur Dokumentation
COMMENT ON COLUMN companies.contact_name IS 'Ansprechpartner Name (XRechnung BR-DE-2)';
COMMENT ON COLUMN companies.contact_phone IS 'Ansprechpartner Telefon (XRechnung BR-DE-2)';
COMMENT ON COLUMN companies.contact_email IS 'Ansprechpartner E-Mail (XRechnung BR-DE-2)';

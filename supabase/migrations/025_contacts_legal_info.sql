-- Add legal information and contact person fields to contacts table
-- This makes contacts consistent with companies when they act as invoice sellers

-- Legal information for PDF footer
ALTER TABLE contacts
ADD COLUMN court TEXT,
ADD COLUMN register_number TEXT,
ADD COLUMN managing_director TEXT;

-- Contact person fields (for XRechnung BR-DE-2 compliance)
ALTER TABLE contacts
ADD COLUMN contact_name TEXT,
ADD COLUMN contact_phone TEXT,
ADD COLUMN contact_email TEXT;

-- Add comments for documentation
COMMENT ON COLUMN contacts.court IS 'Court of registration (e.g., Amtsgericht München) - for seller contacts';
COMMENT ON COLUMN contacts.register_number IS 'Commercial register number (e.g., HRB 123456) - for seller contacts';
COMMENT ON COLUMN contacts.managing_director IS 'Managing director name(s) - for seller contacts';
COMMENT ON COLUMN contacts.contact_name IS 'Contact person name - for XRechnung BR-DE-2';
COMMENT ON COLUMN contacts.contact_phone IS 'Contact person phone - for XRechnung BR-DE-2';
COMMENT ON COLUMN contacts.contact_email IS 'Contact person email - for XRechnung BR-DE-2';

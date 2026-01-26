-- Cancellation Invoice (Stornorechnung) Support
-- Adds separate number sequences for cancellation invoices

-- 1. Add cancellation counter and prefix to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS cancellation_number_counter INTEGER DEFAULT 0;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS cancellation_number_prefix TEXT DEFAULT 'ST';

-- 2. Add cancellation counter and prefix to contacts table (for contacts as sellers)
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS cancellation_number_counter INTEGER DEFAULT 0;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS cancellation_number_prefix TEXT;

-- 3. Add invoice_type and cancelled_invoice_id to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_type TEXT DEFAULT 'invoice';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS cancelled_invoice_id UUID REFERENCES invoices(id);

-- 4. Add check constraint for invoice_type
ALTER TABLE invoices ADD CONSTRAINT invoices_invoice_type_check 
  CHECK (invoice_type IN ('invoice', 'cancellation'));

-- 5. Add index for cancelled_invoice_id lookups
CREATE INDEX IF NOT EXISTS idx_invoices_cancelled_invoice_id ON invoices(cancelled_invoice_id);

-- 6. Function for atomic cancellation number generation (mirrors get_next_invoice_number)
CREATE OR REPLACE FUNCTION get_next_cancellation_invoice_number(
  p_seller_type TEXT,  -- 'company' or 'contact'
  p_seller_id UUID,
  p_prefix TEXT DEFAULT NULL
)
RETURNS TABLE (
  next_number INTEGER,
  formatted_number TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_counter INTEGER;
  v_prefix TEXT;
BEGIN
  IF p_seller_type = 'company' THEN
    -- Atomic update for company
    UPDATE companies
    SET cancellation_number_counter = cancellation_number_counter + 1
    WHERE id = p_seller_id
    RETURNING cancellation_number_counter, cancellation_number_prefix
    INTO v_counter, v_prefix;
    
    IF v_counter IS NULL THEN
      RAISE EXCEPTION 'Company not found: %', p_seller_id;
    END IF;
    
    -- Parameter prefix overrides stored prefix
    IF p_prefix IS NOT NULL THEN
      v_prefix := p_prefix;
    END IF;
    
  ELSIF p_seller_type = 'contact' THEN
    -- Atomic update for contact
    UPDATE contacts
    SET cancellation_number_counter = cancellation_number_counter + 1
    WHERE id = p_seller_id
    RETURNING cancellation_number_counter, cancellation_number_prefix
    INTO v_counter, v_prefix;
    
    IF v_counter IS NULL THEN
      RAISE EXCEPTION 'Contact not found: %', p_seller_id;
    END IF;
    
    -- Parameter prefix overrides stored prefix
    IF p_prefix IS NOT NULL THEN
      v_prefix := p_prefix;
    END IF;
    
  ELSE
    RAISE EXCEPTION 'Invalid seller_type: %. Must be "company" or "contact"', p_seller_type;
  END IF;
  
  -- Generate formatted number (default prefix 'ST' for Stornorechnung)
  next_number := v_counter;
  formatted_number := COALESCE(v_prefix, 'ST') || '-' || LPAD(v_counter::TEXT, 4, '0');
  
  RETURN NEXT;
END;
$$;

-- 7. Grant execute permission for authenticated users
GRANT EXECUTE ON FUNCTION get_next_cancellation_invoice_number(TEXT, UUID, TEXT) TO authenticated;

-- 8. Initialize cancellation counters based on existing cancellation invoices (if any)
-- This handles the case where cancellation invoices might have been created manually
UPDATE companies c
SET cancellation_number_counter = COALESCE(
  (
    SELECT MAX(
      CASE 
        WHEN i.invoice_number ~ '\d+$' 
        THEN (regexp_match(i.invoice_number, '(\d+)$'))[1]::integer
        ELSE 0
      END
    )
    FROM invoices i
    WHERE i.company_id = c.id
      AND i.invoice_type = 'cancellation'
      AND i.seller_is_self = true
  ),
  0
);

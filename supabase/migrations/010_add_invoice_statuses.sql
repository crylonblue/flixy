-- Add new status values to invoices (reminded, cancelled)
ALTER TABLE invoices 
DROP CONSTRAINT IF EXISTS invoices_status_check;

ALTER TABLE invoices 
ADD CONSTRAINT invoices_status_check 
CHECK (status IN ('draft', 'created', 'sent', 'reminded', 'paid', 'cancelled'));

-- Migration: Add streetnumber to address JSONB structure
-- Note: Since address is JSONB, we don't need to alter the table structure
-- This migration is for documentation purposes only
-- The application code will handle the new streetnumber field

-- No SQL changes needed as JSONB fields are flexible
-- Existing addresses will continue to work, new addresses will include streetnumber


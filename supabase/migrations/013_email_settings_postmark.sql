-- Migration: Replace SMTP settings with Postmark email settings
-- This migration removes the old SMTP configuration and adds new email settings
-- for Postmark integration with two modes: default (via blitzrechnung.de) or custom domain

-- Step 1: Add new email_settings column
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS email_settings JSONB DEFAULT '{
    "mode": "default",
    "reply_to_email": null,
    "reply_to_name": null
  }'::jsonb;

-- Step 2: Remove old smtp_settings column
ALTER TABLE companies
  DROP COLUMN IF EXISTS smtp_settings;

-- Step 3: Add comments to document the new structure
COMMENT ON COLUMN companies.email_settings IS 'Email configuration for Postmark: { mode: "default"|"custom_domain", reply_to_email?, reply_to_name?, custom_domain?, from_email?, from_name?, domain_verified?, domain_verified_at?, postmark_domain_id?, dns_records?: { spf, dkim, return_path } }';

-- Note: accounting_email remains separate as it serves a different purpose (BCC for invoice copies)

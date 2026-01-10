-- Create api_keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE, -- SHA-256 hash of the API key
  key_prefix TEXT NOT NULL, -- First 12 characters for display (e.g., "flx_abc123")
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, company_id) -- Each user can only have one API key per company
);

-- Create index on company_id for faster lookups
CREATE INDEX idx_api_keys_company_id ON api_keys(company_id);

-- Create index on user_id for faster lookups
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);

-- Create index on key_hash for faster authentication lookups
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view API keys for their companies
CREATE POLICY "Users can view API keys for their companies"
  ON api_keys
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM company_users
      WHERE company_users.company_id = api_keys.company_id
      AND company_users.user_id = auth.uid()
    )
  );

-- Policy: Users can create their own API keys for their companies
CREATE POLICY "Users can create their own API keys"
  ON api_keys
  FOR INSERT
  WITH CHECK (
    auth.uid() = api_keys.user_id
    AND EXISTS (
      SELECT 1 FROM company_users
      WHERE company_users.company_id = api_keys.company_id
      AND company_users.user_id = auth.uid()
    )
  );

-- Policy: Users can update their own API keys
CREATE POLICY "Users can update their own API keys"
  ON api_keys
  FOR UPDATE
  USING (
    auth.uid() = api_keys.user_id
    AND EXISTS (
      SELECT 1 FROM company_users
      WHERE company_users.company_id = api_keys.company_id
      AND company_users.user_id = auth.uid()
    )
  );

-- Policy: Users can delete their own API keys
CREATE POLICY "Users can delete their own API keys"
  ON api_keys
  FOR DELETE
  USING (
    auth.uid() = api_keys.user_id
    AND EXISTS (
      SELECT 1 FROM company_users
      WHERE company_users.company_id = api_keys.company_id
      AND company_users.user_id = auth.uid()
    )
  );

-- Add comment
COMMENT ON TABLE api_keys IS 'API keys for company API access - one per user per company';
COMMENT ON COLUMN api_keys.key_hash IS 'SHA-256 hash of the full API key';
COMMENT ON COLUMN api_keys.key_prefix IS 'First 12 characters of the API key for display purposes';

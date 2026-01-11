-- Create products table for storing reusable invoice items/articles
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL DEFAULT 'piece',
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  default_vat_rate NUMERIC(5,2) NOT NULL DEFAULT 19,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups by company
CREATE INDEX idx_products_company_id ON products(company_id);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view products of their company
CREATE POLICY "Users can view products of their company"
  ON products FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM company_users WHERE user_id = auth.uid()
  ));

-- Policy: Users can insert products for their company
CREATE POLICY "Users can insert products for their company"
  ON products FOR INSERT
  WITH CHECK (company_id IN (
    SELECT company_id FROM company_users WHERE user_id = auth.uid()
  ));

-- Policy: Users can update products of their company
CREATE POLICY "Users can update products of their company"
  ON products FOR UPDATE
  USING (company_id IN (
    SELECT company_id FROM company_users WHERE user_id = auth.uid()
  ));

-- Policy: Users can delete products of their company
CREATE POLICY "Users can delete products of their company"
  ON products FOR DELETE
  USING (company_id IN (
    SELECT company_id FROM company_users WHERE user_id = auth.uid()
  ));

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_products_updated_at();

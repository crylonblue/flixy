-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table (oberste Entität)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address JSONB NOT NULL, -- { street, city, zip, country }
  country TEXT NOT NULL,
  vat_id TEXT,
  tax_id TEXT,
  logo_url TEXT,
  invoice_number_prefix TEXT DEFAULT 'INV',
  invoice_number_format TEXT DEFAULT '{prefix}-{number}',
  default_vat_rate DECIMAL(5,2) DEFAULT 19.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (managed by Supabase Auth, but we add a profile table)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  auth_provider TEXT DEFAULT 'email', -- 'email' or 'google'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company Users (Join table)
CREATE TABLE company_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner' or 'member'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address JSONB NOT NULL, -- { street, city, zip, country }
  email TEXT,
  vat_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'created', 'sent', 'paid'
  invoice_number TEXT, -- nur bei status 'created' oder höher
  invoice_date DATE,
  due_date DATE,
  customer_snapshot JSONB, -- Snapshot beim Finalisieren
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{ description, quantity, unit_price, vat_rate, total }]
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  vat_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  invoice_file_reference TEXT, -- URL oder ID vom Invoice-Service
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  finalized_at TIMESTAMPTZ -- Zeitpunkt der Finalisierung
);

-- Indexes for performance
CREATE INDEX idx_company_users_user_id ON company_users(user_id);
CREATE INDEX idx_company_users_company_id ON company_users(company_id);
CREATE INDEX idx_customers_company_id ON customers(company_id);
CREATE INDEX idx_invoices_company_id ON invoices(company_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);

-- RLS (Row Level Security) Policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Companies: Users can only see companies they belong to
CREATE POLICY "Users can view their companies"
  ON companies FOR SELECT
  USING (
    id IN (
      SELECT company_id FROM company_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert companies they own"
  ON companies FOR INSERT
  WITH CHECK (true); -- Will be validated via company_users

CREATE POLICY "Users can update their companies"
  ON companies FOR UPDATE
  USING (
    id IN (
      SELECT company_id FROM company_users
      WHERE user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- User profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid());

-- Company users: Users can view company_users for their companies
CREATE POLICY "Users can view company_users for their companies"
  ON company_users FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_users
      WHERE user_id = auth.uid()
    )
  );

-- Customers: Users can only see customers of their companies
CREATE POLICY "Users can view customers of their companies"
  ON customers FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert customers for their companies"
  ON customers FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM company_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update customers of their companies"
  ON customers FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM company_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete customers of their companies"
  ON customers FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM company_users
      WHERE user_id = auth.uid()
    )
  );

-- Invoices: Users can only see invoices of their companies
CREATE POLICY "Users can view invoices of their companies"
  ON invoices FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert invoices for their companies"
  ON invoices FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM company_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update invoices of their companies"
  ON invoices FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM company_users
      WHERE user_id = auth.uid()
    )
  );

-- Function to automatically create user_profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, auth_provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'provider', 'email')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user_profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


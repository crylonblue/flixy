-- Fix infinite recursion in company_users policy
-- The policy was trying to query company_users while checking access to company_users

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view company_users for their companies" ON company_users;

-- Create a SECURITY DEFINER function to get user's company IDs without RLS recursion
-- This function bypasses RLS to avoid infinite recursion
CREATE OR REPLACE FUNCTION get_user_company_ids()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
  SELECT cu.company_id 
  FROM company_users cu
  WHERE cu.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create a policy that uses this function to avoid recursion
CREATE POLICY "Users can view company_users for their companies"
  ON company_users FOR SELECT
  USING (
    user_id = auth.uid() OR
    company_id = ANY(SELECT get_user_company_ids())
  );


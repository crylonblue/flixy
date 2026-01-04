-- Add DELETE policy for invoices
-- Users can delete draft invoices of their companies

CREATE POLICY "Users can delete draft invoices of their companies"
  ON invoices FOR DELETE
  USING (
    status = 'draft' AND
    company_id IN (
      SELECT company_id FROM company_users
      WHERE user_id = auth.uid()
    )
  );


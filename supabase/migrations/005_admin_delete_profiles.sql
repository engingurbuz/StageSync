-- ============================================================================
-- Migration 005: Add DELETE policy for profiles (admin only)
-- ============================================================================

-- Allow admins to permanently delete member profiles
CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

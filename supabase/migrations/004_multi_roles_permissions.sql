-- ============================================================================
-- Migration 004: Multi-role support & Permission management system
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- 0. Add 'choir_leader' to user_role enum
-- ──────────────────────────────────────────────────────────────────────────────
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'choir_leader' AFTER 'admin';

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. Add 'roles' array column to profiles
-- ──────────────────────────────────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS roles user_role[] NOT NULL DEFAULT ARRAY['member']::user_role[];

-- Add custom_fields column if not exists (used by app)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS custom_fields JSONB;

-- Add kvkk columns if not exists
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS kvkk_consent BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS kvkk_consent_date TIMESTAMPTZ;

-- Migrate existing role data into roles array
UPDATE profiles SET roles = ARRAY[role] WHERE roles = ARRAY['member']::user_role[] AND role != 'member';

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. Role permissions configuration table
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS role_permissions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role        user_role NOT NULL,
  section     TEXT NOT NULL,
  can_view    BOOLEAN NOT NULL DEFAULT FALSE,
  can_create  BOOLEAN NOT NULL DEFAULT FALSE,
  can_edit    BOOLEAN NOT NULL DEFAULT FALSE,
  can_delete  BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE(role, section)
);

-- Enable RLS on role_permissions
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Everyone can read permission config
CREATE POLICY "Authenticated users can view role_permissions"
  ON role_permissions FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can manage permissions
CREATE POLICY "Admins can insert role_permissions"
  ON role_permissions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update role_permissions"
  ON role_permissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete role_permissions"
  ON role_permissions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. Update trigger for role_permissions updated_at
-- ──────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_role_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_role_permissions_updated_at
  BEFORE UPDATE ON role_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_role_permissions_updated_at();

-- ──────────────────────────────────────────────────────────────────────────────
-- 4. Helper function: Check if user has any of given roles
-- ──────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION user_has_role(user_id UUID, check_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id
    AND (role = check_role OR check_role = ANY(roles))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

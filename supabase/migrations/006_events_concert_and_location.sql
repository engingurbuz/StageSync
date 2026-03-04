-- ============================================================================
-- MIGRATION: Event type 'concert' + optional map location (lat/lng)
-- ============================================================================

-- 1. Add 'concert' to event_type enum (PostgreSQL: add new value)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'concert'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'event_type')
  ) THEN
    ALTER TYPE event_type ADD VALUE 'concert';
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    -- event_type enum might not exist in some envs; skip
    NULL;
END
$$;

-- 2. Add optional location coordinates for map display
ALTER TABLE events ADD COLUMN IF NOT EXISTS location_lat DOUBLE PRECISION;
ALTER TABLE events ADD COLUMN IF NOT EXISTS location_lng DOUBLE PRECISION;

-- 3. Allow choir_leader and section_leader to manage events (not only admin)
-- Drop existing "Admins can manage events" policy and recreate with extended roles
DROP POLICY IF EXISTS "Admins can manage events" ON events;

CREATE POLICY "Admins and leaders can manage events"
  ON events FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'choir_leader', 'section_leader')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'choir_leader', 'section_leader')
    )
  );

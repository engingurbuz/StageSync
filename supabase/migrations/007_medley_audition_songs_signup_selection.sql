-- ============================================================================
-- MIGRATION: Medley (songs), audition_songs, signup selected_role_type, RLS
-- ============================================================================

-- 0. Auditions: production_id nullable (seçme prodüksiyonsuz da açılabilsin)
ALTER TABLE auditions ALTER COLUMN production_id DROP NOT NULL;

-- 1. Songs: medley (parent + position)
ALTER TABLE songs ADD COLUMN IF NOT EXISTS parent_song_id UUID REFERENCES songs(id) ON DELETE SET NULL;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS medley_position INTEGER;

-- 2. Audition-Songs (repertuvardan hangi şarkılar için)
CREATE TABLE IF NOT EXISTS audition_songs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audition_id   UUID NOT NULL REFERENCES auditions(id) ON DELETE CASCADE,
  song_id       UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  order_index   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(audition_id, song_id)
);

ALTER TABLE audition_songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audition songs viewable by authenticated"
  ON audition_songs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and choir_leader manage audition_songs"
  ON audition_songs FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'choir_leader'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'choir_leader'))
  );

CREATE INDEX IF NOT EXISTS idx_audition_songs_audition ON audition_songs(audition_id);

-- 3. Audition signups: asil/yedek seçimi (lead=asil, understudy=yedek)
ALTER TABLE audition_signups ADD COLUMN IF NOT EXISTS selected_role_type TEXT
  CHECK (selected_role_type IS NULL OR selected_role_type IN ('lead', 'understudy', 'not_selected'));

-- 4. RLS: choir_leader ve admin tüm başvuruları görebilsin ve güncelleyebilsin
DROP POLICY IF EXISTS "Users can view own signups" ON audition_signups;
CREATE POLICY "Users can view own signups"
  ON audition_signups FOR SELECT TO authenticated
  USING (
    member_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'choir_leader'))
  );

DROP POLICY IF EXISTS "Admins can manage signups" ON audition_signups;
CREATE POLICY "Admins and choir_leader can manage signups"
  ON audition_signups FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'choir_leader'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'choir_leader'))
  );

-- Members can still insert own signup (başvuru)
CREATE POLICY "Members can insert own signup"
  ON audition_signups FOR INSERT TO authenticated
  WITH CHECK (member_id = auth.uid());

-- 5. Cast roles: choir_leader da yönetebilsin (kadroya aktar, revize)
DROP POLICY IF EXISTS "Admins can manage cast roles" ON cast_roles;
CREATE POLICY "Admins and choir_leader can manage cast roles"
  ON cast_roles FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'choir_leader'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'choir_leader'))
  );

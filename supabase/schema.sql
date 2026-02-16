-- ============================================================================
-- CHOIR MANAGEMENT SaaS — Supabase Database Schema
-- Musical Theater Groups Edition
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- 0. EXTENSIONS
-- ──────────────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. ENUMS
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM (
  'admin',
  'section_leader',
  'creative_team',
  'member'
);

CREATE TYPE voice_type AS ENUM (
  'soprano',
  'soprano_1',
  'soprano_2',
  'mezzo_soprano',
  'alto',
  'tenor',
  'tenor_1',
  'tenor_2',
  'baritone',
  'bass'
);

CREATE TYPE member_status AS ENUM (
  'active',
  'inactive',
  'alumni',
  'pending'
);

CREATE TYPE event_type AS ENUM (
  'rehearsal',
  'performance',
  'audition',
  'meeting',
  'workshop',
  'social'
);

CREATE TYPE attendance_status AS ENUM (
  'present',
  'absent',
  'late',
  'excused'
);

CREATE TYPE cast_role_type AS ENUM (
  'lead',
  'understudy',
  'ensemble',
  'swing'
);

CREATE TYPE task_status AS ENUM (
  'todo',
  'in_progress',
  'review',
  'done'
);

CREATE TYPE task_category AS ENUM (
  'costume',
  'choreography',
  'staging',
  'lighting',
  'sound',
  'props',
  'marketing',
  'general'
);

CREATE TYPE audition_status AS ENUM (
  'open',
  'closed',
  'in_review',
  'completed'
);

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. PROFILES  (extends Supabase auth.users)
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email          TEXT NOT NULL,
  full_name      TEXT NOT NULL,
  display_name   TEXT,
  avatar_url     TEXT,
  phone          TEXT,
  role           user_role NOT NULL DEFAULT 'member',
  voice_type     voice_type,
  status         member_status NOT NULL DEFAULT 'pending',
  bio            TEXT,
  emergency_contact_name  TEXT,
  emergency_contact_phone TEXT,
  joined_date    DATE DEFAULT CURRENT_DATE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. ANNOUNCEMENTS
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE announcements (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  priority     SMALLINT NOT NULL DEFAULT 0,  -- 0=normal, 1=important, 2=urgent
  is_pinned    BOOLEAN NOT NULL DEFAULT FALSE,
  author_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Announcements viewable by authenticated"
  ON announcements FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage announcements"
  ON announcements FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- 4. PRODUCTIONS (a musical theater show / season)
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE productions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  description   TEXT,
  season        TEXT,                           -- e.g. "Spring 2026"
  start_date    DATE,
  end_date      DATE,
  poster_url    TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_by    UUID NOT NULL REFERENCES profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE productions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Productions viewable by authenticated"
  ON productions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage productions"
  ON productions FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- 5. EVENTS  (rehearsals, performances, auditions, meetings)
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  description     TEXT,
  event_type      event_type NOT NULL DEFAULT 'rehearsal',
  production_id   UUID REFERENCES productions(id) ON DELETE SET NULL,
  location        TEXT,
  start_time      TIMESTAMPTZ NOT NULL,
  end_time        TIMESTAMPTZ NOT NULL,
  is_mandatory    BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events viewable by authenticated"
  ON events FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage events"
  ON events FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- 6. ATTENDANCE
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE attendance (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status      attendance_status NOT NULL DEFAULT 'absent',
  notes       TEXT,
  marked_by   UUID REFERENCES profiles(id),       -- who recorded it
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, member_id)
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attendance"
  ON attendance FOR SELECT TO authenticated
  USING (
    member_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'section_leader')
    )
  );

CREATE POLICY "Section leaders and admins can manage attendance"
  ON attendance FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'section_leader')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'section_leader')
    )
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- 7. SONGS  (repertoire / library)
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE songs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  composer        TEXT,
  arranger        TEXT,
  genre           TEXT,
  production_id   UUID REFERENCES productions(id) ON DELETE SET NULL,
  voice_parts     voice_type[] DEFAULT '{}',       -- which sections sing it
  duration_seconds INTEGER,
  difficulty      SMALLINT CHECK (difficulty BETWEEN 1 AND 5),
  lyrics          TEXT,
  notes           TEXT,
  sheet_music_url TEXT,                             -- Supabase Storage path
  audio_url       TEXT,                             -- Supabase Storage path
  midi_url        TEXT,                             -- Supabase Storage path
  created_by      UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Songs viewable by authenticated"
  ON songs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage songs"
  ON songs FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- 8. AUDITIONS
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE auditions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  production_id   UUID NOT NULL REFERENCES productions(id) ON DELETE CASCADE,
  role_name       TEXT NOT NULL,                   -- "Elphaba", "Danny Zuko"
  description     TEXT,
  voice_required  voice_type[],
  audition_date   TIMESTAMPTZ,
  location        TEXT,
  status          audition_status NOT NULL DEFAULT 'open',
  max_slots       INTEGER DEFAULT 20,
  created_by      UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE auditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auditions viewable by authenticated"
  ON auditions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage auditions"
  ON auditions FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- 9. AUDITION SIGN-UPS  (members register for auditions)
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE audition_signups (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audition_id   UUID NOT NULL REFERENCES auditions(id) ON DELETE CASCADE,
  member_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notes         TEXT,
  video_url     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(audition_id, member_id)
);

ALTER TABLE audition_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own signups"
  ON audition_signups FOR SELECT TO authenticated
  USING (
    member_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Members can sign up for auditions"
  ON audition_signups FOR INSERT TO authenticated
  WITH CHECK (member_id = auth.uid());

CREATE POLICY "Admins can manage signups"
  ON audition_signups FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- 10. CAST ROLES  (who plays what in each production)
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE cast_roles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  production_id   UUID NOT NULL REFERENCES productions(id) ON DELETE CASCADE,
  member_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_name       TEXT NOT NULL,               -- character name
  role_type       cast_role_type NOT NULL DEFAULT 'ensemble',
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE cast_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cast roles viewable by authenticated"
  ON cast_roles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage cast roles"
  ON cast_roles FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- 11. CREATIVE TASKS  (Kanban board)
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE creative_tasks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  description     TEXT,
  category        task_category NOT NULL DEFAULT 'general',
  status          task_status NOT NULL DEFAULT 'todo',
  priority        SMALLINT NOT NULL DEFAULT 0,    -- 0=low, 1=medium, 2=high
  position        INTEGER NOT NULL DEFAULT 0,      -- ordering within column
  production_id   UUID REFERENCES productions(id) ON DELETE SET NULL,
  assigned_to     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  due_date        DATE,
  created_by      UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE creative_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creative tasks viewable by creative team and admins"
  ON creative_tasks FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'creative_team')
    )
  );

CREATE POLICY "Creative team and admins can manage tasks"
  ON creative_tasks FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'creative_team')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'creative_team')
    )
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- 12. MEETING NOTES
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE meeting_notes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  content         TEXT NOT NULL,                   -- rich-text / markdown
  production_id   UUID REFERENCES productions(id) ON DELETE SET NULL,
  meeting_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  attendees       UUID[] DEFAULT '{}',             -- array of profile IDs
  tags            TEXT[] DEFAULT '{}',
  created_by      UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE meeting_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Meeting notes viewable by creative team and admins"
  ON meeting_notes FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'creative_team')
    )
  );

CREATE POLICY "Creative team and admins can manage meeting notes"
  ON meeting_notes FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'creative_team')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'creative_team')
    )
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- 13. STORAGE BUCKETS (run via Supabase Dashboard or API)
-- ──────────────────────────────────────────────────────────────────────────────
-- These INSERT statements set up the storage buckets.
-- Run them in Supabase SQL Editor or create buckets via Dashboard.

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars',      'avatars',      true),
  ('sheet-music',  'sheet-music',  false),
  ('audio-files',  'audio-files',  false),
  ('production-assets', 'production-assets', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: avatars (public read, authenticated upload)
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);

-- Storage policies: sheet-music (authenticated read, admin upload)
CREATE POLICY "Authenticated can view sheet music"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'sheet-music');

CREATE POLICY "Admins can upload sheet music"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'sheet-music'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Storage policies: audio-files (authenticated read, admin upload)
CREATE POLICY "Authenticated can view audio files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'audio-files');

CREATE POLICY "Admins can upload audio files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'audio-files'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- 14. FUNCTIONS & TRIGGERS
-- ──────────────────────────────────────────────────────────────────────────────

-- Auto-update `updated_at` on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY[
      'profiles', 'announcements', 'productions', 'events',
      'attendance', 'songs', 'auditions', 'cast_roles',
      'creative_tasks', 'meeting_notes'
    ])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
      t
    );
  END LOOP;
END;
$$;

-- Auto-create profile on user sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ──────────────────────────────────────────────────────────────────────────────
-- 15. VIEWS (Useful read-only aggregations)
-- ──────────────────────────────────────────────────────────────────────────────

-- Attendance statistics per member
CREATE OR REPLACE VIEW attendance_stats AS
SELECT
  p.id AS member_id,
  p.full_name,
  p.voice_type,
  COUNT(a.id) AS total_events,
  COUNT(CASE WHEN a.status = 'present' THEN 1 END) AS present_count,
  COUNT(CASE WHEN a.status = 'absent'  THEN 1 END) AS absent_count,
  COUNT(CASE WHEN a.status = 'late'    THEN 1 END) AS late_count,
  COUNT(CASE WHEN a.status = 'excused' THEN 1 END) AS excused_count,
  ROUND(
    CASE
      WHEN COUNT(a.id) = 0 THEN 0
      ELSE (COUNT(CASE WHEN a.status IN ('present','late') THEN 1 END)::NUMERIC
            / COUNT(a.id) * 100)
    END, 1
  ) AS adherence_score
FROM profiles p
LEFT JOIN attendance a ON a.member_id = p.id
WHERE p.status = 'active'
GROUP BY p.id, p.full_name, p.voice_type;

-- Upcoming events (next 30 days)
CREATE OR REPLACE VIEW upcoming_events AS
SELECT
  e.*,
  p.full_name AS created_by_name,
  pr.title AS production_title
FROM events e
LEFT JOIN profiles p ON p.id = e.created_by
LEFT JOIN productions pr ON pr.id = e.production_id
WHERE e.start_time >= NOW()
  AND e.start_time <= NOW() + INTERVAL '30 days'
ORDER BY e.start_time ASC;

-- ──────────────────────────────────────────────────────────────────────────────
-- 16. INDEXES (performance)
-- ──────────────────────────────────────────────────────────────────────────────
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_voice_type ON profiles(voice_type);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_production ON events(production_id);
CREATE INDEX idx_attendance_event ON attendance(event_id);
CREATE INDEX idx_attendance_member ON attendance(member_id);
CREATE INDEX idx_songs_production ON songs(production_id);
CREATE INDEX idx_auditions_production ON auditions(production_id);
CREATE INDEX idx_auditions_status ON auditions(status);
CREATE INDEX idx_cast_roles_production ON cast_roles(production_id);
CREATE INDEX idx_cast_roles_member ON cast_roles(member_id);
CREATE INDEX idx_creative_tasks_status ON creative_tasks(status);
CREATE INDEX idx_creative_tasks_assigned ON creative_tasks(assigned_to);
CREATE INDEX idx_creative_tasks_production ON creative_tasks(production_id);
CREATE INDEX idx_meeting_notes_production ON meeting_notes(production_id);
CREATE INDEX idx_announcements_pinned ON announcements(is_pinned);

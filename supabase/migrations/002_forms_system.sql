-- ============================================================================
-- MIGRATION: Forms System & KVKK Consent
-- Run this SQL in Supabase SQL Editor
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. Add KVKK consent fields to profiles
-- ──────────────────────────────────────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kvkk_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kvkk_consent_date TIMESTAMPTZ;

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. ENUMS for Forms
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TYPE form_status AS ENUM ('draft', 'active', 'closed');
CREATE TYPE question_type AS ENUM ('text', 'textarea', 'select', 'multiselect', 'checkbox', 'radio', 'date', 'number');
CREATE TYPE form_target AS ENUM ('all', 'member', 'section_leader', 'specific');

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. FORMS table
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE forms (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title          TEXT NOT NULL,
  description    TEXT,
  status         form_status NOT NULL DEFAULT 'draft',
  target         form_target NOT NULL DEFAULT 'all',
  target_roles   user_role[] DEFAULT '{}',  -- If target = specific, which roles
  is_required    BOOLEAN NOT NULL DEFAULT FALSE,  -- Must complete before using system
  deadline       TIMESTAMPTZ,
  created_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Forms viewable by authenticated users"
  ON forms FOR SELECT
  TO authenticated
  USING (
    status = 'active' 
    OR status = 'closed'
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'creative_team', 'section_leader')
    )
  );

CREATE POLICY "Forms editable by creators and admins"
  ON forms FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'creative_team')
    )
  );

CREATE POLICY "Forms insertable by authorized roles"
  ON forms FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'creative_team', 'section_leader')
    )
  );

CREATE POLICY "Forms deletable by creators and admins"
  ON forms FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- 4. FORM_QUESTIONS table
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE form_questions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id        UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  question_text  TEXT NOT NULL,
  question_type  question_type NOT NULL DEFAULT 'text',
  options        JSONB DEFAULT '[]',  -- For select/multiselect/radio: [{value: string, label: string}]
  is_required    BOOLEAN NOT NULL DEFAULT FALSE,
  order_index    INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE form_questions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Questions viewable with form"
  ON form_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM forms WHERE forms.id = form_questions.form_id
    )
  );

CREATE POLICY "Questions editable by form owners"
  ON form_questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = form_questions.form_id 
      AND (
        forms.created_by = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'creative_team'))
      )
    )
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- 5. FORM_RESPONSES table
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE form_responses (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id        UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  answers        JSONB NOT NULL DEFAULT '{}',  -- {question_id: answer_value}
  submitted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(form_id, user_id)  -- One response per user per form
);

-- Enable RLS
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own responses"
  ON form_responses FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'creative_team', 'section_leader')
    )
  );

CREATE POLICY "Users can insert own responses"
  ON form_responses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own responses"
  ON form_responses FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- ──────────────────────────────────────────────────────────────────────────────
-- 6. INDEXES
-- ──────────────────────────────────────────────────────────────────────────────
CREATE INDEX idx_forms_status ON forms(status);
CREATE INDEX idx_forms_created_by ON forms(created_by);
CREATE INDEX idx_form_questions_form_id ON form_questions(form_id);
CREATE INDEX idx_form_responses_form_id ON form_responses(form_id);
CREATE INDEX idx_form_responses_user_id ON form_responses(user_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- 7. TRIGGERS for updated_at
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TRIGGER update_forms_updated_at
  BEFORE UPDATE ON forms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

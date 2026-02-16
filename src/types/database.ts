// ============================================================================
// Database types — mirrors the Supabase schema
// Generated manually; regenerate with `supabase gen types typescript`
// ============================================================================

export type UserRole = "admin" | "section_leader" | "creative_team" | "member";
export type VoiceType = "soprano" | "soprano_1" | "soprano_2" | "mezzo_soprano" | "alto" | "tenor" | "tenor_1" | "tenor_2" | "baritone" | "bass";
export type MemberStatus = "active" | "inactive" | "alumni" | "pending";
export type EventType = "rehearsal" | "performance" | "audition" | "meeting" | "workshop" | "social";
export type AttendanceStatus = "present" | "absent" | "late" | "excused";
export type CastRoleType = "lead" | "understudy" | "ensemble" | "swing";
export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskCategory = "costume" | "choreography" | "staging" | "lighting" | "sound" | "props" | "marketing" | "general";
export type AuditionStatus = "open" | "closed" | "in_review" | "completed";

// ── Row types ──────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: UserRole;
  voice_type: VoiceType | null;
  status: MemberStatus;
  bio: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  joined_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: number;
  is_pinned: boolean;
  author_id: string;
  created_at: string;
  updated_at: string;
}

export interface Production {
  id: string;
  title: string;
  description: string | null;
  season: string | null;
  start_date: string | null;
  end_date: string | null;
  poster_url: string | null;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: EventType;
  production_id: string | null;
  location: string | null;
  start_time: string;
  end_time: string;
  is_mandatory: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  event_id: string;
  member_id: string;
  status: AttendanceStatus;
  notes: string | null;
  marked_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Song {
  id: string;
  title: string;
  composer: string | null;
  arranger: string | null;
  genre: string | null;
  production_id: string | null;
  voice_parts: VoiceType[];
  duration_seconds: number | null;
  difficulty: number | null;
  lyrics: string | null;
  notes: string | null;
  sheet_music_url: string | null;
  audio_url: string | null;
  midi_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Audition {
  id: string;
  production_id: string;
  role_name: string;
  description: string | null;
  voice_required: VoiceType[] | null;
  audition_date: string | null;
  location: string | null;
  status: AuditionStatus;
  max_slots: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AuditionSignup {
  id: string;
  audition_id: string;
  member_id: string;
  notes: string | null;
  video_url: string | null;
  created_at: string;
}

export interface CastRole {
  id: string;
  production_id: string;
  member_id: string;
  role_name: string;
  role_type: CastRoleType;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreativeTask {
  id: string;
  title: string;
  description: string | null;
  category: TaskCategory;
  status: TaskStatus;
  priority: number;
  position: number;
  production_id: string | null;
  assigned_to: string | null;
  due_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingNote {
  id: string;
  title: string;
  content: string;
  production_id: string | null;
  meeting_date: string;
  attendees: string[];
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ── Supabase Database interface ────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, "id">>;
        Relationships: [];
      };
      announcements: {
        Row: Announcement;
        Insert: Omit<Announcement, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Announcement, "id">>;
        Relationships: [
          {
            foreignKeyName: "announcements_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      productions: {
        Row: Production;
        Insert: Omit<Production, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Production, "id">>;
        Relationships: [];
      };
      events: {
        Row: Event;
        Insert: Omit<Event, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Event, "id">>;
        Relationships: [];
      };
      attendance: {
        Row: Attendance;
        Insert: Omit<Attendance, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Attendance, "id">>;
        Relationships: [];
      };
      songs: {
        Row: Song;
        Insert: Omit<Song, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Song, "id">>;
        Relationships: [];
      };
      auditions: {
        Row: Audition;
        Insert: Omit<Audition, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Audition, "id">>;
        Relationships: [
          {
            foreignKeyName: "auditions_production_id_fkey";
            columns: ["production_id"];
            isOneToOne: false;
            referencedRelation: "productions";
            referencedColumns: ["id"];
          }
        ];
      };
      audition_signups: {
        Row: AuditionSignup;
        Insert: Omit<AuditionSignup, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<AuditionSignup, "id">>;
        Relationships: [];
      };
      cast_roles: {
        Row: CastRole;
        Insert: Omit<CastRole, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<CastRole, "id">>;
        Relationships: [
          {
            foreignKeyName: "cast_roles_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      creative_tasks: {
        Row: CreativeTask;
        Insert: Omit<CreativeTask, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<CreativeTask, "id">>;
        Relationships: [];
      };
      meeting_notes: {
        Row: MeetingNote;
        Insert: Omit<MeetingNote, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<MeetingNote, "id">>;
        Relationships: [];
      };
    };
    Views: {
      attendance_stats: {
        Row: {
          member_id: string;
          full_name: string;
          voice_type: VoiceType | null;
          total_events: number;
          present_count: number;
          absent_count: number;
          late_count: number;
          excused_count: number;
          adherence_score: number;
        };
        Relationships: [];
      };
      upcoming_events: {
        Row: Event & {
          created_by_name: string;
          production_title: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
    Enums: {
      user_role: UserRole;
      voice_type: VoiceType;
      member_status: MemberStatus;
      event_type: EventType;
      attendance_status: AttendanceStatus;
      cast_role_type: CastRoleType;
      task_status: TaskStatus;
      task_category: TaskCategory;
      audition_status: AuditionStatus;
    };
  };
}

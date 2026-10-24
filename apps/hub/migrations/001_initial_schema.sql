-- Versioned Migration 001: Initial School Hub Schema

CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS schools (
  id TEXT PRIMARY KEY,
  district_id TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  register_no TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  paired_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  revoked_at TEXT,
  token_hash TEXT
);

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL,
  name TEXT NOT NULL,
  prn TEXT NOT NULL UNIQUE,
  grade INTEGER NOT NULL,
  gender TEXT NOT NULL,
  assessed_level INTEGER NOT NULL DEFAULT 1,
  avatar_id TEXT NOT NULL DEFAULT 'avatar-1',
  pin_hash TEXT NOT NULL,
  parental_consent INTEGER NOT NULL DEFAULT 1,
  version INTEGER NOT NULL DEFAULT 1,
  device_id TEXT NOT NULL,
  hlc TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL,
  teacher_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  device_id TEXT NOT NULL,
  hlc TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL DEFAULT 'global',
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade INTEGER NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  content_blocks TEXT NOT NULL, -- JSON array
  audio_url TEXT,
  status TEXT NOT NULL DEFAULT 'PUBLISHED',
  estimated_minutes INTEGER NOT NULL DEFAULT 15,
  translations TEXT, -- JSON
  version INTEGER NOT NULL DEFAULT 1,
  device_id TEXT NOT NULL DEFAULT 'hub',
  hlc TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS quizzes (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL DEFAULT 'global',
  lesson_id TEXT NOT NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade INTEGER NOT NULL,
  total_marks INTEGER NOT NULL DEFAULT 10,
  passing_marks INTEGER NOT NULL DEFAULT 6,
  version INTEGER NOT NULL DEFAULT 1,
  device_id TEXT NOT NULL DEFAULT 'hub',
  hlc TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'MCQ',
  prompt TEXT NOT NULL,
  prompt_audio_url TEXT,
  prompt_image_url TEXT,
  options TEXT NOT NULL, -- JSON array
  correct_option_id TEXT NOT NULL,
  explanation TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  marks INTEGER NOT NULL DEFAULT 2
);

CREATE TABLE IF NOT EXISTS quiz_results (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  quiz_id TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'QUIZ',
  answers TEXT NOT NULL, -- JSON array
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  assessed_level INTEGER NOT NULL DEFAULT 1,
  started_at TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  device_id TEXT NOT NULL,
  hlc TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL,
  marked_by TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'TEACHER',
  note TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  device_id TEXT NOT NULL,
  hlc TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  UNIQUE(student_id, date)
);

CREATE TABLE IF NOT EXISTS at_risk_flags (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  rule_id TEXT NOT NULL,
  attendance_percent REAL,
  consecutive_absences INTEGER,
  suggested_scheme_ids TEXT, -- JSON array
  raised_at TEXT NOT NULL,
  resolved_at TEXT,
  resolved_by TEXT,
  note TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  device_id TEXT NOT NULL,
  hlc TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS schemes (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL DEFAULT 'global',
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  eligibility_rules TEXT NOT NULL, -- JSON
  required_documents TEXT NOT NULL, -- JSON
  application_steps TEXT NOT NULL, -- JSON
  where_to_apply TEXT NOT NULL,
  deadline TEXT,
  girl_specific INTEGER NOT NULL DEFAULT 0,
  attendance_threshold REAL,
  source_url TEXT NOT NULL,
  last_verified_at TEXT NOT NULL,
  translations TEXT, -- JSON
  version INTEGER NOT NULL DEFAULT 1,
  device_id TEXT NOT NULL DEFAULT 'hub',
  hlc TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS facilities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  address TEXT NOT NULL,
  contact_number TEXT,
  district_id TEXT NOT NULL,
  latitude REAL,
  longitude REAL
);

CREATE TABLE IF NOT EXISTS scheme_checklists (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  scheme_id TEXT NOT NULL,
  checked_docs TEXT NOT NULL, -- JSON array
  completed INTEGER NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1,
  device_id TEXT NOT NULL,
  hlc TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  UNIQUE(student_id, scheme_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  channels_tried TEXT NOT NULL, -- JSON array
  channel_used TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  delivered_at TEXT,
  metadata TEXT, -- JSON
  version INTEGER NOT NULL DEFAULT 1,
  device_id TEXT NOT NULL,
  hlc TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

-- Change Feed for device PULL requests
CREATE TABLE IF NOT EXISTS change_log (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  id TEXT UNIQUE NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  op TEXT NOT NULL,
  school_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  payload TEXT NOT NULL, -- JSON
  hlc TEXT NOT NULL,
  received_at TEXT NOT NULL
);

-- Hub Outbox for asynchronous background synchronization with Cloud
CREATE TABLE IF NOT EXISTS outbox (
  id TEXT PRIMARY KEY,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  op TEXT NOT NULL,
  school_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  payload TEXT NOT NULL, -- JSON
  hlc TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 1, -- 1: High (attendance/results), 2: Med, 3: Low
  created_at TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT
);

CREATE TABLE IF NOT EXISTS hub_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

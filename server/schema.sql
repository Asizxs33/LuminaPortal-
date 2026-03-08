-- LuminaPortal Database Schema

-- Users (students and admins)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  group_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tests
CREATE TABLE IF NOT EXISTS tests (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT,
  description TEXT,
  duration_minutes INT DEFAULT 30,
  passing_score INT DEFAULT 70,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Questions
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  test_id TEXT REFERENCES tests(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type TEXT DEFAULT 'single',
  order_index INT DEFAULT 0
);

-- Options for questions
CREATE TABLE IF NOT EXISTS options (
  id SERIAL PRIMARY KEY,
  question_id INT REFERENCES questions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false
);

-- Test results
CREATE TABLE IF NOT EXISTS results (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  test_id TEXT REFERENCES tests(id) ON DELETE CASCADE,
  score INT NOT NULL,
  total INT NOT NULL,
  passed BOOLEAN,
  completed_at TIMESTAMP DEFAULT NOW()
);

-- ScaleCode Database Schema
-- Run these SQL commands in your Supabase SQL Editor

-- 1. Users table (synced from Clerk)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Folders table (Problem patterns like Graph, Two Pointer, etc.)
CREATE TABLE folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'Graph', 'Two Pointer', 'Dynamic Programming'
  description TEXT,
  color TEXT DEFAULT '#3B82F6', -- Hex color for folder
  icon TEXT DEFAULT '📁', -- Emoji or icon
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Problems table
CREATE TABLE problems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  code TEXT NOT NULL,
  intuition TEXT, -- User's thought process
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 10),
  tags TEXT[], -- Array of tags like ['leetcode', 'medium', 'tree']
  platform TEXT, -- 'leetcode', 'hackerrank', 'codeforces'
  problem_url TEXT, -- Original problem URL
  time_complexity TEXT,
  space_complexity TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Revision attempts table
CREATE TABLE revision_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  submitted_code TEXT NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 100), -- Similarity score
  time_taken INTEGER, -- Time in seconds
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. User statistics table
CREATE TABLE user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_problems INTEGER DEFAULT 0,
  total_revisions INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0.00,
  streak_days INTEGER DEFAULT 0,
  last_revision_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_problems_user_id ON problems(user_id);
CREATE INDEX idx_problems_folder_id ON problems(folder_id);
CREATE INDEX idx_problems_difficulty ON problems(difficulty);
CREATE INDEX idx_revision_attempts_user_id ON revision_attempts(user_id);
CREATE INDEX idx_revision_attempts_problem_id ON revision_attempts(problem_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access their own data)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can manage own folders" ON folders FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));
CREATE POLICY "Users can manage own problems" ON problems FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));
CREATE POLICY "Users can manage own revision attempts" ON revision_attempts FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));
CREATE POLICY "Users can manage own stats" ON user_stats FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON folders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_problems_updated_at BEFORE UPDATE ON problems FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
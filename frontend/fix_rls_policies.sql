-- Fix for RLS policies to work with Clerk authentication
-- Run this in your Supabase SQL Editor

-- First, let's check and fix the RLS policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create more permissive policies for user management
CREATE POLICY "Users can view own data" ON users FOR SELECT 
USING (clerk_id = auth.jwt() ->> 'sub' OR clerk_id IS NOT NULL);

CREATE POLICY "Users can insert own data" ON users FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update own data" ON users FOR UPDATE 
USING (clerk_id = auth.jwt() ->> 'sub');

-- Alternative: Temporarily disable RLS for users table (if above doesn't work)
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- For other tables, update the policies to be more robust
DROP POLICY IF EXISTS "Users can manage own folders" ON folders;
CREATE POLICY "Users can manage own folders" ON folders FOR ALL 
USING (
  user_id IN (
    SELECT id FROM users 
    WHERE clerk_id = auth.jwt() ->> 'sub'
  )
);

DROP POLICY IF EXISTS "Users can manage own problems" ON problems;
CREATE POLICY "Users can manage own problems" ON problems FOR ALL 
USING (
  user_id IN (
    SELECT id FROM users 
    WHERE clerk_id = auth.jwt() ->> 'sub'
  )
);

DROP POLICY IF EXISTS "Users can manage own revision attempts" ON revision_attempts;
CREATE POLICY "Users can manage own revision attempts" ON revision_attempts FOR ALL 
USING (
  user_id IN (
    SELECT id FROM users 
    WHERE clerk_id = auth.jwt() ->> 'sub'
  )
);

DROP POLICY IF EXISTS "Users can manage own stats" ON user_stats;
CREATE POLICY "Users can manage own stats" ON user_stats FOR ALL 
USING (
  user_id IN (
    SELECT id FROM users 
    WHERE clerk_id = auth.jwt() ->> 'sub'
  )
);
'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'

export default function DatabaseTestPage() {
  const { user } = useUser()
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const runDatabaseTests = async () => {
    setLoading(true)
    const results: any[] = []

    try {
      // Test 1: Check if users table exists
      results.push({ test: 'Users table exists', status: 'running' })
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (usersError) {
        results[results.length - 1] = { 
          test: 'Users table exists', 
          status: 'failed', 
          error: usersError.message 
        }
      } else {
        results[results.length - 1] = { 
          test: 'Users table exists', 
          status: 'passed' 
        }
      }

      // Test 2: Check if folders table exists
      results.push({ test: 'Folders table exists', status: 'running' })
      const { data: foldersData, error: foldersError } = await supabase
        .from('folders')
        .select('count')
        .limit(1)
      
      if (foldersError) {
        results[results.length - 1] = { 
          test: 'Folders table exists', 
          status: 'failed', 
          error: foldersError.message 
        }
      } else {
        results[results.length - 1] = { 
          test: 'Folders table exists', 
          status: 'passed' 
        }
      }

      // Test 3: Check if problems table exists
      results.push({ test: 'Problems table exists', status: 'running' })
      const { data: problemsData, error: problemsError } = await supabase
        .from('problems')
        .select('count')
        .limit(1)
      
      if (problemsError) {
        results[results.length - 1] = { 
          test: 'Problems table exists', 
          status: 'failed', 
          error: problemsError.message 
        }
      } else {
        results[results.length - 1] = { 
          test: 'Problems table exists', 
          status: 'passed' 
        }
      }

      // Test 4: Check if revision_attempts table exists
      results.push({ test: 'Revision attempts table exists', status: 'running' })
      const { data: revisionsData, error: revisionsError } = await supabase
        .from('revision_attempts')
        .select('count')
        .limit(1)
      
      if (revisionsError) {
        results[results.length - 1] = { 
          test: 'Revision attempts table exists', 
          status: 'failed', 
          error: revisionsError.message 
        }
      } else {
        results[results.length - 1] = { 
          test: 'Revision attempts table exists', 
          status: 'passed' 
        }
      }

      // Test 5: Test user creation if user is logged in
      if (user) {
        results.push({ test: 'User authentication', status: 'running' })
        
        const { data: existingUser, error: userCheckError } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', user.id)
          .single()

        if (userCheckError && userCheckError.code !== 'PGRST116') {
          results[results.length - 1] = { 
            test: 'User authentication', 
            status: 'failed', 
            error: userCheckError.message 
          }
        } else if (!existingUser) {
          // Try to create user
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert([{
              clerk_id: user.id,
              email: user.emailAddresses?.[0]?.emailAddress || '',
              first_name: user.firstName || '',
              last_name: user.lastName || '',
            }])
            .select()

          if (createError) {
            results[results.length - 1] = { 
              test: 'User authentication', 
              status: 'failed', 
              error: `Failed to create user: ${createError.message}` 
            }
          } else {
            results[results.length - 1] = { 
              test: 'User authentication', 
              status: 'passed',
              message: 'User created successfully' 
            }
          }
        } else {
          results[results.length - 1] = { 
            test: 'User authentication', 
            status: 'passed',
            message: 'User exists in database' 
          }
        }
      } else {
        results.push({ 
          test: 'User authentication', 
          status: 'skipped',
          message: 'No user logged in' 
        })
      }

    } catch (error) {
      results.push({ 
        test: 'Overall database connection', 
        status: 'failed', 
        error: `${error}` 
      })
    }

    setTestResults(results)
    setLoading(false)
  }

  const createTablesSQL = `
-- Copy and paste this SQL into your Supabase SQL Editor and run it:

-- 1. Users table (synced from Clerk)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Folders table (Problem patterns like Graph, Two Pointer, etc.)
CREATE TABLE IF NOT EXISTS folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT '📁',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Problems table
CREATE TABLE IF NOT EXISTS problems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  code TEXT NOT NULL,
  intuition TEXT,
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 10),
  tags TEXT[],
  platform TEXT,
  problem_url TEXT,
  time_complexity TEXT,
  space_complexity TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Revision attempts table
CREATE TABLE IF NOT EXISTS revision_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  submitted_code TEXT NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  time_taken INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. User statistics table
CREATE TABLE IF NOT EXISTS user_stats (
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
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_problems_user_id ON problems(user_id);
CREATE INDEX IF NOT EXISTS idx_problems_folder_id ON problems(folder_id);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_revision_attempts_user_id ON revision_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_revision_attempts_problem_id ON revision_attempts(problem_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access their own data)
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "Users can insert own data" ON users;
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "Users can manage own folders" ON folders;
CREATE POLICY "Users can manage own folders" ON folders FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));

DROP POLICY IF EXISTS "Users can manage own problems" ON problems;
CREATE POLICY "Users can manage own problems" ON problems FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));

DROP POLICY IF EXISTS "Users can manage own revision attempts" ON revision_attempts;
CREATE POLICY "Users can manage own revision attempts" ON revision_attempts FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));

DROP POLICY IF EXISTS "Users can manage own stats" ON user_stats;
CREATE POLICY "Users can manage own stats" ON user_stats FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));
  `

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Database Health Check</h1>
          <p className="text-gray-600 mb-6">
            This page will test your Supabase database connection and table setup.
          </p>
          
          <button
            onClick={runDatabaseTests}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Running Tests...
              </>
            ) : (
              'Run Database Tests'
            )}
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-xl font-bold mb-4">Test Results</h2>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                  <span className="font-medium">{result.test}</span>
                  <div className="flex items-center gap-2">
                    {result.status === 'passed' && (
                      <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-sm">✓ Passed</span>
                    )}
                    {result.status === 'failed' && (
                      <span className="text-red-600 bg-red-100 px-2 py-1 rounded-full text-sm">✗ Failed</span>
                    )}
                    {result.status === 'running' && (
                      <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded-full text-sm">⏳ Running</span>
                    )}
                    {result.status === 'skipped' && (
                      <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-sm">- Skipped</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {testResults.some(r => r.status === 'failed') && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">Database Setup Required</h3>
                <p className="text-red-700 text-sm">
                  Some database tables are missing. Please copy and run the SQL below in your Supabase SQL Editor.
                </p>
              </div>
            )}
          </div>
        )}

        {testResults.some(r => r.status === 'failed') && (
          <div className="bg-gray-900 text-gray-100 rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-white">Database Setup SQL</h2>
            <div className="bg-gray-800 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm whitespace-pre-wrap">{createTablesSQL}</pre>
            </div>
            <div className="mt-4 p-3 bg-yellow-900 bg-opacity-50 border border-yellow-700 rounded-lg">
              <p className="text-yellow-200 text-sm">
                <strong>Instructions:</strong>
                <br />1. Go to your Supabase project dashboard
                <br />2. Navigate to SQL Editor
                <br />3. Copy and paste the SQL above
                <br />4. Click "Run" to create the tables
                <br />5. Come back and run the tests again
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <a
            href="/organize"
            className="text-blue-600 hover:underline"
          >
            ← Back to Organize Page
          </a>
        </div>
      </div>
    </div>
  )
}
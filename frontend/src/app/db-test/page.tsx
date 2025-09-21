'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DatabaseTestPage() {
  const [testResult, setTestResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testDatabaseConnection = async () => {
    setLoading(true)
    setTestResult('Testing database connection...\n')

    try {
      // Test basic connection
      const { data, error } = await supabase.from('users').select('count').limit(1)
      
      if (error) {
        setTestResult(prev => prev + `❌ Database connection failed: ${error.message}\n`)
        if (error.message.includes('relation "users" does not exist')) {
          setTestResult(prev => prev + `\n📋 SOLUTION: You need to create the database tables.\n`)
          setTestResult(prev => prev + `1. Go to your Supabase project dashboard\n`)
          setTestResult(prev => prev + `2. Navigate to SQL Editor\n`)
          setTestResult(prev => prev + `3. Copy and paste the SQL from 'database_schema.sql'\n`)
          setTestResult(prev => prev + `4. Run the SQL to create tables\n`)
        }
      } else {
        setTestResult(prev => prev + `✅ Database connection successful!\n`)
        
        // Test other tables
        const tables = ['folders', 'problems', 'revision_attempts', 'user_stats']
        
        for (const table of tables) {
          const { error: tableError } = await supabase.from(table).select('count').limit(1)
          if (tableError) {
            setTestResult(prev => prev + `❌ Table '${table}' error: ${tableError.message}\n`)
          } else {
            setTestResult(prev => prev + `✅ Table '${table}' exists\n`)
          }
        }
      }
    } catch (err) {
      setTestResult(prev => prev + `❌ Unexpected error: ${err}\n`)
    }
    
    setLoading(false)
  }

  const createDatabaseTables = async () => {
    setLoading(true)
    setTestResult('Creating database tables...\n')

    const sql = `
-- ScaleCode Database Schema
-- Creating tables...

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

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
    `

    try {
      // Note: This approach with executing raw SQL from the client is not recommended for production
      // It's better to run this directly in Supabase SQL Editor
      setTestResult(prev => prev + `⚠️ Cannot create tables directly from client for security reasons.\n`)
      setTestResult(prev => prev + `\n📋 Please copy the SQL from 'database_schema.sql' and run it in your Supabase SQL Editor:\n`)
      setTestResult(prev => prev + `1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql\n`)
      setTestResult(prev => prev + `2. Copy the SQL from 'database_schema.sql'\n`)
      setTestResult(prev => prev + `3. Paste and run it\n`)
    } catch (err) {
      setTestResult(prev => prev + `❌ Error: ${err}\n`)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Database Setup & Testing</h1>
          
          <div className="space-y-4 mb-8">
            <button
              onClick={testDatabaseConnection}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Database Connection'}
            </button>
            
            <button
              onClick={createDatabaseTables}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 ml-4"
            >
              Get Table Creation Instructions
            </button>
          </div>
          
          {testResult && (
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap overflow-auto max-h-96">
              {testResult}
            </div>
          )}
          
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Quick Setup Instructions:</h3>
            <ol className="text-yellow-700 space-y-1 text-sm">
              <li>1. Click "Test Database Connection" to check if tables exist</li>
              <li>2. If tables don't exist, go to your Supabase SQL Editor</li>
              <li>3. Copy and paste the SQL from 'database_schema.sql' file</li>
              <li>4. Run the SQL to create all necessary tables</li>
              <li>5. Come back and test again</li>
              <li>6. Once tables exist, go back to the organize page</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
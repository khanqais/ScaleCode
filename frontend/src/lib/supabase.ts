import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variable')
}

// Main client for regular operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for user management (bypasses RLS)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase

// Types
export interface User {
  id: string
  clerk_id: string
  email: string
  first_name?: string
  last_name?: string
  created_at: string
  updated_at: string
}

export interface Folder {
  id: string
  user_id: string
  name: string
  description?: string
  color: string
  icon: string
  created_at: string
  updated_at: string
  problem_count?: number
}

export interface Problem {
  id: string
  user_id: string
  folder_id: string
  title: string
  problem_statement: string
  code: string
  intuition?: string
  difficulty: number
  tags?: string[]
  platform?: string
  problem_url?: string
  time_complexity?: string
  space_complexity?: string
  created_at: string
  updated_at: string
  folder?: Folder
}

export interface RevisionAttempt {
  id: string
  user_id: string
  problem_id: string
  submitted_code: string
  score: number
  time_taken?: number
  completed: boolean
  created_at: string
  problem?: Problem
}

export interface UserStats {
  id: string
  user_id: string
  total_problems: number
  total_revisions: number
  average_score: number
  streak_days: number
  last_revision_date?: string
  created_at: string
  updated_at: string
}
'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { Plus, Folder as FolderIcon, Brain, Star, Target, BookOpen } from 'lucide-react'
import { LoadingSpinner, EmptyState, StatCard } from '@/components/ui/shared'

interface Folder {
  id: string
  name: string
  description: string
  color: string
  problem_count?: number
  created_at: string
  updated_at: string
  user_id: string
}

interface Stats {
  totalProblems: number
  totalFolders: number
  averageDifficulty: number
  revisionStreak: number
}

export default function OrganizePage() {
  const { user } = useUser()
  const router = useRouter()
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [stats, setStats] = useState<Stats>({
    totalProblems: 0,
    totalFolders: 0,
    averageDifficulty: 0,
    revisionStreak: 0,
  })

  useEffect(() => {
    if (user) {
      checkDatabaseHealth()
      fetchUserData()
    }
  }, [user])

  const checkDatabaseHealth = async () => {
    try {
      // Test if tables exist by trying to query them
      const { data: usersTest, error: usersError } = await supabase
        .from('users')
        .select('count')
        .limit(1)

      const { data: foldersTest, error: foldersError } = await supabase
        .from('folders')
        .select('count')
        .limit(1)

      if (usersError || foldersError) {
        console.error('Database tables might not exist. Please run the SQL from database_schema.sql in your Supabase SQL Editor.')
        console.error('Users table error:', usersError)
        console.error('Folders table error:', foldersError)
        
        alert('Database tables are not set up. Please check the console for instructions.')
      } else {
        console.log('Database health check passed')
      }
    } catch (err) {
      console.error('Database health check failed:', err)
    }
  }

  const fetchUserData = async () => {
    setLoading(true)
    try {
      await ensureUserExists()
      await Promise.all([fetchFolders(), fetchStats()])
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const ensureUserExists = async () => {
    if (!user) return

    console.log('Ensuring user exists for:', user.id)

    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking for user:', selectError)
      return
    }

    if (!existingUser) {
      console.log('Creating new user in database')
      // Use admin client to bypass RLS for user creation
      const { data: newUser, error: insertError } = await supabaseAdmin
        .from('users')
        .insert([{
          clerk_id: user.id,
          email: user.emailAddresses?.[0]?.emailAddress || '',
          first_name: user.firstName || '',
          last_name: user.lastName || '',
        }])
        .select()

      if (insertError) {
        console.error('Error creating user:', insertError)
      } else {
        console.log('User created successfully:', newUser)
      }
    } else {
      console.log('User already exists:', existingUser)
    }
  }

  const fetchFolders = async () => {
    if (!user) return

    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single()

    if (!userData) return

    const { data: foldersData } = await supabase
      .from('folders')
      .select('*, problems(count)')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })

    if (foldersData) {
      const foldersWithCounts = foldersData.map((folder: any) => ({
        ...folder,
        problem_count: folder.problems?.[0]?.count || 0,
      }))
      setFolders(foldersWithCounts)
    }
  }

  const fetchStats = async () => {
    if (!user) return

    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single()

    if (!userData) return
    
    // Fetch statistics as needed here, dummy example:
    setStats({
      totalProblems: 50,
      totalFolders: folders.length,
      averageDifficulty: 6.5,
      revisionStreak: 3,
    })
  }

  const handleCreateFolder = async (name: string, description: string, color = '#3B82F6') => {
    console.log('Creating folder with:', { name, description, color })
    
    if (!user) {
      console.error('No user found')
      return
    }

    try {
      // First ensure user exists in database
      await ensureUserExists()
      
      // Get user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', user.id)
        .single()

      if (userError) {
        console.error('Error fetching user:', userError)
        alert('Error: Unable to find user in database. Please try refreshing the page.')
        return
      }

      if (!userData) {
        console.error('No user data found after ensuring user exists')
        alert('Error: Unable to create user record. Please check your database connection.')
        return
      }

      console.log('User data:', userData)

      // Create the folder
      const { data, error } = await supabase.from('folders').insert([{
        name,
        description,
        color,
        user_id: userData.id,
      }]).select()

      console.log('Insert result:', { data, error })

      if (!error) {
        await fetchUserData()
        setShowCreateFolder(false)
        alert('Folder created successfully!')
      } else {
        console.error('Failed to create folder:', error)
        alert(`Failed to create folder: ${error.message || 'Unknown error'}`)
      }
    } catch (err) {
      console.error('Exception in handleCreateFolder:', err)
      alert(`Error: ${err}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading your workspace..." />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Please sign in to access this page</h2>
          <p className="text-gray-600">You need to be signed in to organize your coding solutions.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, {user.firstName}!</h1>
          <div className="flex gap-3">
            <a 
              href="/database-test"
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-600 transition-colors text-sm"
            >
              🔧 Database Test
            </a>
            <button
              onClick={() => setShowCreateFolder(true)}
              className="bg-black text-white px-6 py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center gap-3"
            >
              <Plus size={20} /> New Pattern
            </button>
          </div>
        </div>

        <p className="text-gray-600 text-lg mb-8">
          Organize your DSA solutions by patterns and ace your revisions
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={BookOpen}
            label="Total Problems"
            value={stats.totalProblems}
            color="blue"
          />
          <StatCard
            icon={FolderIcon}
            label="Pattern Folders"
            value={stats.totalFolders}
            color="green"
          />
          <StatCard
            icon={Brain}
            label="Average Difficulty"
            value={`${stats.averageDifficulty || 0}/10`}
            color="purple"
          />
          <StatCard
            icon={Star}
            label="Revision Streak"
            value={`${stats.revisionStreak} days`}
            color="yellow"
          />
        </div>

        {folders.length === 0 ? (
          <EmptyState
            icon={FolderIcon}
            title="No pattern folders yet"
            description="Create your first folder to organize problems by patterns like Graph Algorithms, Two Pointer Technique, Dynamic Programming, etc."
            action={{
              label: "Create Your First Pattern Folder",
              onClick: () => setShowCreateFolder(true),
              icon: Brain
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer transform hover:scale-105"
                style={{ borderTop: `4px solid ${folder.color || '#3B82F6'}` }}
                onClick={() => router.push(`/organize/${folder.id}`)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{folder.name}</h3>
                  <FolderIcon size={24} />
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{folder.description}</p>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">{folder.problem_count || 0} problems</span>
                  <span className="text-xs text-gray-500">Click to open folder</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateFolder && (
          <CreateFolderModal
            onClose={() => setShowCreateFolder(false)}
            onCreate={handleCreateFolder}
          />
        )}
      </div>
    </div>
  )
}

function CreateFolderModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (name: string, desc: string, color?: string) => void
}) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [color, setColor] = useState('#3B82F6')

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() === '') return
    onCreate(name, desc, color)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-6">Create New Pattern Folder</h2>
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pattern Name</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            placeholder="e.g., Graph Algorithms, Two Pointer Technique"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            rows={3}
            placeholder="Describe what kind of problems this pattern covers..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <label className="block text-sm font-medium text-gray-700 mb-2">Color Theme</label>
          <div className="flex gap-2 mb-6">
            {colors.map((c) => (
              <label key={c} className="cursor-pointer">
                <input
                  type="radio"
                  name="color"
                  value={c}
                  checked={color === c}
                  onChange={() => setColor(c)}
                  className="sr-only"
                />
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-200"
                  style={{ backgroundColor: c }}
                />
              </label>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Create Pattern
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

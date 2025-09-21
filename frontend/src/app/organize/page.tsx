'use client'

import { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import { Plus, Folder as FolderIcon, FileCode, Brain, Star, TrendingUp, Code, Calendar, AlertCircle } from 'lucide-react'

interface Problem {
  _id: string
  title: string
  category: string
  difficulty: number
  createdAt: string
}

interface Stats {
  totalProblems: number
  categories: number
  averageDifficulty: number
  recentActivity: number
  categoryStats: Record<string, number>
  difficultyStats: {
    easy: number
    medium: number
    hard: number
  }
}

export default function OrganizePage() {
  const { user } = useUser()
  const { getToken } = useAuth()
  const router = useRouter()
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState<Stats>({
    totalProblems: 0,
    categories: 0,
    averageDifficulty: 0,
    recentActivity: 0,
    categoryStats: {},
    difficultyStats: { easy: 0, medium: 0, hard: 0 }
  })

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      setError('')
      
      await Promise.all([
        syncUser(),
        fetchProblems(),
        fetchStats()
      ])
    } catch (error) {
      console.error('Error fetching user data:', error)
      setError('Failed to load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Sync user with backend (ensure user exists in MongoDB)
  const syncUser = async () => {
    try {
      console.log('Starting user sync...')
      const token = await getToken()
      console.log('Token obtained:', token ? 'Yes' : 'No')
      
      const response = await fetch('http://localhost:5000/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server error:', errorText)
        throw new Error(`Failed to sync user: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('User synced:', result.data)
    } catch (error) {
      console.error('Error syncing user:', error)
      throw error
    }
  }

  // Fetch user's problems
  const fetchProblems = async () => {
    try {
      const token = await getToken()
      
      const response = await fetch('http://localhost:5000/api/problems?limit=6', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch problems: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setProblems(result.data.problems || [])
        console.log('Problems fetched:', result.data.problems?.length || 0)
      } else {
        throw new Error(result.error || 'Failed to fetch problems')
      }
    } catch (error) {
      console.error('Error fetching problems:', error)
      // Don't set error for problems - just show empty state
    }
  }

  // Fetch user's stats
  const fetchStats = async () => {
    try {
      const token = await getToken()
      
      const response = await fetch('http://localhost:5000/api/users/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setStats(result.data)
        console.log('Stats fetched:', result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch stats')
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Keep default stats if fetch fails
    }
  }

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'text-green-600 bg-green-100'
    if (difficulty <= 6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return 'Invalid date'
    }
  }

  // Retry function for failed requests
  const handleRetry = () => {
    fetchUserData()
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh] text-center p-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Please sign in to access ScaleCode</h2>
            <p className="text-gray-600 text-lg">You need to be signed in to organize your coding solutions.</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh] flex-col">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black mb-4"></div>
          <p className="text-gray-600">Loading your data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-500" size={20} />
              <span className="text-red-700">{error}</span>
            </div>
            <button
              onClick={handleRetry}
              className="text-red-600 hover:text-red-800 font-medium underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-gray-600 text-lg">
                Organize your DSA solutions by patterns and ace your revisions
              </p>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => router.push('/')}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg flex items-center gap-3"
              >
                <Brain size={24} />
                <div className="text-left">
                  <div>Start Revision</div>
                  <div className="text-xs opacity-80">Practice your problems</div>
                </div>
              </button>
              
              <button
                onClick={() => router.push('/add-problem')}
                className="bg-black text-white px-6 py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Add Problem
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Problems</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalProblems}</p>
                </div>
                <FileCode className="text-blue-500" size={28} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Categories</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.categories}</p>
                </div>
                <FolderIcon className="text-green-500" size={28} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Difficulty</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.averageDifficulty}/10</p>
                </div>
                <Star className="text-yellow-500" size={28} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.recentActivity}</p>
                </div>
                <TrendingUp className="text-purple-500" size={28} />
              </div>
            </div>
          </div>

          {/* Category Breakdown (if you have data) */}
          {stats.totalProblems > 0 && Object.keys(stats.categoryStats).length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
              <p className="text-sm text-gray-600 mb-4">Click on any category to view filtered problems</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.categoryStats).map(([category, count]) => (
                  <div 
                    key={category} 
                    className="text-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer transform hover:scale-105 shadow-sm hover:shadow-md"
                    onClick={() => router.push(`/problems?category=${encodeURIComponent(category)}`)}
                  >
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600 mb-2">{category}</div>
                    <div className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      View Problems →
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Problems Section */}
        {problems.length === 0 ? (
          <div className="text-center py-20">
            <Code size={80} className="mx-auto text-gray-300 mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No problems yet</h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Create your first problem to start organizing your DSA solutions by patterns like Graph Algorithms, Dynamic Programming, etc.
            </p>
            
            <button
              onClick={() => router.push('/add-problem')}
              className="bg-black text-white px-8 py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-3"
            >
              <Plus size={24} />
              Add Your First Problem
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Problems</h2>
              <button
                onClick={() => router.push('/problems')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View all →
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {problems.map((problem) => (
                <div
                  key={problem._id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => router.push(`/problems/${problem._id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
                      {problem.category}
                    </span>
                    <span className={`text-sm px-3 py-1 rounded-full font-medium ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}/10
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 mb-2 text-lg line-clamp-2">
                    {problem.title}
                  </h3>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-1" />
                      {formatDate(problem.createdAt)}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/revision/${problem._id}`)
                      }}
                      className="text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Practice →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

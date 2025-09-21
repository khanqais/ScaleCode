'use client'

import { useState, useEffect, useCallback } from 'react'
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

  const fetchUserData = useCallback(async () => {
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
  }, [])

  // Sync user with backend (ensure user exists in MongoDB)
  const syncUser = useCallback(async () => {
    try {
      console.log('Starting user sync...')
      const token = await getToken()
      console.log('Token obtained:', token ? 'Yes' : 'No')
      
      const response = await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
  }, [getToken])

  // Fetch user's problems
  const fetchProblems = useCallback(async () => {
    try {
      const response = await fetch('/api/problems?limit=6', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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
    }
  }, [])

  // Fetch user's stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/users/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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
    }
  }, [])

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

  const handleRetry = () => {
    fetchUserData()
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh] text-center px-4 py-8">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Please sign in to access ScaleCode
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              You need to be signed in to organize your coding solutions.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh] flex-col px-4">
          <div className="animate-spin rounded-full h-24 w-24 sm:h-32 sm:w-32 border-b-2 border-black mb-4"></div>
          <p className="text-gray-600 text-center">Loading your data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                <span className="text-red-700 text-sm sm:text-base">{error}</span>
              </div>
              <button
                onClick={handleRetry}
                className="text-red-600 hover:text-red-800 font-medium underline text-sm sm:text-base self-start sm:self-center"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="mb-6 sm:mb-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:gap-6 mb-6">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                Organize your DSA solutions by patterns and ace your revisions
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button 
                onClick={() => router.push('/')}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center sm:justify-start gap-3"
              >
                <Brain size={20} className="sm:w-6 sm:h-6" />
                <div className="text-center sm:text-left">
                  <div className="text-sm sm:text-base">Start Revision</div>
                  <div className="text-xs opacity-80 hidden sm:block">Practice your problems</div>
                </div>
              </button>
              
              <button
                onClick={() => router.push('/add-problem')}
                className="w-full sm:w-auto bg-black text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                <span className="text-sm sm:text-base">Add Problem</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Total Problems</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats.totalProblems}</p>
                </div>
                <FileCode className="text-blue-500" size={20} />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Categories</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats.categories}</p>
                </div>
                <FolderIcon className="text-green-500" size={20} />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Avg Difficulty</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats.averageDifficulty}/10</p>
                </div>
                <Star className="text-yellow-500" size={20} />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">This Week</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats.recentActivity}</p>
                </div>
                <TrendingUp className="text-purple-500" size={20} />
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          {stats.totalProblems > 0 && Object.keys(stats.categoryStats).length > 0 && (
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4">Category Breakdown</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Click on any category to view filtered problems</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
                {Object.entries(stats.categoryStats).map(([category, count]) => (
                  <div 
                    key={category} 
                    className="text-center p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer transform hover:scale-105 shadow-sm hover:shadow-md"
                    onClick={() => router.push(`/problems?category=${encodeURIComponent(category)}`)}
                  >
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2 line-clamp-2">{category}</div>
                    <div className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
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
          <div className="text-center py-12 sm:py-20 px-4">
            <Code size={60} className="sm:w-20 sm:h-20 mx-auto text-gray-300 mb-4 sm:mb-6" />
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">No problems yet</h3>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto">
              Create your first problem to start organizing your DSA solutions by patterns like Graph Algorithms, Dynamic Programming, etc.
            </p>
            
            <button
              onClick={() => router.push('/add-problem')}
              className="bg-black text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-3"
            >
              <Plus size={20} className="sm:w-6 sm:h-6" />
              <span className="text-sm sm:text-base">Add Your First Problem</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recent Problems</h2>
              <button
                onClick={() => router.push('/problems')}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base self-start sm:self-center"
              >
                View all →
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {problems.map((problem) => (
                <div
                  key={problem._id}
                  className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => router.push(`/problems/${problem._id}`)}
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <span className="text-xs sm:text-sm text-blue-600 bg-blue-100 px-2 sm:px-3 py-1 rounded-full font-medium">
                      {problem.category}
                    </span>
                    <span className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-medium ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}/10
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 mb-2 text-base sm:text-lg line-clamp-2">
                    {problem.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1 flex-shrink-0" />
                      <span className="truncate">{formatDate(problem.createdAt)}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/revision/${problem._id}`)
                      }}
                      className="text-purple-600 hover:text-purple-800 font-medium flex-shrink-0 ml-2"
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

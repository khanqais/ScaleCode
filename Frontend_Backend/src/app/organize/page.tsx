﻿'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import RevisionModal from '@/components/RevisionModal'
import { Plus, Folder as FolderIcon, FileCode, Brain, Star, TrendingUp, Code, Calendar, AlertCircle, RefreshCw, Play } from 'lucide-react'

interface Problem {
  _id: string
  title: string
  category: string
  difficulty: number
  createdAt: string
  problemStatement?: string
  myCode?: string
  intuition?: string
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
  const router = useRouter()
  
  const [problems, setProblems] = useState<Problem[]>([])
  const [stats, setStats] = useState<Stats>({
    totalProblems: 0,
    categories: 0,
    averageDifficulty: 0,
    recentActivity: 0,
    categoryStats: {},
    difficultyStats: { easy: 0, medium: 0, hard: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showRevisionModal, setShowRevisionModal] = useState(false)
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null)
  const [loadingProblem, setLoadingProblem] = useState(false)

  const fetchProblems = async () => {
    if (!user) {
       return
    }
    
    try {
      const response = await fetch(`/api/problems?t=${Date.now()}`)
      const data = await response.json()
      
      if (data.success) {
        setProblems(data.data.problems || [])
      } else {
        setError('Failed to fetch problems')
      }
    } catch (error) {
      console.error(' Error fetching problems:', error)
      setError('Failed to fetch problems')
    }
  }

  const fetchStats = async () => {
    if (!user) return
    
    try {
      const response = await fetch(`/api/users/stats?t=${Date.now()}`)
      const data = await response.json()
      
      if (data.success) {
        console.log('Total problems from stats:', data.data.totalProblems) 
        setStats(data.data)
      } else {
        setError('Failed to fetch stats')
      }
    } catch (error) {
      console.error(' Error fetching stats:', error)
      setError('Failed to fetch stats')
    }
  }

  const fetchAllData = async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    await Promise.all([fetchProblems(), fetchStats()])
    
    setLoading(false)
  }

  const fetchProblemDetails = async (problemId: string) => {
    try {
      setLoadingProblem(true)
      const response = await fetch(`/api/problems/${problemId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch problem details: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error || 'Failed to fetch problem details')
      }
    } catch (err) {
      console.error('Error fetching problem details:', err)
      alert('Failed to load problem details for revision')
      return null
    } finally {
      setLoadingProblem(false)
    }
  }

  const handleStartRevision = async (problem: Problem) => {
    const fullProblem = await fetchProblemDetails(problem._id)
    
    if (fullProblem) {
      setSelectedProblem(fullProblem)
      setShowRevisionModal(true)
    }
  }

  useEffect(() => {
    if (user) {
      console.log(' User available, fetching data...')
      fetchAllData()
    }
  }, [user, router])

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const refresh = searchParams.get('refresh')
    
    if (refresh && user) {
      fetchAllData()
      window.history.replaceState({}, '', '/organize')
    }
  }, [user])

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) {
      return 'text-green-600 bg-green-100'
    }
    if (difficulty <= 6) {
      return 'text-yellow-600 bg-yellow-100'
    }
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

  const handleRetry = async () => {
    await fetchAllData()
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh] text-center px-4 py-8">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
              Please sign in to access AlgoGrid
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 transition-colors">
              You need to be signed in to organize your coding solutions.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="animate-pulse">
            <div className="mb-6 sm:mb-8">
              <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96"></div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                    <div className="h-5 w-5 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-12 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="border border-gray-100 rounded-lg p-4">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        
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
          <div className="flex flex-col gap-4 sm:gap-6 mb-6">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 transition-colors">
                Organize your DSA solutions by patterns and ace your revisions
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button 
                onClick={() => router.push('')}
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
                className="w-full sm:w-auto bg-black dark:bg-white text-white dark:text-black px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                <span className="text-sm sm:text-base">Add Problem</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white transition-colors">Your Progress</h2>
            <button
              onClick={handleRetry}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh stats"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 transition-colors">Total Problems</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white transition-colors">{stats.totalProblems}</p>
                </div>
                <FileCode className="text-blue-500" size={20} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 transition-colors">Categories</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white transition-colors">{stats.categories}</p>
                </div>
                <FolderIcon className="text-green-500" size={20} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 transition-colors">This Week</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white transition-colors">{stats.recentActivity}</p>
                </div>
                <TrendingUp className="text-purple-500" size={20} />
              </div>
            </div>
          </div>

          {stats.totalProblems > 0 && Object.keys(stats.categoryStats).length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6 sm:mb-8 transition-colors">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-4 transition-colors">Category Breakdown</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 transition-colors">Click on any category to view filtered problems</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
                {Object.entries(stats.categoryStats).map(([category, count]) => (
                  <div 
                    key={category} 
                    className="text-center p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 cursor-pointer transform hover:scale-105 shadow-sm hover:shadow-md"
                    onClick={() => router.push(`/problems?category=${encodeURIComponent(category)}`)}
                  >
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white transition-colors">{count}</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 sm:mb-2 line-clamp-2 transition-colors">{category}</div>
                    <div className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                      View Problems →
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

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
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white transition-colors">Recent Problems</h2>
              <button
                onClick={() => router.push('/problems')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm sm:text-base self-start sm:self-center transition-colors"
              >
                View all →
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {problems.map((problem) => (
                <div
                  key={problem._id}
                  className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => router.push(`/problems/${problem._id}`)}
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <span className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 sm:px-3 py-1 rounded-full font-medium transition-colors">
                      {problem.category}
                    </span>
                    <span className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-medium ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}/10
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-base sm:text-lg line-clamp-2 transition-colors">
                    {problem.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400 transition-colors">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1 flex-shrink-0" />
                      <span className="truncate">{formatDate(problem.createdAt)}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStartRevision(problem)
                      }}
                      disabled={loadingProblem}
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium flex-shrink-0 ml-2 flex items-center gap-1 disabled:opacity-50 transition-colors"
                    >
                      <Play size={12} />
                      {loadingProblem ? 'Loading...' : 'Practice'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loadingProblem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              <span className="text-gray-700">Loading problem for revision...</span>
            </div>
          </div>
        )}

        {showRevisionModal && selectedProblem && (
          <RevisionModal
            isOpen={showRevisionModal}
            onClose={() => {
              setShowRevisionModal(false)
              setSelectedProblem(null)
            }}
            problem={selectedProblem}
          />
        )}
      </div>
    </div>
  )
}

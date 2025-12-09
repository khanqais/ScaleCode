'use client'

import { useState, useEffect, Suspense, useMemo, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { ButtonColorful } from '@/components/ui/button-colorful'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { FileCode, Calendar, Star, ArrowRight, Plus, Filter, X, Search, Play, Trash2 } from 'lucide-react'

interface Problem {
  _id: string
  title: string
  category: string
  Confidence: number
  createdAt: string
  problemStatement?: string
  myCode?: string
  intuition?: string
  tags?: string[]
}

function ProblemsPageContent() {
  const { user } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Simple state management instead of SWR
  const [allProblems, setAllProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchProblems = useCallback(async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const response = await fetch('/api/problems', {
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
        setAllProblems(result.data.problems || [])
        setError('')
      } else {
        setError(result.error || 'Failed to fetch problems')
      }
    } catch {
      setError('Failed to fetch problems')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchProblems()
    }
  }, [user, fetchProblems])

  const availableCategories = [...new Set(allProblems.map((p: Problem) => p.category))] as string[]

  const filteredProblems = useMemo(() => {
    let filtered = allProblems

    if (selectedCategory) {
      filtered = filtered.filter((problem: Problem) => {
        return problem.category.toLowerCase().trim() === selectedCategory.toLowerCase().trim()
      })
    }

    if (searchTerm) {
      filtered = filtered.filter((problem: Problem) =>
        problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }, [allProblems, selectedCategory, searchTerm])

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl) {
      const decodedCategory = decodeURIComponent(categoryFromUrl)
      setSelectedCategory(decodedCategory)
    } else {
      setSelectedCategory('')
    }
  }, [searchParams])

  const handleStartRevision = (problemId: string) => {
    router.push(`/revision/${problemId}`)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence <= 3) {
      return 'text-red-600'
    }
    if (confidence <= 6) {
      return 'text-yellow-600'
    }
    return 'text-green-600'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence <= 3) {
      return 'Low Confidence'
    }
    if (confidence <= 6) {
      return 'Medium Confidence'
    }
    return 'High Confidence'
  }

  const handleCategoryFilter = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory('')
      router.push('/problems')
    } else {
      setSelectedCategory(category)
      router.push(`/problems?category=${encodeURIComponent(category)}`)
    }
  }

  const clearAllFilters = () => {
    setSelectedCategory('')
    setSearchTerm('')
    router.push('/problems')
  }

  const handleDeleteProblem = async (problemId: string) => {
    if (!confirm('Are you sure you want to delete this problem? This action cannot be undone.')) {
      return
    }

    setDeletingId(problemId)
    try {
      const response = await fetch(`/api/problems?id=${problemId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Simple refresh - just refetch the data
        await fetchProblems()
      } else {
        setErrorMessage(result.error || 'Failed to delete problem')
      }
    } catch {
      setErrorMessage('Failed to delete problem. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-transparent transition-colors">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh] text-center p-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">Please sign in to access your problems</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg transition-colors">You need to be signed in to view your coding solutions.</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent transition-colors">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent transition-colors">
      <Navbar />
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Your Problems</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 transition-colors">
              {selectedCategory 
                ? `Showing ${filteredProblems.length} ${selectedCategory} problems`
                : `${filteredProblems.length} total problems`
              }
            </p>
          </div>
          <ButtonColorful
            onClick={() => router.push('/main-revision')}
            label="Start Revision"
            className="w-full sm:w-auto px-4 sm:px-6 py-3 h-auto shadow-lg"
          />
        </div>

        {availableCategories.length > 0 && (
          <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
              <input
                type="text"
                placeholder="Search problems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 pr-4 py-2 w-full sm:w-80 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Filter className="text-gray-500 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Categories:</span>
              
              {availableCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryFilter(category)}
                  className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
              
              {(selectedCategory || searchTerm) && (
                <button
                  onClick={clearAllFilters}
                  className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/40 flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Clear
                </button>
              )}
            </div>

            {selectedCategory && (
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-2 sm:p-3">
                <p className="text-blue-800 dark:text-blue-300 text-xs sm:text-sm">
                  <strong>Active Filter:</strong> Showing problems in &ldquo;{selectedCategory}&rdquo; category
                </p>
              </div>
            )}
          </div>
        )}

        {(error || errorMessage) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error || errorMessage}
          </div>
        )}

        {filteredProblems.length === 0 ? (
          <div className="text-center py-12 sm:py-20 px-4">
            <FileCode className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-300 dark:text-gray-600 mb-4 sm:mb-6" />
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {selectedCategory 
                ? `No ${selectedCategory} problems found`
                : searchTerm 
                ? 'No problems match your search'
                : 'No problems yet'
              }
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto">
              {selectedCategory || searchTerm
                ? 'Try adjusting your filters or search terms'
                : 'Start adding problems to track your coding practice'
              }
            </p>
            {!selectedCategory && !searchTerm && (
              <Link 
                href="/add-problem"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition-colors text-sm sm:text-base"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                Add Your First Problem
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProblems.map((problem: Problem) => (
              <div key={problem._id} className="relative bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 transition-all">
                <GlowingEffect 
                  proximity={150} 
                  spread={40} 
                  blur={15}
                  borderWidth={2}
                  disabled={false}
                />
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 transition-colors">
                      {problem.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 transition-colors">
                      <span 
                        className={`px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                          selectedCategory === problem.category
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/40'
                        }`}
                        onClick={() => handleCategoryFilter(problem.category)}
                      >
                        {problem.category}
                      </span>
                      <span className={`font-medium ${getConfidenceColor(problem.Confidence)}`}>
                        {getConfidenceLabel(problem.Confidence)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 ml-2 flex-shrink-0">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 sm:h-4 sm:w-4 ${
                          i < Math.floor(problem.Confidence / 2) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 transition-colors">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    {new Date(problem.createdAt).toLocaleDateString()}
                  </div>
                  {problem.tags && problem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 sm:gap-1.5">
                      {problem.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-1.5 sm:px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-[10px] sm:text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                      {problem.tags.length > 3 && (
                        <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                          +{problem.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => handleStartRevision(problem._id)}
                      className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors text-xs sm:text-sm font-medium"
                    >
                      <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden xs:inline">Practice</span>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteProblem(problem._id)}
                      disabled={deletingId === problem._id}
                      className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50"
                      title="Delete problem"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      {deletingId === problem._id && <span className="hidden sm:inline">...</span>}
                    </button>
                  </div>
                  
                  <Link 
                    href={`/problems/${problem._id}`}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-xs sm:text-sm flex items-center gap-1 transition-colors"
                  >
                    <span className="hidden sm:inline">View</span> Details
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        </main>
    </div>
  )
}

export default function ProblemsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-transparent">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
        </div>
      </div>
    }>
      <ProblemsPageContent />
    </Suspense>
  )
}

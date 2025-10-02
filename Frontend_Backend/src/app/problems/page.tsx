'use client'

import { useState, useEffect, Suspense, useMemo } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import RevisionModal from '@/components/RevisionModal'
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
}

function ProblemsPageContent() {
  const { user } = useUser()
  const { getToken } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [showRevisionModal, setShowRevisionModal] = useState(false)
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null)
  const [loadingProblem, setLoadingProblem] = useState(false)
  
  // Simple state management instead of SWR
  const [allProblems, setAllProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchProblems = async () => {
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
    } catch (err) {
      console.error('Error fetching problems:', err)
      setError('Failed to fetch problems')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchProblems()
    }
  }, [user])

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
        console.log('Problem deleted successfully, refreshing data...')
        
        // Simple refresh - just refetch the data
        await fetchProblems()
        
        console.log('Data refreshed after deletion')
      } else {
        setErrorMessage(result.error || 'Failed to delete problem')
      }
    } catch (error) {
      console.error('Error deleting problem:', error)
      setErrorMessage('Failed to delete problem. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
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
      <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
      <Navbar />
      
      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Your Problems</h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors">
            {selectedCategory 
              ? `Showing ${filteredProblems.length} ${selectedCategory} problems`
              : `${filteredProblems.length} total problems`
            }
          </p>
        </div>

        {availableCategories.length > 0 && (
          <div className="mb-8 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search problems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full md:w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Filter className="text-gray-500 h-5 w-5" />
              <span className="text-sm font-medium text-gray-700">Categories:</span>
              
              {availableCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryFilter(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
              
              {(selectedCategory || searchTerm) && (
                <button
                  onClick={clearAllFilters}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Clear All
                </button>
              )}
            </div>

            {selectedCategory && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
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
          <div className="text-center py-20">
            <FileCode size={80} className="mx-auto text-gray-300 mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              {selectedCategory 
                ? `No ${selectedCategory} problems found`
                : searchTerm 
                ? 'No problems match your search'
                : 'No problems yet'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {selectedCategory || searchTerm
                ? 'Try adjusting your filters or search terms'
                : 'Start adding problems to track your coding practice'
              }
            </p>
            {!selectedCategory && !searchTerm && (
              <Link 
                href="/add-problem"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Your First Problem
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProblems.map((problem: Problem) => (
              <div key={problem._id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 transition-colors">
                      {problem.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
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
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(problem.Confidence / 2) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 transition-colors">
                    <Calendar className="h-4 w-4" />
                    {new Date(problem.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartRevision(problem)}
                      disabled={loadingProblem}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      <Play className="h-4 w-4" />
                      {loadingProblem ? 'Loading...' : 'Practice'}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteProblem(problem._id)}
                      disabled={deletingId === problem._id}
                      className="flex items-center gap-1 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors text-sm font-medium disabled:opacity-50"
                      title="Delete problem"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingId === problem._id ? 'Deleting...' : ''}
                    </button>
                  </div>
                  
                  <Link 
                    href={`/problems/${problem._id}`}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm flex items-center gap-1 transition-colors"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
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
      </main>
    </div>
  )
}

export default function ProblemsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
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

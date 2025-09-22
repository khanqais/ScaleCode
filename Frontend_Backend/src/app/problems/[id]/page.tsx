'use client'

import { useState, useEffect, Suspense } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import RevisionModal from '@/components/RevisionModal'
import { 
  ArrowLeft, 
  Calendar, 
  Star, 
  Edit, 
  Trash2, 
  Play, 
  Copy, 
  Check, 
  Brain,
  FileText,
  Code2,
  Target,
  Lightbulb,
  AlertTriangle,
  MoreVertical
} from 'lucide-react'

interface Problem {
  _id: string
  title: string
  category: string
  difficulty: number
  problemStatement: string
  myCode: string
  intuition: string
  createdAt: string
  updatedAt: string
}

export default function ProblemDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="animate-spin rounded-full h-24 w-24 sm:h-32 sm:w-32 border-b-2 border-black dark:border-white"></div>
        </div>
      </div>
    }>
      <ProblemDetailPageContent />
    </Suspense>
  )
}

function ProblemDetailPageContent() {
  const { user } = useUser()
  const { getToken } = useAuth()
  const router = useRouter()
  const params = useParams()
  
  const [problem, setProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [copied, setCopied] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  const [showRevisionModal, setShowRevisionModal] = useState(false)

  useEffect(() => {
    if (user && params.id) {
      fetchProblem()
    }
  }, [user, params.id])

  const fetchProblem = async () => {
    try {
      setLoading(true)
      setError('')
      const token = await getToken()
      
      const response = await fetch(`/api/problems/${params.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          setError('Problem not found')
        } else {
          throw new Error(`Failed to fetch problem: ${response.status}`)
        }
        return
      }

      const result = await response.json()
      
      if (result.success) {
        setProblem(result.data)
      } else {
        setError(result.error || 'Failed to fetch problem')
      }
    } catch (err) {
      console.error('Error fetching problem:', err)
      setError('Failed to fetch problem')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = async () => {
    if (!problem?.myCode) return
    
    try {
      await navigator.clipboard.writeText(problem.myCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const handleDelete = async () => {
    if (!problem) return
    
    try {
      setDeleting(true)
      const token = await getToken()
      
      const response = await fetch(`/api/problems/${problem._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        router.push('/problems')
      } else {
        throw new Error('Failed to delete problem')
      }
    } catch (err) {
      console.error('Error deleting problem:', err)
      alert('Failed to delete problem')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleStartRevision = () => {
    setShowRevisionModal(true)
  }

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'text-green-600 bg-green-100'
    if (difficulty <= 6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 3) return 'Easy'
    if (difficulty <= 6) return 'Medium'
    return 'Hard'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh] text-center px-4 py-6">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Please sign in to view this problem
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
              You need to be signed in to access your coding solutions.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="animate-pulse">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="w-48 sm:w-64 h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="w-3/4 h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded mb-3 sm:mb-4"></div>
              <div className="w-1/2 h-4 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 sm:mb-6"></div>
              <div className="space-y-2 sm:space-y-3">
                <div className="w-full h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-5/6 h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-4/5 h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900 dark:text-white" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Problem Not Found</h1>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-xl p-6 sm:p-8 text-center">
            <AlertTriangle className="mx-auto text-red-500 dark:text-red-400 mb-4 w-12 h-12" />
            <h2 className="text-xl sm:text-2xl font-bold text-red-900 dark:text-red-100 mb-2">{error}</h2>
            <p className="text-red-700 dark:text-red-300 mb-4 sm:mb-6 text-sm sm:text-base">
              This problem might have been deleted or you don&apos;t have access to it.
            </p>
            <Link
              href="/problems"
              className="bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              Back to Problems
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!problem) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-start justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0 mt-1"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900 dark:text-white" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 break-words">
                {problem.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm text-blue-600 bg-blue-100 px-2 sm:px-3 py-1 rounded-full font-medium">
                  {problem.category}
                </span>
                <span className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-medium ${getDifficultyColor(problem.difficulty)}`}>
                  {getDifficultyLabel(problem.difficulty)} ({problem.difficulty}/10)
                </span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 sm:h-4 sm:w-4 ${
                        i < Math.floor(problem.difficulty / 2) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 lg:gap-3 flex-shrink-0">
            <button
              onClick={handleStartRevision}
              className="flex items-center gap-2 px-3 lg:px-6 py-2 lg:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-md hover:shadow-lg transform hover:scale-105 text-sm lg:text-base"
            >
              <Play className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="hidden lg:inline">Start Revision</span>
              <span className="lg:hidden">Revise</span>
            </button>
            
            <Link
              href={`/problems/${problem._id}/edit`}
              className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>

          <div className="sm:hidden flex-shrink-0 relative">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            
            {showMobileMenu && (
              <div className="absolute right-0 top-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10 min-w-[160px]">
                <button
                  onClick={() => {
                    handleStartRevision()
                    setShowMobileMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/50 flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start Revision
                </button>
                <Link
                  href={`/problems/${problem._id}/edit`}
                  className="w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 flex items-center gap-2"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Edit className="w-4 h-4" />
                  Edit Problem
                </Link>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(true)
                    setShowMobileMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Problem
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="sm:hidden mb-6">
          <button
            onClick={handleStartRevision}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-md"
          >
            <Play className="w-5 h-5" />
            Start Revision
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <Calendar className="text-gray-400 dark:text-gray-500 flex-shrink-0 w-5 h-5" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Created</p>
                <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base break-words">
                  {formatDate(problem.createdAt)}
                </p>
              </div>
            </div>
            
            {problem.updatedAt !== problem.createdAt && (
              <div className="flex items-center gap-3">
                <Edit className="text-gray-400 dark:text-gray-500 flex-shrink-0 w-5 h-5" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                  <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base break-words">
                    {formatDate(problem.updatedAt)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-100 dark:border-gray-700 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <FileText className="text-blue-500 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Problem Statement</h2>
          </div>
          
          <div className="prose prose-sm sm:prose-lg max-w-none">
            <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed font-sans bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 lg:p-6 rounded-lg border border-gray-200 dark:border-gray-600 text-xs sm:text-sm lg:text-base overflow-x-auto">
              {problem.problemStatement}
            </pre>
          </div>
        </div>

        {problem.intuition && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-100 dark:border-gray-700 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Lightbulb className="text-yellow-500 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Your Intuition & Approach</h2>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-3 sm:p-4 lg:p-6 rounded-r-lg">
              <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed font-sans text-xs sm:text-sm lg:text-base overflow-x-auto">
                {problem.intuition}
              </pre>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-100 dark:border-gray-700 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Code2 className="text-green-500 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Your Solution</h2>
            </div>
            
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs sm:text-sm flex-shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy Code'}</span>
              <span className="sm:hidden">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-gray-400 text-xs sm:text-sm">Solution Code</span>
            </div>
            
            <pre className="p-3 sm:p-4 lg:p-6 text-green-400 font-mono text-xs sm:text-sm overflow-x-auto leading-relaxed">
              <code>{problem.myCode}</code>
            </pre>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Quick Actions</h3>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
            <button
              onClick={handleStartRevision}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors text-sm justify-center sm:justify-start"
            >
              <Brain className="w-4 h-4" />
              Practice This Problem
            </button>
            
            <Link
              href={`/problems?category=${encodeURIComponent(problem.category)}`}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors text-sm justify-center sm:justify-start"
            >
              <Target className="w-4 h-4" />
              More {problem.category} Problems
            </Link>
            
            <Link
              href="/add-problem"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors text-sm justify-center sm:justify-start"
            >
              <FileText className="w-4 h-4" />
              Add New Problem
            </Link>
          </div>
        </div>
      </div>

      {showMobileMenu && (
        <div 
          className="sm:hidden fixed inset-0 z-5" 
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-4 sm:p-6 m-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-red-500 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Delete Problem</h2>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
              Are you sure you want to delete &ldquo;{problem.title}&rdquo;? This action cannot be undone.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete problem
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

     
      {showRevisionModal && (
        <RevisionModal
          isOpen={showRevisionModal}
          onClose={() => setShowRevisionModal(false)}
          problem={problem}
        />
      )}
    </div>
  )
}

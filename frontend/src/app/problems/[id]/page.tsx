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
  AlertTriangle
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
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
  
  // Problem data states
  const [problem, setProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // UI states
  const [copied, setCopied] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  // Revision modal states
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
      
      const response = await fetch(`http://localhost:5000/api/problems/${params.id}`, {
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
      
      const response = await fetch(`http://localhost:5000/api/problems/${problem._id}`, {
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh] text-center p-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Please sign in to view this problem</h2>
            <p className="text-gray-600 text-lg">You need to be signed in to access your coding solutions.</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-5xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="w-64 h-8 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <div className="w-3/4 h-8 bg-gray-200 rounded mb-4"></div>
              <div className="w-1/2 h-6 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-3">
                <div className="w-full h-4 bg-gray-200 rounded"></div>
                <div className="w-5/6 h-4 bg-gray-200 rounded"></div>
                <div className="w-4/5 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-5xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Problem Not Found</h1>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <AlertTriangle className="mx-auto text-red-500 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-red-900 mb-2">{error}</h2>
            <p className="text-red-700 mb-6">This problem might have been deleted or you don&apos;t have access to it.</p>
            <Link
              href="/problems"
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft size={20} />
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{problem.title}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
                  {problem.category}
                </span>
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${getDifficultyColor(problem.difficulty)}`}>
                  {getDifficultyLabel(problem.difficulty)} ({problem.difficulty}/10)
                </span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
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

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleStartRevision}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Play size={20} />
              Start Revision
            </button>
            
            <Link
              href={`/problems/${problem._id}/edit`}
              className="flex items-center gap-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Edit size={20} />
              Edit
            </Link>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <Trash2 size={20} />
              Delete
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Calendar className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium text-gray-900">{formatDate(problem.createdAt)}</p>
              </div>
            </div>
            
            {problem.updatedAt !== problem.createdAt && (
              <div className="flex items-center gap-3">
                <Edit className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium text-gray-900">{formatDate(problem.updatedAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Problem Statement */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="text-blue-500" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Problem Statement</h2>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans bg-gray-50 p-6 rounded-lg border">
              {problem.problemStatement}
            </pre>
          </div>
        </div>

        {/* Intuition */}
        {problem.intuition && (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="text-yellow-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Your Intuition & Approach</h2>
            </div>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
              <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans">
                {problem.intuition}
              </pre>
            </div>
          </div>
        )}

        {/* Solution Code */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Code2 className="text-green-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Your Solution</h2>
            </div>
            
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-gray-400 text-sm">Solution Code</span>
            </div>
            
            <pre className="p-6 text-green-400 font-mono text-sm overflow-x-auto leading-relaxed">
              <code>{problem.myCode}</code>
            </pre>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleStartRevision}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              <Brain size={16} />
              Practice This Problem
            </button>
            
            <Link
              href={`/problems?category=${encodeURIComponent(problem.category)}`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Target size={16} />
              More {problem.category} Problems
            </Link>
            
            <Link
              href="/add-problem"
              className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              <FileText size={16} />
              Add New Problem
            </Link>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-red-500" size={24} />
              <h2 className="text-xl font-bold text-gray-900">Delete Problem</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &ldquo;{problem.title}&rdquo;? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete Problem
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
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

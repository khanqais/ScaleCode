'use client'

import { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Check, X, Eye, EyeOff } from 'lucide-react'

interface Problem {
  id: string
  title: string
  problem_statement: string
  my_code: string
  intuition: string
  difficulty: number
  category: string
}

export default function RevisionPage() {
  const { user } = useUser()
  const { getToken } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [problem, setProblem] = useState<Problem | null>(null)
  const [userCode, setUserCode] = useState('')
  const [showSolution, setShowSolution] = useState(false)
  const [showIntuition, setShowIntuition] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && params.id) {
      // TODO: Replace with MongoDB calls
      setLoading(false)
      console.log('Loading problem for user:', user.id, 'problemId:', params.id)
    }
  }, [user, params.id])

  const handleComplete = async () => {
    try {
      // TODO: Replace with MongoDB API call
      console.log('Saving revision session:', {
        userId: user?.id,
        problemId: params.id,
        attemptCode: userCode,
        completed: true
      })
      
      alert('Session saved successfully! (MongoDB integration needed)')
      router.push('/organize')
    } catch (error) {
      console.error('Error saving session:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Problem not found</h2>
          <button
            onClick={() => router.push('/problems')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Problems
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/problems')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{problem.title}</h1>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                  {problem.category}
                </span>
                <span className="text-sm text-gray-600">
                  Difficulty: {problem.difficulty}/10
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowIntuition(!showIntuition)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              {showIntuition ? <EyeOff size={16} /> : <Eye size={16} />}
              {showIntuition ? 'Hide' : 'Show'} Intuition
            </button>
            
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
            >
              {showSolution ? <EyeOff size={16} /> : <Eye size={16} />}
              {showSolution ? 'Hide' : 'Show'} Solution
            </button>
            
            <button
              onClick={handleComplete}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Check size={16} />
              Complete
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Problem Statement */}
          <div className="flex flex-col">
            <div className="bg-white rounded-xl border border-gray-200 flex-1 flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Problem Statement</h2>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                    {problem.problem_statement}
                  </pre>
                </div>
              </div>

              {showIntuition && (
                <div className="p-6 bg-yellow-50 border-b border-yellow-200">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3">💡 Your Intuition</h3>
                  <p className="text-sm text-yellow-700 whitespace-pre-wrap">
                    {problem.intuition}
                  </p>
                </div>
              )}

              {showSolution && (
                <div className="p-6 bg-green-50">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">✅ Your Solution</h3>
                  <pre className="text-sm text-green-700 bg-white p-4 rounded-lg border font-mono overflow-auto">
                    {problem.my_code}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex flex-col">
            <div className="bg-white rounded-xl border border-gray-200 flex-1 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Write Your Solution</h2>
              </div>
              
              <div className="flex-1 p-0">
                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  className="w-full h-full p-6 border-0 resize-none font-mono text-sm focus:outline-none focus:ring-0"
                  placeholder="// Write your solution here..."
                  style={{ minHeight: '400px' }}
                />
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Lines: {userCode.split('\n').length}</span>
                  <span>Characters: {userCode.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

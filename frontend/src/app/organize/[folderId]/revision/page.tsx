'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Brain,
  Target,
  Trophy,
  RefreshCw
} from 'lucide-react'

interface Problem {
  id: string
  title: string
  problem_statement: string
  code: string
  intuition: string
  difficulty: number
  tags: string[]
  time_complexity: string
  space_complexity: string
}

interface RevisionAttempt {
  id: string
  submitted_code: string
  score: number
  time_taken: number
  completed: boolean
  created_at: string
}

export default function RevisionPage() {
  const { user } = useUser()
  const params = useParams()
  const router = useRouter()
  const folderId = params.folderId as string

  const [problems, setProblems] = useState<Problem[]>([])
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(true)
  const [revisionMode, setRevisionMode] = useState<'select' | 'solve' | 'result'>('select')
  const [submittedCode, setSubmittedCode] = useState('')
  const [timeStarted, setTimeStarted] = useState<number | null>(null)
  const [result, setResult] = useState<{ score: number; feedback: string } | null>(null)
  const [attempts, setAttempts] = useState<RevisionAttempt[]>([])

  useEffect(() => {
    if (user && folderId) {
      fetchProblems()
      fetchAttempts()
    }
  }, [user, folderId])

  const fetchProblems = async () => {
    setLoading(true)
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', user!.id)
        .single()

      if (!userData) return

      const { data: problemsData } = await supabase
        .from('problems')
        .select('*')
        .eq('folder_id', folderId)
        .eq('user_id', userData.id)
        .order('difficulty', { ascending: false })

      if (problemsData) {
        setProblems(problemsData)
      }
    } catch (error) {
      console.error('Error fetching problems:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAttempts = async () => {
    if (!user) return

    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single()

    if (!userData) return

    const { data: attemptsData } = await supabase
      .from('revision_attempts')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (attemptsData) {
      setAttempts(attemptsData)
    }
  }

  const startRevision = (problem: Problem) => {
    setCurrentProblem(problem)
    setSubmittedCode('')
    setTimeStarted(Date.now())
    setRevisionMode('solve')
    setResult(null)
  }

  const getRandomDifficultProblem = () => {
    const difficultProblems = problems.filter(p => p.difficulty >= 7)
    if (difficultProblems.length === 0) {
      const allProblems = problems
      return allProblems[Math.floor(Math.random() * allProblems.length)]
    }
    return difficultProblems[Math.floor(Math.random() * difficultProblems.length)]
  }

  const startRandomRevision = () => {
    const problem = getRandomDifficultProblem()
    if (problem) {
      startRevision(problem)
    }
  }

  const submitCode = async () => {
    if (!currentProblem || !user || !timeStarted) return

    const timeSpent = Math.floor((Date.now() - timeStarted) / 1000)
    const similarity = calculateSimilarity(submittedCode, currentProblem.code)
    
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single()

    if (!userData) return

    const { error } = await supabase.from('revision_attempts').insert([{
      user_id: userData.id,
      problem_id: currentProblem.id,
      submitted_code: submittedCode,
      score: similarity,
      time_taken: timeSpent,
      completed: true,
    }])

    if (!error) {
      setResult({
        score: similarity,
        feedback: generateFeedback(similarity, timeSpent)
      })
      setRevisionMode('result')
      fetchAttempts()
    }
  }

  const calculateSimilarity = (code1: string, code2: string): number => {
    // Simple similarity calculation (you can make this more sophisticated)
    const normalize = (str: string) => 
      str.toLowerCase().replace(/\s+/g, ' ').replace(/[^\w\s]/g, '').trim()
    
    const norm1 = normalize(code1)
    const norm2 = normalize(code2)
    
    if (norm1 === norm2) return 100
    
    const words1 = norm1.split(' ')
    const words2 = norm2.split(' ')
    
    const commonWords = words1.filter(word => words2.includes(word))
    const totalWords = Math.max(words1.length, words2.length)
    
    return Math.floor((commonWords.length / totalWords) * 100)
  }

  const generateFeedback = (score: number, timeSpent: number): string => {
    let feedback = []
    
    if (score >= 90) {
      feedback.push("🎉 Excellent! Your solution is nearly identical to the original.")
    } else if (score >= 70) {
      feedback.push("✅ Good job! Your solution captures the main logic.")
    } else if (score >= 50) {
      feedback.push("📚 Decent attempt. Review the original solution for improvements.")
    } else {
      feedback.push("🔄 Keep practicing! Your approach needs some refinement.")
    }
    
    if (timeSpent < 300) { // 5 minutes
      feedback.push("⚡ Great speed!")
    } else if (timeSpent < 600) { // 10 minutes
      feedback.push("⏱️ Good timing.")
    } else {
      feedback.push("🐌 Take time to understand the pattern better for faster recall.")
    }
    
    return feedback.join(' ')
  }

  const resetRevision = () => {
    setRevisionMode('select')
    setCurrentProblem(null)
    setSubmittedCode('')
    setTimeStarted(null)
    setResult(null)
  }

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'text-green-600 bg-green-100'
    if (difficulty <= 6) return 'text-yellow-600 bg-yellow-100'
    if (difficulty <= 8) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (problems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center p-6">
        <div>
          <Brain size={80} className="mx-auto text-gray-300 mb-6" />
          <h2 className="text-2xl font-bold mb-4">No Problems to Revise</h2>
          <p className="text-gray-600 mb-8">Add some problems to this folder first!</p>
          <button
            onClick={() => router.push(`/organize/${folderId}`)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Folder
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/organize/${folderId}`)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Revision Mode</h1>
              <p className="text-gray-600">Test your knowledge and improve your recall</p>
            </div>
          </div>
          
          {revisionMode === 'solve' && timeStarted && (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={20} />
              <span>{Math.floor((Date.now() - timeStarted) / 1000)}s</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {revisionMode === 'select' && (
          <div>
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="text-blue-500" size={24} />
                  <span className="text-sm font-medium text-gray-600">Total Problems</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{problems.length}</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="text-yellow-500" size={24} />
                  <span className="text-sm font-medium text-gray-600">Recent Attempts</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{attempts.length}</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <Brain className="text-purple-500" size={24} />
                  <span className="text-sm font-medium text-gray-600">Average Score</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {attempts.length > 0 
                    ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
                    : 0
                  }%
                </p>
              </div>
            </div>

            {/* Quick Start */}
            <div className="text-center mb-8">
              <button
                onClick={startRandomRevision}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg flex items-center gap-3 mx-auto"
              >
                <Play size={24} />
                Start Random Difficult Problem
              </button>
              <p className="text-gray-600 mt-2">Get a challenging problem to test your skills</p>
            </div>

            {/* Problem List */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6">Choose a Problem to Revise</h2>
              <div className="space-y-4">
                {problems.map((problem) => (
                  <div
                    key={problem.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{problem.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                          {problem.difficulty}/10
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{problem.problem_statement.substring(0, 100)}...</p>
                      {problem.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {problem.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => startRevision(problem)}
                      className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Play size={16} />
                      Revise
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Attempts */}
            {attempts.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6">
                <h2 className="text-xl font-bold mb-6">Recent Attempts</h2>
                <div className="space-y-3">
                  {attempts.slice(0, 5).map((attempt) => (
                    <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {attempt.score >= 70 ? (
                          <CheckCircle className="text-green-500" size={20} />
                        ) : (
                          <XCircle className="text-red-500" size={20} />
                        )}
                        <span className="text-gray-700">Problem attempted</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Score: {attempt.score}%</span>
                        <span>Time: {Math.floor(attempt.time_taken / 60)}m {attempt.time_taken % 60}s</span>
                        <span>{new Date(attempt.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {revisionMode === 'solve' && currentProblem && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Problem Statement */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{currentProblem.title}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentProblem.difficulty)}`}>
                  {currentProblem.difficulty}/10
                </span>
              </div>
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-3">Problem Statement</h3>
                <div className="p-4 bg-gray-50 rounded-lg mb-4">
                  <p className="whitespace-pre-wrap">{currentProblem.problem_statement}</p>
                </div>
                
                {currentProblem.tags.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentProblem.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-600 text-sm rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  <p><strong>Time Complexity:</strong> {currentProblem.time_complexity || 'Not specified'}</p>
                  <p><strong>Space Complexity:</strong> {currentProblem.space_complexity || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Code Editor */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4">Write Your Solution</h2>
              <textarea
                className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Write your solution here..."
                value={submittedCode}
                onChange={(e) => setSubmittedCode(e.target.value)}
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={resetRevision}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitCode}
                  disabled={!submittedCode.trim()}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit & Compare
                </button>
              </div>
            </div>
          </div>
        )}

        {revisionMode === 'result' && result && currentProblem && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Result Header */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                result.score >= 70 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {result.score >= 70 ? (
                  <CheckCircle className="text-green-600" size={40} />
                ) : (
                  <XCircle className="text-red-600" size={40} />
                )}
              </div>
              <h2 className="text-3xl font-bold mb-2">Score: {result.score}%</h2>
              <p className="text-gray-600 mb-4">{result.feedback}</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={resetRevision}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={20} />
                  Try Another
                </button>
                <button
                  onClick={() => router.push(`/organize/${folderId}`)}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Back to Folder
                </button>
              </div>
            </div>

            {/* Code Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Your Solution</h3>
                <div className="p-4 bg-gray-900 text-gray-100 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{submittedCode}</pre>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Original Solution</h3>
                <div className="p-4 bg-gray-900 text-gray-100 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{currentProblem.code}</pre>
                </div>
              </div>
            </div>

            {/* Intuition */}
            {currentProblem.intuition && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Original Intuition & Approach</h3>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="whitespace-pre-wrap">{currentProblem.intuition}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Check, Eye, EyeOff } from 'lucide-react'
import axios from 'axios'


const sliderStyles = `
  .slider-thumb::-webkit-slider-thumb {
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #3B82F6;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    border: 3px solid white;
  }

  .slider-thumb::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #3B82F6;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    border: 3px solid white;
  }

  .slider-thumb::-webkit-slider-thumb:hover {
    background: #2563EB;
    transform: scale(1.1);
  }

  .slider-thumb::-moz-range-thumb:hover {
    background: #2563EB;
    transform: scale(1.1);
  }
`;

interface Problem {
  _id: string
  title: string
  problemStatement: string
  myCode: string
  intuition: string
  Confidence: number
  category: string
  lastRevised?: Date
  revisionCount?: number
  createdAt: Date
}

export default function RevisionPage() {
  const router = useRouter()
  const params = useParams()
  const problemId = params?.id as string

  const [problem, setProblem] = useState<Problem | null>(null)
  const [userCode, setUserCode] = useState('')
  const [newConfidence, setNewConfidence] = useState<number>(5)
  const [showSolution, setShowSolution] = useState(false)
  const [showIntuition, setShowIntuition] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (problemId) {
      fetchProblem()
    }
  }, [problemId])



  const fetchProblem = async () => {
    try {
      const response = await axios.get(`/api/problems/${problemId}`)
      if (response.data.success) {
        setProblem(response.data.data)
        setNewConfidence(response.data.data.Confidence)
      }
    } catch (error) {
      console.error('Error fetching problem:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!problemId) return

    setUpdating(true)
    try {
      const response = await axios.patch('/api/problems/revision', {
        problemId,
        confidence: newConfidence
      })

      if (response.data.success) {
        alert('✅ Revision completed! Confidence updated.')
        router.push('/main-revision')
      }
    } catch (error) {
      console.error('Error saving session:', error)
      alert('Failed to save revision')
    } finally {
      setUpdating(false)
    }
  }

  const getConfidenceLabel = (conf: number) => {
    if (conf <= 3) return 'Need to relearn'
    if (conf <= 5) return 'Shaky understanding'
    if (conf <= 7) return 'Decent grasp'
    if (conf <= 9) return 'Strong understanding'
    return 'Complete mastery'
  }

  const getConfidenceColor = (conf: number) => {
    if (conf <= 3) return 'bg-red-500'
    if (conf <= 5) return 'bg-orange-500'
    if (conf <= 7) return 'bg-yellow-500'
    if (conf <= 9) return 'bg-blue-500'
    return 'bg-green-500'
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
    <>
      <style dangerouslySetInnerHTML={{ __html: sliderStyles }} />
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
                  Current Confidence: {problem.Confidence}/10
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          <div className="flex flex-col">
            <div className="bg-white rounded-xl border border-gray-200 flex flex-col" style={{ minHeight: '500px', maxHeight: '70vh' }}>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Problem Statement</h2>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                    {problem.problemStatement}
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
                    {problem.myCode}
                  </pre>
                </div>
              )}
            </div>
          </div>

         
          <div className="flex flex-col">
            <div className="bg-white rounded-xl border border-gray-200 flex flex-col" style={{ minHeight: '500px', maxHeight: '70vh' }}>
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Write Your Solution</h2>
              </div>
              
              <div className="flex-1 overflow-auto">
                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  className="w-full h-full p-6 border-0 resize-none font-mono text-sm focus:outline-none focus:ring-0"
                  placeholder="// Write your solution here..."
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

        
        <div className="mt-6 p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">Rate Your Understanding</h2>
          
          
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Current Confidence</div>
              <div className="text-5xl font-bold text-gray-700 dark:text-gray-300">{problem.Confidence}/10</div>
              {problem.revisionCount !== undefined && problem.revisionCount > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Revised {problem.revisionCount} times
                </div>
              )}
            </div>

            <div className="text-4xl text-gray-400">→</div>

            <div className="text-center">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">New Confidence</div>
              <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">{newConfidence}/10</div>
            </div>
          </div>

          
          <div className="mb-6">
            <div className="relative">
              <input
                type="range"
                min="1"
                max="10"
                value={newConfidence}
                onChange={(e) => setNewConfidence(parseInt(e.target.value))}
                className="w-full h-4 rounded-full appearance-none cursor-pointer slider-thumb"
                style={{
                  background: `linear-gradient(to right, 
                    #ef4444 0%, 
                    #f97316 20%, 
                    #f59e0b 35%, 
                    #eab308 50%, 
                    #84cc16 65%, 
                    #22c55e 80%, 
                    #10b981 100%)`
                }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-3 px-1">
              <span className="font-medium">Need to relearn</span>
              <span className="font-medium">Complete mastery</span>
            </div>
          </div>

          
          <div className="mb-6 p-5 rounded-xl bg-gray-800 dark:bg-gray-900 text-white shadow-md">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${getConfidenceColor(newConfidence)}`}></div>
              <div className="flex-1">
                <div className="font-bold text-lg mb-1">{getConfidenceLabel(newConfidence)}</div>
                <div className="text-sm text-gray-300">
                  {newConfidence <= 3 ? 'This problem will appear again soon in your revision queue' :
                   newConfidence <= 5 ? 'This problem will be scheduled for review in 1 week' :
                   newConfidence <= 7 ? 'This problem will be scheduled for review in 2 weeks' :
                   'This problem is well understood and will be reviewed less frequently'}
                </div>
              </div>
            </div>
          </div>

          
          <button
            onClick={handleComplete}
            disabled={updating}
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Check size={24} />
            {updating ? 'Saving...' : 'Complete Revision & Update Confidence'}
          </button>
        </div>

        
        
      </div>
      </div>
    </>
  )
}

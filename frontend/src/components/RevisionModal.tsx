'use client'

import { useState, useEffect } from 'react'
import { X, Play, Eye, EyeOff, Copy, Check, RotateCcw, Clock, Brain } from 'lucide-react'

interface RevisionModalProps {
  isOpen: boolean
  onClose: () => void
  problem: {
    _id: string
    title: string
    category: string
    difficulty: number
    problemStatement: string
    myCode: string
    intuition?: string
  }
}

export default function RevisionModal({ isOpen, onClose, problem }: RevisionModalProps) {
  const [userCode, setUserCode] = useState('')
  const [showComparison, setShowComparison] = useState(false)
  const [showIntuition, setShowIntuition] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [copied, setCopied] = useState<'user' | 'solution' | null>(null)

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isTimerRunning && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000))
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning, startTime])

  // Start timer when modal opens
  useEffect(() => {
    if (isOpen && !startTime) {
      const time = new Date()
      setStartTime(time)
      setIsTimerRunning(true)
    }
  }, [isOpen, startTime])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setUserCode('')
      setShowComparison(false)
      setShowIntuition(false)
      setStartTime(null)
      setElapsedTime(0)
      setIsTimerRunning(false)
      setCopied(null)
    }
  }, [isOpen])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
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

  const handleSubmit = () => {
    setIsTimerRunning(false)
    setShowComparison(true)
  }

  const handleReset = () => {
    setUserCode('')
    setShowComparison(false)
    setShowIntuition(false)
    const time = new Date()
    setStartTime(time)
    setElapsedTime(0)
    setIsTimerRunning(true)
  }

  const handleCopy = async (code: string, type: 'user' | 'solution') => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">{problem.title}</h2>
            <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
              {problem.category}
            </span>
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${getDifficultyColor(problem.difficulty)}`}>
              {getDifficultyLabel(problem.difficulty)}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
              <Clock className="text-gray-500" size={16} />
              <span className={`font-mono text-sm ${isTimerRunning ? 'text-blue-600' : 'text-gray-600'}`}>
                {formatTime(elapsedTime)}
              </span>
            </div>
            
            {/* Action Buttons */}
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              <RotateCcw size={16} />
              Reset
            </button>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Problem Statement */}
          <div className="w-1/2 border-r border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Problem Statement</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans">
                  {problem.problemStatement}
                </pre>
              </div>
              
              {/* Intuition Section */}
              {problem.intuition && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowIntuition(!showIntuition)}
                    className="flex items-center gap-2 mb-4 text-purple-600 hover:text-purple-700 font-medium"
                  >
                    <Brain size={16} />
                    {showIntuition ? 'Hide' : 'Show'} Intuition
                    {showIntuition ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  
                  {showIntuition && (
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <pre className="whitespace-pre-wrap text-purple-800 text-sm leading-relaxed font-sans">
                        {problem.intuition}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Code Editor */}
          <div className="w-1/2 flex flex-col">
            {!showComparison ? (
              /* Coding Phase */
              <>
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Write Your Solution</h3>
                  <p className="text-sm text-gray-600">Code your solution below and click submit when ready</p>
                </div>
                
                <div className="flex-1 flex flex-col">
                  <textarea
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    className="flex-1 p-6 font-mono text-sm border-0 resize-none focus:outline-none focus:ring-0 bg-gray-900 text-green-400"
                    placeholder="// Write your solution here...
function solution() {
    // Your code goes here
    
    return result;
}"
                    style={{ minHeight: '400px' }}
                  />
                  
                  <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Lines: {userCode.split('\n').length} | Characters: {userCode.length}
                    </div>
                    
                    <button
                      onClick={handleSubmit}
                      disabled={!userCode.trim()}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      <Play size={16} />
                      Submit Solution
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Comparison Phase */
              <>
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Solution Comparison</h3>
                  <p className="text-sm text-gray-600">Compare your solution with your original solution</p>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {/* Your Attempt */}
                  <div className="border-b border-gray-200">
                    <div className="flex items-center justify-between p-4 bg-blue-50">
                      <h4 className="font-semibold text-blue-900">Your Current Attempt</h4>
                      <button
                        onClick={() => handleCopy(userCode, 'user')}
                        className="flex items-center gap-1 px-3 py-1 text-blue-700 hover:bg-blue-200 rounded transition-colors text-sm"
                      >
                        {copied === 'user' ? <Check size={14} /> : <Copy size={14} />}
                        {copied === 'user' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="bg-gray-900 overflow-x-auto">
                      <pre className="p-4 text-green-400 font-mono text-sm">
                        <code>{userCode || '// No code written'}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Original Solution */}
                  <div>
                    <div className="flex items-center justify-between p-4 bg-green-50">
                      <h4 className="font-semibold text-green-900">Your Original Solution</h4>
                      <button
                        onClick={() => handleCopy(problem.myCode, 'solution')}
                        className="flex items-center gap-1 px-3 py-1 text-green-700 hover:bg-green-200 rounded transition-colors text-sm"
                      >
                        {copied === 'solution' ? <Check size={14} /> : <Copy size={14} />}
                        {copied === 'solution' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="bg-gray-900 overflow-x-auto">
                      <pre className="p-4 text-green-400 font-mono text-sm">
                        <code>{problem.myCode}</code>
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Comparison Actions */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Time taken: <span className="font-mono font-medium">{formatTime(elapsedTime)}</span>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <RotateCcw size={16} />
                      Try Again
                    </button>
                    
                    <button
                      onClick={onClose}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

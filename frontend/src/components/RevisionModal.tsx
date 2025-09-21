'use client'

import { useState, useEffect } from 'react'
import { X, Play, Eye, EyeOff, Copy, Check, RotateCcw, Clock, Brain, ChevronDown, ChevronUp } from 'lucide-react'

interface RevisionModalProps {
  isOpen: boolean
  onClose: () => void
  problem: {
    _id: string
    title: string
    category: string
    difficulty: number
    problemStatement?: string
    myCode?: string
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
  const [isMobile, setIsMobile] = useState(false)
  const [mobileView, setMobileView] = useState<'problem' | 'code'>('problem')

  // Check if mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
      setMobileView('problem')
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
    if (isMobile) {
      setMobileView('code') // Switch to code view to show comparison
    }
  }

  const handleReset = () => {
    setUserCode('')
    setShowComparison(false)
    setShowIntuition(false)
    const time = new Date()
    setStartTime(time)
    setElapsedTime(0)
    setIsTimerRunning(true)
    if (isMobile) {
      setMobileView('code') // Switch back to code view
    }
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl w-full max-w-7xl h-[95vh] sm:h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gray-50 gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{problem.title}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm text-blue-600 bg-blue-100 px-2 sm:px-3 py-1 rounded-full font-medium">
                {problem.category}
              </span>
              <span className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-medium ${getDifficultyColor(problem.difficulty)}`}>
                {getDifficultyLabel(problem.difficulty)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
            {/* Timer */}
            <div className="flex items-center gap-2 bg-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-200">
              <Clock className="text-gray-500 w-3 h-3 sm:w-4 sm:h-4" />
              <span className={`font-mono text-xs sm:text-sm ${isTimerRunning ? 'text-blue-600' : 'text-gray-600'}`}>
                {formatTime(elapsedTime)}
              </span>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-xs sm:text-sm"
              >
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Reset</span>
              </button>
              
              <button
                onClick={onClose}
                className="p-1 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        {isMobile && (
          <div className="flex bg-gray-100 p-1 mx-4 mt-4 rounded-lg">
            <button
              onClick={() => setMobileView('problem')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mobileView === 'problem'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Problem
            </button>
            <button
              onClick={() => setMobileView('code')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mobileView === 'code'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Code
            </button>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Layout */}
          {!isMobile ? (
            <>
              {/* Left Panel - Problem Statement */}
              <div className="w-1/2 border-r border-gray-200 flex flex-col">
                <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Problem Statement</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans text-sm">
                      {problem.problemStatement || 'No problem statement available'}
                    </pre>
                  </div>
                  
                  {/* Intuition Section */}
                  {problem.intuition && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => setShowIntuition(!showIntuition)}
                        className="flex items-center gap-2 mb-4 text-purple-600 hover:text-purple-700 font-medium text-sm"
                      >
                        <Brain className="w-4 h-4" />
                        {showIntuition ? 'Hide' : 'Show'} Intuition
                        {showIntuition ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                  <CodingPhase 
                    userCode={userCode}
                    setUserCode={setUserCode}
                    handleSubmit={handleSubmit}
                  />
                ) : (
                  <ComparisonPhase 
                    userCode={userCode}
                    problem={problem}
                    copied={copied}
                    handleCopy={handleCopy}
                    elapsedTime={elapsedTime}
                    formatTime={formatTime}
                    handleReset={handleReset}
                    onClose={onClose}
                  />
                )}
              </div>
            </>
          ) : (
            /* Mobile Layout */
            <div className="flex-1 flex flex-col">
              {mobileView === 'problem' ? (
                <MobileProblemView 
                  problem={problem}
                  showIntuition={showIntuition}
                  setShowIntuition={setShowIntuition}
                />
              ) : (
                <div className="flex-1 flex flex-col">
                  {!showComparison ? (
                    <CodingPhase 
                      userCode={userCode}
                      setUserCode={setUserCode}
                      handleSubmit={handleSubmit}
                      isMobile={true}
                    />
                  ) : (
                    <ComparisonPhase 
                      userCode={userCode}
                      problem={problem}
                      copied={copied}
                      handleCopy={handleCopy}
                      elapsedTime={elapsedTime}
                      formatTime={formatTime}
                      handleReset={handleReset}
                      onClose={onClose}
                      isMobile={true}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Coding Phase Component
function CodingPhase({ 
  userCode, 
  setUserCode, 
  handleSubmit, 
  isMobile = false 
}: {
  userCode: string
  setUserCode: (code: string) => void
  handleSubmit: () => void
  isMobile?: boolean
}) {
  return (
    <>
      <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Write Your Solution</h3>
        <p className="text-xs sm:text-sm text-gray-600">Code your solution below and click submit when ready</p>
      </div>
      
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 relative">
          <textarea
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            className="absolute inset-0 w-full h-full p-3 sm:p-6 font-mono text-xs sm:text-sm border-0 resize-none focus:outline-none focus:ring-0 bg-gray-900 text-green-400"
            placeholder="// Write your solution here...
function solution() {
    // Your code goes here
    
    return result;
}"
          />
        </div>
        
        {/* Fixed Submit Button Bar */}
        <div className="bg-gray-50 border-t border-gray-200 p-3 sm:p-4 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs sm:text-sm text-gray-600">
            <span className="hidden sm:inline">Lines: {userCode.split('\n').length} | </span>
            Characters: {userCode.length}
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={!userCode.trim()}
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base whitespace-nowrap"
          >
            <Play className="w-4 h-4" />
            Submit Solution
          </button>
        </div>
      </div>
    </>
  )
}

// Comparison Phase Component
function ComparisonPhase({ 
  userCode, 
  problem, 
  copied, 
  handleCopy, 
  elapsedTime, 
  formatTime, 
  handleReset, 
  onClose,
  isMobile = false
}: {
  userCode: string
  problem: any
  copied: 'user' | 'solution' | null
  handleCopy: (code: string, type: 'user' | 'solution') => void
  elapsedTime: number
  formatTime: (seconds: number) => string
  handleReset: () => void
  onClose: () => void
  isMobile?: boolean
}) {
  return (
    <>
      <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Solution Comparison</h3>
        <p className="text-xs sm:text-sm text-gray-600">Compare your solution with your original solution</p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50">
            <h4 className="font-semibold text-blue-900 text-sm sm:text-base">Your Current Attempt</h4>
            <button
              onClick={() => handleCopy(userCode, 'user')}
              className="flex items-center gap-1 px-2 sm:px-3 py-1 text-blue-700 hover:bg-blue-200 rounded transition-colors text-xs sm:text-sm"
            >
              {copied === 'user' ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4" />}
              {copied === 'user' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="bg-gray-900 overflow-x-auto">
            <pre className="p-3 sm:p-4 text-green-400 font-mono text-xs sm:text-sm">
              <code>{userCode || '// No code written'}</code>
            </pre>
          </div>
        </div>

        
        <div>
          <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50">
            <h4 className="font-semibold text-green-900 text-sm sm:text-base">Your Original Solution</h4>
            <button
              onClick={() => handleCopy(problem.myCode || '', 'solution')}
              className="flex items-center gap-1 px-2 sm:px-3 py-1 text-green-700 hover:bg-green-200 rounded transition-colors text-xs sm:text-sm"
            >
              {copied === 'solution' ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4" />}
              {copied === 'solution' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="bg-gray-900 overflow-x-auto">
            <pre className="p-3 sm:p-4 text-green-400 font-mono text-xs sm:text-sm">
              <code>{problem.myCode || 'No solution available'}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Comparison Actions */}
      <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-xs sm:text-sm text-gray-600">
          Time taken: <span className="font-mono font-medium">{formatTime(elapsedTime)}</span>
        </div>
        
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors text-xs sm:text-sm flex-1 sm:flex-none justify-center"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
          
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-xs sm:text-sm flex-1 sm:flex-none"
          >
            Complete
          </button>
        </div>
      </div>
    </>
  )
}


function MobileProblemView({ 
  problem, 
  showIntuition, 
  setShowIntuition 
}: {
  problem: any
  showIntuition: boolean
  setShowIntuition: (show: boolean) => void
}) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Problem Statement</h3>
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans text-sm bg-gray-50 p-4 rounded-lg border">
            {problem.problemStatement || 'No problem statement available'}
          </pre>
        </div>
      </div>
      
      {/* Intuition Section */}
      {problem.intuition && (
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowIntuition(!showIntuition)}
            className="flex items-center gap-2 mb-4 text-purple-600 hover:text-purple-700 font-medium text-sm"
          >
            <Brain className="w-4 h-4" />
            {showIntuition ? 'Hide' : 'Show'} Intuition
            {showIntuition ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
  )
}

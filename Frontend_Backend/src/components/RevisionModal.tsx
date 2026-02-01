'use client'

import { useState, useEffect } from 'react'

interface Solution {
  code: string
  intuition: string
  language: string
  timeComplexity?: string
  spaceComplexity?: string
  approach?: string
  createdAt?: string
}

interface Problem {
  _id: string
  userId?: string
  title: string
  problemStatement?: string
  myCode?: string
  intuition?: string
  solutions?: Solution[]
  Confidence: number
  category: string
  isPublic?: boolean
  createdAt?: string
  updatedAt?: string
}
import { X, Play, Eye, EyeOff, Copy, Check, RotateCcw, Clock, Brain, ChevronDown, ChevronUp } from 'lucide-react'

interface RevisionModalProps {
  isOpen: boolean
  onClose: () => void
  problem: {
    _id: string
    title: string
    category: string
    Confidence: number
    problemStatement?: string
    myCode?: string
    intuition?: string
    solutions?: Solution[]
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
  const [selectedSolutionIndex, setSelectedSolutionIndex] = useState(0)
  
  const activeSolution = problem.solutions && problem.solutions.length > 0 
    ? problem.solutions[selectedSolutionIndex] 
    : { code: problem.myCode || '', intuition: problem.intuition || '', language: 'cpp' }

  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  
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

 
  useEffect(() => {
    if (isOpen && !startTime) {
      const time = new Date()
      setStartTime(time)
      setIsTimerRunning(true)
    }
  }, [isOpen, startTime])

  
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

  const getConfidenceColor = (confidence: number) => {
    if (confidence <= 3) return 'text-red-600 bg-red-100'
    if (confidence <= 6) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence <= 3) return 'Low Confidence'
    if (confidence <= 6) return 'Medium Confidence'
    return 'High Confidence'
  }

  const handleSubmit = () => {
    setIsTimerRunning(false)
    setShowComparison(true)
    if (isMobile) {
      setMobileView('code')
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
      setMobileView('code') 
    }
  }

  const handleCopy = async (code: string, type: 'user' | 'solution') => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch {
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="revision-modal-title"
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-7xl h-[95vh] sm:h-[90vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0">
            <h2 id="revision-modal-title" className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{problem.title}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm text-blue-600 bg-blue-100 px-2 sm:px-3 py-1 rounded-full font-medium">
                {problem.category}
              </span>
              <span className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-medium ${getConfidenceColor(problem.Confidence)}`}>
                {getConfidenceLabel(problem.Confidence)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
            
            <div className="flex items-center gap-2 bg-white dark:bg-gray-700 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-200 dark:border-gray-600">
              <Clock className="text-gray-500 dark:text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
              <span className={`font-mono text-xs sm:text-sm ${isTimerRunning ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}>
                {formatTime(elapsedTime)}
              </span>
            </div>
            
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-800/50 transition-colors text-xs sm:text-sm focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
                aria-label="Reset revision attempt"
              >
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Reset</span>
              </button>
              
              <button
                onClick={onClose}
                className="p-1 sm:p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                aria-label="Close revision modal"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900 dark:text-white" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        
        {isMobile && (
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 mx-4 mt-4 rounded-lg" role="tablist" aria-label="View switcher">
            <button
              onClick={() => setMobileView('problem')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                mobileView === 'problem'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              role="tab"
              aria-selected={mobileView === 'problem'}
              aria-controls="problem-panel"
            >
              Problem
            </button>
            <button
              onClick={() => setMobileView('code')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                mobileView === 'code'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              role="tab"
              aria-selected={mobileView === 'code'}
              aria-controls="code-panel"
            >
              Code
            </button>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
         
          {!isMobile ? (
            <>
              
              <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">Problem Statement</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed font-sans text-sm">
                      {problem.problemStatement || 'No problem statement available'}
                    </pre>
                  </div>
                  
                  
                  {problem.intuition && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => setShowIntuition(!showIntuition)}
                        className="flex items-center gap-2 mb-4 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium text-sm"
                      >
                        <Brain className="w-4 h-4" />
                        {showIntuition ? 'Hide' : 'Show'} Intuition
                        {showIntuition ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      
                      {showIntuition && (
                        <div className="bg-purple-50 dark:bg-purple-900/30 border-l-4 border-purple-400 p-4 rounded-r-lg">
                          <pre className="whitespace-pre-wrap text-purple-800 dark:text-purple-300 text-sm leading-relaxed font-sans">
                            {problem.intuition}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

             
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
                    activeSolution={activeSolution}
                    selectedSolutionIndex={selectedSolutionIndex}
                    setSelectedSolutionIndex={setSelectedSolutionIndex}
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
                    />
                  ) : (
                    <ComparisonPhase 
                      userCode={userCode}
                      problem={problem}
                      activeSolution={activeSolution}
                      selectedSolutionIndex={selectedSolutionIndex}
                      setSelectedSolutionIndex={setSelectedSolutionIndex}
                      copied={copied}
                      handleCopy={handleCopy}
                      elapsedTime={elapsedTime}
                      formatTime={formatTime}
                      handleReset={handleReset}
                      onClose={onClose}
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

function CodingPhase({ 
  userCode, 
  setUserCode, 
  handleSubmit
}: {
  userCode: string
  setUserCode: (code: string) => void
  handleSubmit: () => void
}) {
  return (
    <>
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">Write Your Solution</h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Code your solution below and click submit when ready</p>
      </div>
      
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 relative">
          <textarea
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            className="absolute inset-0 w-full h-full p-3 sm:p-6 font-mono text-xs sm:text-sm border-0 resize-none focus:outline-none focus:ring-0 bg-gray-900 text-green-400"
            placeholder=""
          />
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
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

function ComparisonPhase({ 
  userCode, 
  problem,
  activeSolution,
  selectedSolutionIndex,
  setSelectedSolutionIndex,
  copied, 
  handleCopy, 
  elapsedTime, 
  formatTime, 
  handleReset, 
  onClose
}: {
  userCode: string
  problem: Problem
  activeSolution: { code: string; intuition: string; language: string; timeComplexity?: string; spaceComplexity?: string }
  selectedSolutionIndex: number
  setSelectedSolutionIndex: (index: number) => void
  copied: 'user' | 'solution' | null
  handleCopy: (code: string, type: 'user' | 'solution') => void
  elapsedTime: number
  formatTime: (seconds: number) => string
  handleReset: () => void
  onClose: () => void
}) {
  const hasSolutions = problem.solutions && problem.solutions.length > 0
  
  return (
    <>
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">Solution Comparison</h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Compare your solution with your original solution</p>
        
        {hasSolutions && problem.solutions && problem.solutions.length > 1 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {problem.solutions.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedSolutionIndex(index)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedSolutionIndex === index
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Solution {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/30">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm sm:text-base">Your Current Attempt</h4>
            <button
              onClick={() => handleCopy(userCode, 'user')}
              className="flex items-center gap-1 px-2 sm:px-3 py-1 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded transition-colors text-xs sm:text-sm"
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
          <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 dark:bg-green-900/30">
            <div>
              <h4 className="font-semibold text-green-900 dark:text-green-100 text-sm sm:text-base">
                Your Original Solution {hasSolutions && `${selectedSolutionIndex + 1}`}
              </h4>
              {activeSolution.timeComplexity && (
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Time: {activeSolution.timeComplexity}
                  {activeSolution.spaceComplexity && ` | Space: ${activeSolution.spaceComplexity}`}
                </p>
              )}
            </div>
            <button
              onClick={() => handleCopy(activeSolution.code || '', 'solution')}
              className="flex items-center gap-1 px-2 sm:px-3 py-1 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/50 rounded transition-colors text-xs sm:text-sm"
            >
              {copied === 'solution' ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4" />}
              {copied === 'solution' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          
          {}
          {activeSolution.intuition && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border-b border-yellow-400 p-3">
              <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-200 mb-1">Approach:</p>
              <pre className="whitespace-pre-wrap text-yellow-900 dark:text-yellow-100 text-xs">{activeSolution.intuition}</pre>
            </div>
          )}
          
          <div className="bg-gray-900 overflow-x-auto">
            <pre className="p-3 sm:p-4 text-green-400 font-mono text-xs sm:text-sm">
              <code>{activeSolution.code || 'No solution available'}</code>
            </pre>
          </div>
        </div>
      </div>

      {}
      <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          Time taken: <span className="font-mono font-medium">{formatTime(elapsedTime)}</span>
        </div>
        
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-xs sm:text-sm flex-1 sm:flex-none justify-center"
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
  problem: Problem
  showIntuition: boolean
  setShowIntuition: (show: boolean) => void
}) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Problem Statement</h3>
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed font-sans text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            {problem.problemStatement || 'No problem statement available'}
          </pre>
        </div>
      </div>
      
      {problem.intuition && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowIntuition(!showIntuition)}
            className="flex items-center gap-2 mb-4 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium text-sm"
          >
            <Brain className="w-4 h-4" />
            {showIntuition ? 'Hide' : 'Show'} Intuition
            {showIntuition ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showIntuition && (
            <div className="bg-purple-50 dark:bg-purple-900/30 border-l-4 border-purple-400 p-4 rounded-r-lg">
              <pre className="whitespace-pre-wrap text-purple-800 dark:text-purple-300 text-sm leading-relaxed font-sans">
                {problem.intuition}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

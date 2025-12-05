'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Check, Eye, EyeOff, X, Copy, Code2 } from 'lucide-react'
import axios from 'axios'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

// CodeBlock component with syntax highlighting
function CodeBlock({ code, language = 'cpp' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const detectLanguage = (code: string): string => {
    if (code.includes('#include') || code.includes('vector<') || code.includes('std::') || code.includes('cout') || code.includes('cin')) {
      return 'cpp'
    }
    if (code.includes('public class') || code.includes('System.out') || code.includes('ArrayList') || code.includes('import java')) {
      return 'java'
    }
    if (code.includes('def ') || code.includes('import ') || code.includes('print(') || code.includes('if __name__')) {
      return 'python'
    }
    if (code.includes('function') || code.includes('const ') || code.includes('let ') || code.includes('console.log')) {
      return 'javascript'
    }
    return language
  }

  const detectedLanguage = detectLanguage(code)
  const lineCount = code.split('\n').length

  const getLanguageConfig = (lang: string) => {
    const configs = {
      cpp: { name: 'C++', extension: 'cpp', color: 'bg-blue-600' },
      java: { name: 'Java', extension: 'java', color: 'bg-orange-600' },
      python: { name: 'Python', extension: 'py', color: 'bg-green-600' },
      javascript: { name: 'JavaScript', extension: 'js', color: 'bg-yellow-600' },
      clike: { name: 'C++', extension: 'cpp', color: 'bg-blue-600' }
    }
    return configs[lang as keyof typeof configs] || configs.cpp
  }

  const langConfig = getLanguageConfig(detectedLanguage)

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const customStyle = {
    ...atomDark,
    'pre[class*="language-"]': {
      ...atomDark['pre[class*="language-"]'],
      background: '#1a1a1a',
      margin: 0,
      padding: '1rem',
      fontSize: '14px',
      lineHeight: '1.5',
      fontFamily: "'Fira Code', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', monospace",
    },
    'code[class*="language-"]': {
      ...atomDark['code[class*="language-"]'],
      background: '#1a1a1a',
      fontSize: '14px',
      lineHeight: '1.5',
      fontFamily: "'Fira Code', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', monospace",
    }
  }

  return (
    <div className="code-block-container bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-700 transition-all duration-300">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-750 border-b border-gray-600">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
          </div>
          <div className="h-4 w-px bg-gray-600"></div>
          <Code2 className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300 text-sm font-medium">Solution.{langConfig.extension}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 ${langConfig.color} text-white text-xs rounded-full font-semibold shadow-sm`}>
            {langConfig.name}
          </div>
          <span className="text-gray-400 text-xs">{lineCount} lines</span>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-md text-xs transition-colors"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      
      <div className="relative">
        <SyntaxHighlighter
          language={detectedLanguage}
          style={customStyle}
          showLineNumbers={true}
          lineNumberStyle={{ 
            color: '#6b7280', 
            backgroundColor: '#1f2937',
            paddingRight: '1rem',
            textAlign: 'right',
            minWidth: '3rem',
            borderRight: '1px solid #374151'
          }}
          customStyle={{
            margin: 0,
            background: '#1a1a1a',
            fontSize: '14px',
            lineHeight: '1.5',
            fontFamily: "'Fira Code', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', monospace",
          }}
          codeTagProps={{
            style: {
              fontSize: '14px',
              lineHeight: '1.5',
              fontFamily: "'Fira Code', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', monospace",
            }
          }}
        >
          {code}
        </SyntaxHighlighter>
        
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20"></div>
      </div>
    </div>
  )
}

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
  const [showSolutionModal, setShowSolutionModal] = useState(false)
  const [showIntuitionModal, setShowIntuitionModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const fetchProblem = useCallback(async () => {
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
  }, [problemId])

  useEffect(() => {
    if (problemId) {
      fetchProblem()
    }
  }, [problemId, fetchProblem])

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black transition-colors">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black transition-colors">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">Problem not found</h2>
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
      <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/problems')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-900 dark:text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{problem.title}</h1>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full transition-colors">
                  {problem.category}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                  Current Confidence: {problem.Confidence}/10
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-start sm:justify-end">
            <button
              onClick={() => setShowIntuitionModal(!showIntuitionModal)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-800/40 transition-colors"
            >
              {showIntuitionModal ? <EyeOff size={16} /> : <Eye size={16} />}
              {showIntuitionModal ? 'Hide' : 'Show'} Intuition
            </button>
            
            <button
              onClick={() => setShowSolutionModal(!showSolutionModal)}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/40 transition-colors"
            >
              {showSolutionModal ? <EyeOff size={16} /> : <Eye size={16} />}
              {showSolutionModal ? 'Hide' : 'Show'} Solution
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          <div className="flex flex-col">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col transition-colors" style={{ minHeight: '500px', maxHeight: '70vh' }}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors">Problem Statement</h2>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 leading-relaxed transition-colors">
                    {problem.problemStatement}
                  </pre>
                </div>
              </div>
            </div>
          </div>

         
          <div className="flex flex-col">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col transition-colors" style={{ minHeight: '500px', maxHeight: '70vh' }}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors">Write Your Solution</h2>
              </div>
              
              <div className="flex-1 overflow-auto">
                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  className="w-full h-full p-6 border-0 resize-none font-mono text-sm focus:outline-none focus:ring-0 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                  placeholder="// Write your solution here..."
                />
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 transition-colors">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 transition-colors">
                  <span>Lines: {userCode.split('\n').length}</span>
                  <span>Characters: {userCode.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <div className="mt-6 p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-center text-gray-800 dark:text-white">Rate Your Understanding</h2>
          
          
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-center">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Current Confidence</div>
              <div className="text-3xl font-bold text-gray-700 dark:text-gray-300">{problem.Confidence}/10</div>
              {problem.revisionCount !== undefined && problem.revisionCount > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Revised {problem.revisionCount} times
                </div>
              )}
            </div>

            <div className="text-2xl text-gray-400">→</div>

            <div className="text-center">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">New Confidence</div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{newConfidence}/10</div>
            </div>
          </div>

          
          <div className="mb-4">
            <div className="relative">
              <input
                type="range"
                min="1"
                max="10"
                value={newConfidence}
                onChange={(e) => setNewConfidence(parseInt(e.target.value))}
                className="w-full h-3 rounded-full appearance-none cursor-pointer slider-thumb"
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
            
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 px-1">
              <span className="font-medium">Need to relearn</span>
              <span className="font-medium">Complete mastery</span>
            </div>
          </div>

          
          <div className="mb-4 p-3 rounded-lg bg-gray-800 dark:bg-gray-900 text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getConfidenceColor(newConfidence)}`}></div>
              <div className="flex-1">
                <div className="font-bold text-sm mb-0.5">{getConfidenceLabel(newConfidence)}</div>
                <div className="text-xs text-gray-300">
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
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all font-semibold text-base shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Check size={24} />
            {updating ? 'Saving...' : 'Complete Revision & Update Confidence'}
          </button>
        </div>
      </div>
      </div>

      {/* Intuition Modal */}
      {showIntuitionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col shadow-xl transition-colors">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-400 transition-colors">💡 Your Intuition</h2>
              <button
                onClick={() => setShowIntuitionModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-900 dark:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6 bg-yellow-50 dark:bg-yellow-900/20 transition-colors">
              <p className="text-sm text-yellow-700 dark:text-yellow-300 whitespace-pre-wrap leading-relaxed transition-colors">
                {problem.intuition}
              </p>
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button
                onClick={() => setShowIntuitionModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Solution Modal */}
      {showSolutionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col shadow-xl transition-colors">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-green-800 dark:text-green-400 transition-colors">✅ Your Solution</h2>
              <button
                onClick={() => setShowSolutionModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-900 dark:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <CodeBlock code={problem.myCode} language="cpp" />
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button
                onClick={() => setShowSolutionModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Check, Eye, EyeOff, X, Copy, Code2, Sparkles, Lightbulb, ChevronRight, Loader2 } from 'lucide-react'
import axios from 'axios'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import dynamic from 'next/dynamic'


const Editor = dynamic(() => import('@monaco-editor/react'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
})


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
    } catch {
      // Failed to copy
    }
  }

  const customStyle = {
    ...atomDark,
    'pre[class*="language-"]': {
      ...atomDark['pre[class*="language-"]'],
      background: '#1a1a1a',
      margin: 0,
      padding: '0.75rem',
      fontSize: '14px',
      lineHeight: '1.6',
      fontFamily: "'Fira Code', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', monospace",
    },
    'code[class*="language-"]': {
      ...atomDark['code[class*="language-"]'],
      background: '#1a1a1a',
      fontSize: '14px',
      lineHeight: '1.6',
      fontFamily: "'Fira Code', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', monospace",
    }
  }

  return (
    <div className="code-block-container bg-gray-900 rounded-lg sm:rounded-xl overflow-hidden shadow-xl sm:shadow-2xl border border-gray-700 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-gray-800 to-gray-750 border-b border-gray-600 gap-2 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full shadow-sm"></div>
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-500 rounded-full shadow-sm"></div>
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full shadow-sm"></div>
          </div>
          <div className="h-4 w-px bg-gray-600 hidden sm:block"></div>
          <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
          <span className="text-gray-300 text-xs sm:text-sm font-medium truncate">Solution.{langConfig.extension}</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`px-2 sm:px-3 py-0.5 sm:py-1 ${langConfig.color} text-white text-[10px] sm:text-xs rounded-full font-semibold shadow-sm`}>
            {langConfig.name}
          </div>
          <span className="text-gray-400 text-[10px] sm:text-xs">{lineCount} lines</span>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-md text-[10px] sm:text-xs transition-colors"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span className="hidden xs:inline">{copied ? 'Copied!' : 'Copy'}</span>
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
            paddingRight: '0.5rem',
            textAlign: 'right',
            minWidth: '2.5rem',
            borderRight: '1px solid #374151',
            fontSize: '13px'
          }}
          customStyle={{
            margin: 0,
            background: '#1a1a1a',
            fontSize: '14px',
            lineHeight: '1.6',
            fontFamily: "'Fira Code', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', monospace",
          }}
          codeTagProps={{
            style: {
              fontSize: '14px',
              lineHeight: '1.6',
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
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #3B82F6;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    border: 3px solid white;
  }

  .slider-thumb::-moz-range-thumb {
    width: 28px;
    height: 28px;
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

  @media (min-width: 640px) {
    .slider-thumb::-webkit-slider-thumb {
      width: 24px;
      height: 24px;
    }
    .slider-thumb::-moz-range-thumb {
      width: 24px;
      height: 24px;
    }
  }
`;

interface Problem {
  _id: string
  title: string
  problemStatement: string
  problemImages?: string[]
  myCode: string
  intuition: string
  Confidence: number
  category: string
  lastRevised?: Date
  revisionCount?: number
  createdAt: Date
  solutions?: Array<{
    code: string
    intuition: string
    language: string
    timeComplexity: string
    spaceComplexity: string
    approach: string
    createdAt: Date
  }>
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
  const [showAIHintModal, setShowAIHintModal] = useState(false)
  const [aiHint, setAiHint] = useState<string>('')
  const [aiHintLevel, setAiHintLevel] = useState<1 | 2 | 3>(1)
  const [aiHintLoading, setAiHintLoading] = useState(false)
  const [aiHintError, setAiHintError] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [editorLanguage, setEditorLanguage] = useState<string>('cpp')
  const [editorTheme, setEditorTheme] = useState<string>('vs-dark')
  const [selectedSolutionIndex, setSelectedSolutionIndex] = useState<number>(0)

  const [updating, setUpdating] = useState(false)

  const fetchProblem = useCallback(async () => {
    try {
      const response = await axios.get(`/api/problems/${problemId}`)
      if (response.data.success) {
        setProblem(response.data.data)
        setNewConfidence(response.data.data.Confidence)
      }
    } catch {
      // Error fetching problem
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
    } catch {
      alert('Failed to save revision')
    } finally {
      setUpdating(false)
    }
  }

  const handleGetAIHint = async (level: 1 | 2 | 3) => {
    if (!problem) return
    
    setAiHintLoading(true)
    setAiHintError('')
    setAiHintLevel(level)
    
    try {
      const response = await axios.post('/api/ai/hint', {
        problemTitle: problem.title,
        problemStatement: problem.problemStatement,
        category: problem.category,
        userCode: userCode || undefined,
        hintLevel: level
      })
      
      if (response.data.success) {
        setAiHint(response.data.data.hint)
      } else {
        setAiHintError(response.data.error || 'Failed to generate hint')
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        setAiHintError(error.response.data.error)
      } else {
        setAiHintError('Failed to get AI hint. Please try again.')
      }
    } finally {
      setAiHintLoading(false)
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
      <div className="min-h-screen bg-transparent transition-colors">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between max-w-7xl mx-auto gap-3 lg:gap-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <button
              onClick={() => router.push('/problems')}
              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-900 dark:text-white flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 sm:w-5 sm:h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white transition-colors truncate">{problem.title}</h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1">
                <span className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full transition-colors">
                  {problem.category}
                </span>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 transition-colors">
                  Confidence: {problem.Confidence}/10
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => {
                setShowAIHintModal(true)
                if (!aiHint) {
                  handleGetAIHint(1)
                }
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all text-xs sm:text-sm shadow-md hover:shadow-lg"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">AI</span> Hint
            </button>
            
            <button
              onClick={() => setShowIntuitionModal(!showIntuitionModal)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-800/40 transition-colors text-xs sm:text-sm"
            >
              {showIntuitionModal ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              <span className="hidden xs:inline">{showIntuitionModal ? 'Hide' : 'Show'}</span> Intuition
            </button>
            
            <button
              onClick={() => setShowSolutionModal(!showSolutionModal)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/40 transition-colors text-xs sm:text-sm"
            >
              {showSolutionModal ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              <span className="hidden xs:inline">{showSolutionModal ? 'Hide' : 'Show'}</span> Solution
            </button>
            
            <button
              onClick={handleComplete}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium"
            >
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Complete</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          
          <div className="flex flex-col">
            <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl border border-gray-200 dark:border-slate-700 flex flex-col transition-colors min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] max-h-[50vh] sm:max-h-[60vh] lg:max-h-[70vh] shadow-sm hover:shadow-md transition-shadow">
              {/* Header with Tags */}
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">Description</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
                    {problem.category}
                  </span>
                  {problem.revisionCount !== undefined && problem.revisionCount > 0 && (
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium rounded-full">
                      Revised {problem.revisionCount}x
                    </span>
                  )}
                </div>
              </div>
              
              {/* Problem Statement */}
              <div className="flex-1 overflow-auto p-4 sm:p-6">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <pre className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-inter bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                    {problem.problemStatement}
                  </pre>
                </div>

                {/* Problem Images */}
                {problem.problemImages && problem.problemImages.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Examples</h3>
                    <div className="space-y-4">
                      {problem.problemImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="bg-gray-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
                            <img
                              src={image}
                              alt={`Problem example ${index + 1}`}
                              className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(image, '_blank')}
                            />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">Click to expand</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

         
          <div className="flex flex-col">
            <div className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col transition-colors min-h-[250px] sm:min-h-[400px] lg:min-h-[500px] max-h-[50vh] sm:max-h-[60vh] lg:max-h-[70vh]">
              
              {/* Editor Header */}
              <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white transition-colors">
                  Write Your Solution
                </h2>
                
                {/* Language Selector */}
                <div className="flex items-center gap-2">
                  <select
                    value={editorLanguage}
                    onChange={(e) => setEditorLanguage(e.target.value)}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="c">C</option>
                  </select>

                  <select
                    value={editorTheme}
                    onChange={(e) => setEditorTheme(e.target.value)}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="vs-dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="hc-black">High Contrast</option>
                  </select>
                </div>
              </div>
              
              {/* Monaco Editor */}
              <div className="flex-1 overflow-hidden">
                <Editor
                  height="100%"
                  language={editorLanguage}
                  theme={editorTheme}
                  value={userCode}
                  onChange={(value) => setUserCode(value || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    readOnly: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: 'on',
                    padding: { top: 16, bottom: 16 },
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: true,
                    folding: true,
                    bracketPairColorization: { enabled: true },
                    formatOnPaste: true,
                    formatOnType: true,
                  }}
                />
              </div>

              {/* Editor Footer */}
              <div className="p-2.5 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 transition-colors">
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400 transition-colors">
                  <span>Lines: {userCode.split('\n').length}</span>
                  <span>Characters: {userCode.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-md sm:shadow-lg">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 text-center text-gray-800 dark:text-white">Rate Your Understanding</h2>
          
          
          <div className="flex items-center justify-center gap-3 sm:gap-4 lg:gap-6 mb-3 sm:mb-4">
            <div className="text-center">
              <div className="text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5 sm:mb-1">Current</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700 dark:text-gray-300">{problem.Confidence}/10</div>
              {problem.revisionCount !== undefined && problem.revisionCount > 0 && (
                <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                  Revised {problem.revisionCount}x
                </div>
              )}
            </div>

            <div className="text-lg sm:text-xl lg:text-2xl text-gray-400">→</div>

            <div className="text-center">
              <div className="text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5 sm:mb-1">New</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400">{newConfidence}/10</div>
            </div>
          </div>

          
          <div className="mb-3 sm:mb-4">
            <div className="relative px-1 sm:px-0">
              <input
                type="range"
                min="1"
                max="10"
                value={newConfidence}
                onChange={(e) => setNewConfidence(parseInt(e.target.value))}
                className="w-full h-2.5 sm:h-3 rounded-full appearance-none cursor-pointer slider-thumb touch-pan-x"
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
            
            <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1.5 sm:mt-2 px-1">
              <span className="font-medium">Need to relearn</span>
              <span className="font-medium">Complete mastery</span>
            </div>
          </div>

          
          <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-lg bg-gray-800 dark:bg-gray-900 text-white shadow-md">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 sm:mt-0 ${getConfidenceColor(newConfidence)}`}></div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs sm:text-sm mb-0.5">{getConfidenceLabel(newConfidence)}</div>
                <div className="text-[10px] sm:text-xs text-gray-300 leading-relaxed">
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
            className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all font-semibold text-sm sm:text-base shadow-md sm:shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="hidden sm:inline">{updating ? 'Saving...' : 'Complete Revision & Update Confidence'}</span>
            <span className="sm:hidden">{updating ? 'Saving...' : 'Complete Revision'}</span>
          </button>
        </div>
      </div>
      </div>

      
      {showIntuitionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-900 rounded-t-xl sm:rounded-lg w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[80vh] flex flex-col shadow-xl transition-colors">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-yellow-800 dark:text-yellow-400 transition-colors">💡 Your Intuition</h2>
              <button
                onClick={() => setShowIntuitionModal(false)}
                className="p-1.5 sm:p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-900 dark:text-white"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4 sm:p-6 bg-yellow-50 dark:bg-yellow-900/20 transition-colors">
              <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300 whitespace-pre-wrap leading-relaxed transition-colors">
                {problem.intuition}
              </p>
            </div>
            
            <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button
                onClick={() => setShowIntuitionModal(false)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showSolutionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-xl w-full sm:max-w-5xl max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl transition-colors">
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800 rounded-t-2xl sm:rounded-t-xl flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Solutions</h2>
                {problem?.solutions && problem.solutions.length > 0 && (
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    Explore {problem.solutions.length} different approach{problem.solutions.length !== 1 ? 'es' : ''}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowSolutionModal(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {problem?.solutions && problem.solutions.length > 0 ? (
              <>
                {/* Solution Tabs */}
                {problem.solutions.length > 1 && (
                  <div className="px-4 sm:px-6 pt-3 sm:pt-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <div className="flex gap-1 overflow-x-auto pb-3 sm:pb-4 -mb-px">
                      {problem.solutions.map((sol, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedSolutionIndex(index)}
                          className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-all border-b-2 ${
                            selectedSolutionIndex === index
                              ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{problem.solutions[index].language?.toUpperCase() || 'SOL'}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              {problem.solutions[index].timeComplexity ? problem.solutions[index].timeComplexity : '-'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Solution Content */}
                <div className="flex-1 overflow-auto">
                  {problem.solutions[selectedSolutionIndex] && (
                    <div className="p-4 sm:p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Code Section */}
                        <div className="lg:col-span-2 space-y-6">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Code</h3>
                            <CodeBlock 
                              code={problem.solutions[selectedSolutionIndex].code} 
                              language={problem.solutions[selectedSolutionIndex].language || 'cpp'}
                            />
                          </div>
                          
                          {problem.solutions[selectedSolutionIndex].approach && (
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Approach</h3>
                              <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
                                <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed whitespace-pre-wrap font-medium">
                                  {problem.solutions[selectedSolutionIndex].approach}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Sidebar */}
                        <div className="space-y-4">
                          {/* Complexity Stats */}
                          <div className="space-y-3">
                            {problem.solutions[selectedSolutionIndex].timeComplexity && (
                              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1">Time</div>
                                <div className="text-lg font-mono font-bold text-blue-900 dark:text-blue-300">
                                  {problem.solutions[selectedSolutionIndex].timeComplexity}
                                </div>
                              </div>
                            )}
                            
                            {problem.solutions[selectedSolutionIndex].spaceComplexity && (
                              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-800">
                                <div className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wide mb-1">Space</div>
                                <div className="text-lg font-mono font-bold text-purple-900 dark:text-purple-300">
                                  {problem.solutions[selectedSolutionIndex].spaceComplexity}
                                </div>
                              </div>
                            )}
                            
                            {problem.solutions[selectedSolutionIndex].language && (
                              <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-slate-300 dark:border-slate-600">
                                <div className="text-xs font-semibold text-slate-700 dark:text-slate-400 uppercase tracking-wide mb-1">Language</div>
                                <div className="font-semibold text-slate-900 dark:text-slate-200 capitalize">
                                  {problem.solutions[selectedSolutionIndex].language}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Intuition */}
                          {problem.solutions[selectedSolutionIndex].intuition && (
                            <div className="p-4 bg-teal-50 dark:bg-teal-900/10 rounded-lg border border-teal-200 dark:border-teal-800">
                              <h4 className="text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wide mb-2">Key Insight</h4>
                              <p className="text-xs text-teal-900 dark:text-teal-200 leading-relaxed">
                                {problem.solutions[selectedSolutionIndex].intuition}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <p className="text-base text-gray-500 dark:text-gray-400">No solutions available yet</p>
                </div>
              </div>
            )}
            
            {/* Footer */}
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex justify-end gap-3 rounded-b-2xl sm:rounded-b-xl">
              <button
                onClick={() => setShowSolutionModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Hint Modal */}
      {showAIHintModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-900 rounded-t-xl sm:rounded-lg w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-xl transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">AI Hint Assistant</h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Get progressive hints without spoiling the solution</p>
                </div>
              </div>
              <button
                onClick={() => setShowAIHintModal(false)}
                className="p-1.5 sm:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hint Level Selector */}
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Choose hint level:</p>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <button
                  onClick={() => handleGetAIHint(1)}
                  disabled={aiHintLoading}
                  className={`flex flex-col items-center p-2 sm:p-3 rounded-lg border-2 transition-all ${
                    aiHintLevel === 1 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                  } disabled:opacity-50`}
                >
                  <Lightbulb className={`w-5 h-5 sm:w-6 sm:h-6 mb-1 ${aiHintLevel === 1 ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`} />
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Nudge</span>
                  <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Gentle push</span>
                </button>
                
                <button
                  onClick={() => handleGetAIHint(2)}
                  disabled={aiHintLoading}
                  className={`flex flex-col items-center p-2 sm:p-3 rounded-lg border-2 transition-all ${
                    aiHintLevel === 2 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                  } disabled:opacity-50`}
                >
                  <div className="flex mb-1">
                    <Lightbulb className={`w-5 h-5 sm:w-6 sm:h-6 ${aiHintLevel === 2 ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`} />
                    <Lightbulb className={`w-5 h-5 sm:w-6 sm:h-6 -ml-2 ${aiHintLevel === 2 ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`} />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Approach</span>
                  <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Algorithm hint</span>
                </button>
                
                <button
                  onClick={() => handleGetAIHint(3)}
                  disabled={aiHintLoading}
                  className={`flex flex-col items-center p-2 sm:p-3 rounded-lg border-2 transition-all ${
                    aiHintLevel === 3 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                  } disabled:opacity-50`}
                >
                  <div className="flex mb-1">
                    <Lightbulb className={`w-5 h-5 sm:w-6 sm:h-6 ${aiHintLevel === 3 ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`} />
                    <Lightbulb className={`w-5 h-5 sm:w-6 sm:h-6 -ml-2 ${aiHintLevel === 3 ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`} />
                    <Lightbulb className={`w-5 h-5 sm:w-6 sm:h-6 -ml-2 ${aiHintLevel === 3 ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`} />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Detailed</span>
                  <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Step by step</span>
                </button>
              </div>
            </div>
            
            {/* Hint Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
              {aiHintLoading ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                  <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500 animate-spin mb-3" />
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Generating your hint...</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-1">This may take a few seconds</p>
                </div>
              ) : aiHintError ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 sm:p-6">
                  <p className="text-sm sm:text-base text-red-700 dark:text-red-400 font-medium mb-2">Unable to generate hint</p>
                  <p className="text-xs sm:text-sm text-red-600 dark:text-red-300">{aiHintError}</p>
                  <button
                    onClick={() => handleGetAIHint(aiHintLevel)}
                    className="mt-3 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-xs sm:text-sm hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors"
                  >
                    Try again
                  </button>
                </div>
              ) : aiHint ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                      aiHintLevel === 1 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      aiHintLevel === 2 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                    }`}>
                      Level {aiHintLevel} Hint
                    </span>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800 rounded-lg p-4 sm:p-6 border border-purple-100 dark:border-purple-900/30">
                    <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                      {aiHint}
                    </p>
                  </div>
                  
                  {aiHintLevel < 3 && (
                    <button
                      onClick={() => handleGetAIHint((aiHintLevel + 1) as 1 | 2 | 3)}
                      disabled={aiHintLoading}
                      className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm sm:text-base font-medium transition-colors"
                    >
                      <span>Need more help? Get Level {aiHintLevel + 1} hint</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                  <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-purple-300 dark:text-purple-700 mb-3" />
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Select a hint level above to get started</p>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                💡 Try solving before getting more hints!
              </p>
              <button
                onClick={() => setShowAIHintModal(false)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
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

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { ArrowLeft, Save, X, AlertCircle } from 'lucide-react'

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
  title: string
  category: string
  Confidence: number
  problemStatement: string
  myCode: string
  intuition: string
  solutions?: Solution[]
  createdAt: string
  updatedAt: string
  tags?: string[]
}

const categories = [
  // Step 1: Basics
  'Basic Maths',
  'Basic Recursion',
  'Basic Hashing',
  
  // Step 2: Sorting
  'Sorting Algorithms',
  
  // Step 3: Arrays
  'Arrays',
  
  // Step 4: Binary Search
  'Binary Search',
  
  // Step 5: Strings
  'Strings',
  
  // Step 6: Linked List
  'Linked List',
  'Doubly Linked List',
  
  // Step 7: Recursion Patterns
  'Recursion',
  'Subsequences',
  'Backtracking',
  
  // Step 8: Bit Manipulation
  'Bit Manipulation',
  
  // Step 9: Stack and Queues
  'Stack',
  'Queue',
  'Monotonic Stack',
  
  // Step 10: Sliding Window & Two Pointer
  'Sliding Window',
  'Two Pointers',
  
  // Step 11: Heaps
  'Heap',
  'Priority Queue',
  
  // Step 12: Greedy
  'Greedy Algorithms',
  
  // Step 13: Binary Trees
  'Binary Tree',
  'Tree Traversal',
  
  // Step 14: Binary Search Trees
  'Binary Search Tree',
  
  // Step 15: Graphs
  'Graph',
  'BFS',
  'DFS',
  'Shortest Path',
  'Minimum Spanning Tree',
  'Topological Sort',
  
  // Step 16: Dynamic Programming
  'Dynamic Programming',
  'DP on Arrays',
  'DP on Grids',
  'DP on Strings',
  'DP on Trees',
  'DP on Subsequences',
  
  // Step 17: Tries
  'Trie',
  
  // Additional Important Categories
  'Mathematical',
  'Geometry',
  'Number Theory',
  'Combinatorics',
  'Game Theory',
  'Matrix',
  'Design',
  'System Design',
  
  // Company/Contest Specific
  'Interview Questions',
  'Contest Problems',
  'Mock Interview'
]

export default function EditProblemPage() {
  const { data: session, status } = useSession()
  const user = session?.user
  const isLoaded = status !== 'loading'
  const router = useRouter()
  const params = useParams()
  
  const [problem, setProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    Confidence: 1,
    problemStatement: '',
    tags: [] as string[]
  })
  const [solutions, setSolutions] = useState<Solution[]>([{
    code: '',
    intuition: '',
    language: 'cpp',
    timeComplexity: '',
    spaceComplexity: '',
    approach: ''
  }])
  const [tagInput, setTagInput] = useState('')

  // Fetch problem data
  useEffect(() => {
    if (!isLoaded || !user || !params.id) return

    const fetchProblem = async () => {
      try {
        setLoading(true)
        setError('')
        
        const response = await fetch(`/api/problems/${params.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
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
          const problemData = result.data
          setProblem(problemData)
          setFormData({
            title: problemData.title || '',
            category: problemData.category || '',
            Confidence: problemData.Confidence || 1,
            problemStatement: problemData.problemStatement || '',
            tags: problemData.tags || []
          })
          // Load solutions or create from legacy fields
          if (problemData.solutions && problemData.solutions.length > 0) {
            setSolutions(problemData.solutions)
          } else if (problemData.myCode) {
            setSolutions([{
              code: problemData.myCode || '',
              intuition: problemData.intuition || '',
              language: 'cpp',
              timeComplexity: '',
              spaceComplexity: '',
              approach: ''
            }])
          }
        } else {
          setError(result.error || 'Failed to fetch problem')
        }
      } catch {
        setError('Failed to fetch problem')
      } finally {
        setLoading(false)
      }
    }

    fetchProblem()
  }, [user, isLoaded, params.id])

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!problem) return
    
   
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }
    if (!formData.problemStatement.trim()) {
      setError('Problem statement is required')
      return
    }
    if (!solutions[0]?.code.trim()) {
      setError('At least one solution code is required')
      return
    }
    if (!formData.category) {
      setError('Category is required')
      return
    }

    try {
      setSaving(true)
      setError('')
      
      const response = await fetch(`/api/problems/${problem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          solutions: solutions.filter(sol => sol.code.trim() !== ''),
          // Keep backward compatibility
          myCode: solutions[0]?.code || '',
          intuition: solutions[0]?.intuition || ''
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // Redirect back to problem detail page
        router.push(`/problems/${problem._id}`)
      } else {
        setError(result.error || 'Failed to update problem')
      }
    } catch {
      setError('Failed to update problem')
    } finally {
      setSaving(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-transparent">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="animate-spin rounded-full h-24 w-24 sm:h-32 sm:w-32 border-b-2 border-black dark:border-white"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-transparent">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
          <AlertCircle className="w-16 h-16 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-400">Please sign in to edit problems.</p>
          <Link
            href="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (error && !problem) {
    return (
      <div className="min-h-screen bg-transparent">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
          <AlertCircle className="w-16 h-16 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Error</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <Link
            href="/problems"
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Problems
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent transition-colors">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/problems/${params.id}`}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
            </Link>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Edit Problem
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href={`/problems/${params.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="space-y-6">
          {/* Title */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Problem Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Enter problem title..."
              maxLength={200}
            />
          </div>

          {/* Category and Confidence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confidence Level ({formData.Confidence}/10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.Confidence}
                onChange={(e) => handleInputChange('Confidence', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags (Optional)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const tag = tagInput.trim()
                    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
                      handleInputChange('tags', [...formData.tags, tag])
                      setTagInput('')
                    }
                  }
                }}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Add tags (e.g., important, interview-prep, company:google)"
              />
              <button
                type="button"
                onClick={() => {
                  const tag = tagInput.trim()
                  if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
                    handleInputChange('tags', [...formData.tags, tag])
                    setTagInput('')
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Press Enter or click Add. Max 10 tags.
            </p>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange('tags', formData.tags.filter((_, i) => i !== index))
                      }}
                      className="ml-1 hover:text-red-600 dark:hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Problem Statement */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Problem Statement
            </label>
            <textarea
              value={formData.problemStatement}
              onChange={(e) => handleInputChange('problemStatement', e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-vertical"
              placeholder="Describe the problem statement..."
            />
          </div>

          {/* Multiple Solutions Section */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Solutions ({solutions.length})</h2>
              <button
                type="button"
                onClick={() => setSolutions([...solutions, {
                  code: '',
                  intuition: '',
                  language: 'cpp',
                  timeComplexity: '',
                  spaceComplexity: '',
                  approach: ''
                }])}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                + Add Solution
              </button>
            </div>

            {solutions.map((solution, index) => (
              <div key={index} className="mb-8 p-5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Solution {index + 1}
                  </h3>
                  {solutions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSolutions(solutions.filter((_, i) => i !== index))}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Language
                      </label>
                      <select
                        value={solution.language}
                        onChange={(e) => {
                          const newSolutions = [...solutions]
                          newSolutions[index].language = e.target.value
                          setSolutions(newSolutions)
                        }}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                        <option value="go">Go</option>
                        <option value="rust">Rust</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Time Complexity
                      </label>
                      <input
                        type="text"
                        value={solution.timeComplexity}
                        onChange={(e) => {
                          const newSolutions = [...solutions]
                          newSolutions[index].timeComplexity = e.target.value
                          setSolutions(newSolutions)
                        }}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., O(n log n)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Space Complexity
                      </label>
                      <input
                        type="text"
                        value={solution.spaceComplexity}
                        onChange={(e) => {
                          const newSolutions = [...solutions]
                          newSolutions[index].spaceComplexity = e.target.value
                          setSolutions(newSolutions)
                        }}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., O(n)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Approach / Intuition
                    </label>
                    <textarea
                      rows={3}
                      value={solution.intuition}
                      onChange={(e) => {
                        const newSolutions = [...solutions]
                        newSolutions[index].intuition = e.target.value
                        setSolutions(newSolutions)
                      }}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="Explain your approach and thought process..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Solution Code {index === 0 && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                      rows={12}
                      value={solution.code}
                      onChange={(e) => {
                        const newSolutions = [...solutions]
                        newSolutions[index].code = e.target.value
                        setSolutions(newSolutions)
                      }}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      placeholder="Paste your working solution code here..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex items-center justify-end gap-3">
          <Link
            href={`/problems/${params.id}`}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
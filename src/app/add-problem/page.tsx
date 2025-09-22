'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Code, Brain, FileText, CheckCircle, AlertCircle } from 'lucide-react'

export default function AddProblemPage() {
  const { user } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    problemStatement: '',
    myCode: '',
    intuition: '',
    difficulty: 5,
    category: 'Graph'
  })

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
  'Mock Interview',
]


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          problemStatement: formData.problemStatement,
          myCode: formData.myCode,
          intuition: formData.intuition,
          difficulty: formData.difficulty,
          category: formData.category,
        }),
      })

      const result = await response.json()

if (response.ok && result.success) {
  console.log('Problem created successfully!')
  setSuccess(true)
  setTimeout(() => {
    router.push(`/organize?refresh=${Date.now()}`)
  }, 1500)
}
 else {
        setError(result.error || 'Failed to save problem')
      }
      
    } catch (error) {
      console.error('Error saving problem:', error)
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Problem Saved!</h2>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Problem</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="text-red-500" size={20} />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="text-blue-500" size={20} />
              <h2 className="text-xl font-semibold">Problem Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Problem Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Dijkstra's Shortest Path"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confidence (1-10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.difficulty}
                onChange={(e) => setFormData({...formData, difficulty: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>low (1)</span>
                <span className="font-medium">{formData.difficulty}</span>
                <span>High (10)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Problem Statement
              </label>
              <textarea
                required
                rows={6}
                value={formData.problemStatement}
                onChange={(e) => setFormData({...formData, problemStatement: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the problem statement, input/output format, constraints..."
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="text-purple-500" size={20} />
              <h2 className="text-xl font-semibold">Your Intuition</h2>
            </div>
            <textarea
              rows={4}
              value={formData.intuition}
              onChange={(e) => setFormData({...formData, intuition: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Explain your approach and thought process..."
            />
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Code className="text-green-500" size={20} />
              <h2 className="text-xl font-semibold">Your Solution Code</h2>
            </div>
            <textarea
              required
              rows={12}
              value={formData.myCode}
              onChange={(e) => setFormData({...formData, myCode: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="Paste your working solution code here..."
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save size={20} />
              {loading ? 'Saving...' : 'Save Problem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

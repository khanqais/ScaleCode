'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Code, Brain, FileText, CheckCircle, AlertCircle, Crown, TrendingUp } from 'lucide-react'

export default function AddProblemPage() {
  
  const { user } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [limitReached, setLimitReached] = useState(false)
  const [limitInfo, setLimitInfo] = useState<{
    currentCount: number;
    limit: number;
    currentPlan: string;
  } | null>(null)
  const [usageInfo, setUsageInfo] = useState<{
    currentCount: number;
    limit: number;
    plan: string;
    remaining: number;
  } | null>(null)
  const [loadingUsage, setLoadingUsage] = useState(true)
  
  const [formData, setFormData] = useState({
    title: '',
    problemStatement: '',
    myCode: '',
    intuition: '',
    Confidence: 5,
    category: 'Graph'
  })

  const categories = [
    'Basic Maths', 'Basic Recursion', 'Basic Hashing', 'Sorting Algorithms', 'Arrays',
    'Binary Search', 'Strings', 'Linked List', 'Doubly Linked List', 'Recursion',
    'Subsequences', 'Backtracking', 'Bit Manipulation', 'Stack', 'Queue',
    'Monotonic Stack', 'Sliding Window', 'Two Pointers', 'Heap', 'Priority Queue',
    'Greedy Algorithms', 'Binary Tree', 'Tree Traversal', 'Binary Search Tree',
    'Graph', 'BFS', 'DFS', 'Shortest Path', 'Minimum Spanning Tree', 'Topological Sort',
    'Dynamic Programming', 'DP on Arrays', 'DP on Grids', 'DP on Strings', 'DP on Trees',
    'DP on Subsequences', 'Trie', 'Mathematical', 'Geometry', 'Number Theory',
    'Combinatorics', 'Game Theory', 'Matrix', 'Design', 'System Design',
    'Interview Questions', 'Contest Problems', 'Mock Interview',
  ]

  // Fetch current usage info on component mount
  useEffect(() => {
    const fetchUsageInfo = async () => {
      if (!user) {
        return
      }
      
      try {
        setLoadingUsage(true)
        const response = await fetch('/api/problems', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data.problems) {
            const currentCount = result.data.problems.length
            
            // Fetch user plan to calculate limit
            const planResponse = await fetch('/api/subscription/status')
            const planData = await planResponse.json()
            
            let plan = 'free'
            let limit = 50
            
            if (planData.success && planData.subscription) {
              plan = planData.subscription.plan || 'free'
            }
            
            // Set limits based on plan
            const limits: Record<string, number> = {
              'free': 100,
              'pro': 2000,
              'pro_max': 4000
            }
            limit = limits[plan] || 100
            
            setUsageInfo({
              currentCount,
              limit,
              plan,
              remaining: limit - currentCount
            })
          }
        }
      } catch (error) {
        console.error('Error fetching usage info:', error)
      } finally {
        setLoadingUsage(false)
      }
    }
    
    fetchUsageInfo()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      return
    }

    setLoading(true)
    setError('')
    setLimitReached(false)
    
    try {
      const problemData = {
        title: formData.title,
        problemStatement: formData.problemStatement,
        myCode: formData.myCode,
        intuition: formData.intuition,
        Confidence: formData.Confidence,
        category: formData.category,
      }
      
      console.log('Sending problem data:', problemData)
      
      const response = await fetch('/api/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(problemData),
      })

      const result = await response.json()
      console.log('API Response:', result)

      if (response.ok && result.success) {
        console.log('Problem created successfully!')
        setSuccess(true)
        
        // Update usage info if available in response
        if (result.usage) {
          setUsageInfo({
            currentCount: result.usage.currentCount,
            limit: result.usage.limit,
            plan: result.usage.plan,
            remaining: result.usage.remaining
          })
        }
        
        setTimeout(() => {
          router.push(`/organize?refresh=${Date.now()}`)
        }, 1500)
      } else if (result.limitReached) {
        // Handle limit reached
        setLimitReached(true)
        setLimitInfo({
          currentCount: result.currentCount,
          limit: result.limit,
          currentPlan: result.currentPlan
        })
        setError(result.message)
      } else {
        setError(result.error || 'Failed to save problem')
        console.error('API Error:', result)
      }
      
    } catch (error) {
      console.error('Error saving problem:', error)
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  // Limit Reached Modal
  if (limitReached && limitInfo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center transition-colors p-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg max-w-md w-full text-center transition-colors">
          <Crown className="mx-auto text-yellow-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Upgrade to Continue</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You&apos;ve reached your <span className="font-semibold capitalize">{limitInfo.currentPlan}</span> plan limit of <span className="font-bold">{limitInfo.limit}</span> problems.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Upgrade to Pro or Pro Max to add more problems and unlock advanced features!
          </p>
          
          <div className="space-y-3">
            <Link
              href="/pricing"
              className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
            >
              View Pricing Plans
            </Link>
            <button
              onClick={() => router.back()}
              className="block w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center transition-colors">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg text-center transition-colors">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Problem Saved!</h2>
          <p className="text-gray-600 dark:text-gray-400 transition-colors">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6 transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Problem</h1>
        </div>

        {/* Usage Info Banner */}
        {usageInfo && !loadingUsage && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 shadow-sm border border-blue-100 dark:border-gray-600">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <TrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Your Progress
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="capitalize font-medium">{usageInfo.plan}</span> Plan
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {usageInfo.currentCount}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Problems Created</p>
                </div>
                
                <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
                
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {usageInfo.remaining}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
                </div>
                
                <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
                
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                    {usageInfo.limit}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Limit</p>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Usage</span>
                <span>{Math.round((usageInfo.currentCount / usageInfo.limit) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full transition-all ${
                    usageInfo.remaining <= 5 
                      ? 'bg-red-500' 
                      : usageInfo.remaining <= 20 
                      ? 'bg-yellow-500' 
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((usageInfo.currentCount / usageInfo.limit) * 100, 100)}%` }}
                ></div>
              </div>
              
              {usageInfo.remaining <= 5 && usageInfo.plan === 'free' && (
                <p className="mt-2 text-sm text-orange-600 dark:text-orange-400 flex items-center gap-1">
                  <AlertCircle size={16} />
                  Running low on problems! Consider upgrading to{' '}
                  <Link href="/pricing" className="underline font-semibold hover:text-orange-700">
                    Pro or Pro Max
                  </Link>
                </p>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="text-red-500 dark:text-red-400" size={20} />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="text-blue-500" size={20} />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Problem Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Problem Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Dijkstra's Shortest Path"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Confidence (1-10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.Confidence}
                onChange={(e) => setFormData({...formData, Confidence: parseInt(e.target.value)})}
                className="w-full h-2 bg-blue-200 dark:bg-blue-600 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span>Low (1)</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">{formData.Confidence}</span>
                <span>High (10)</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                How confident are you in solving this problem again?
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Problem Statement
              </label>
              <textarea
                required
                rows={6}
                value={formData.problemStatement}
                onChange={(e) => setFormData({...formData, problemStatement: e.target.value})}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the problem statement, input/output format, constraints..."
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="text-purple-500" size={20} />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Intuition</h2>
            </div>
            <textarea
              rows={4}
              value={formData.intuition}
              onChange={(e) => setFormData({...formData, intuition: e.target.value})}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Explain your approach and thought process..."
            />
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Code className="text-green-500" size={20} />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Solution Code</h2>
            </div>
            <textarea
              required
              rows={12}
              value={formData.myCode}
              onChange={(e) => setFormData({...formData, myCode: e.target.value})}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="Paste your working solution code here..."
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
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

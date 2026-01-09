'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Code, Brain, FileText, CheckCircle, AlertCircle, Crown, ImagePlus, X, Image as ImageIcon } from 'lucide-react'

export default function AddProblemPage() {
  
  const { data: session } = useSession()
  const user = session?.user
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
  
  const [formData, setFormData] = useState({
    title: '',
    problemStatement: '',
    Confidence: 5,
    category: 'Graph',
    tags: [] as string[],
    problemImages: [] as string[]
  })
  const [solutions, setSolutions] = useState([{
    code: '',
    intuition: '',
    language: 'cpp',
    timeComplexity: '',
    spaceComplexity: '',
    approach: ''
  }])
  const [tagInput, setTagInput] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImage(true)
    
    try {
      const newImages: string[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError('Please upload only image files')
          continue
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError('Image size should be less than 5MB')
          continue
        }
        
        // Convert to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        
        newImages.push(base64)
      }
      
      // Limit to max 5 images
      const totalImages = [...formData.problemImages, ...newImages].slice(0, 5)
      setFormData({ ...formData, problemImages: totalImages })
      
      if (formData.problemImages.length + newImages.length > 5) {
        setError('Maximum 5 images allowed per problem')
      }
    } catch {
      setError('Failed to upload image')
    } finally {
      setUploadingImage(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      problemImages: formData.problemImages.filter((_, i) => i !== index)
    })
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        
        const file = item.getAsFile()
        if (!file) continue

        // Check if we already have 5 images
        if (formData.problemImages.length >= 5) {
          setError('Maximum 5 images allowed per problem')
          return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError('Image size should be less than 5MB')
          return
        }

        setUploadingImage(true)
        try {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
          })

          setFormData(prev => ({
            ...prev,
            problemImages: [...prev.problemImages, base64].slice(0, 5)
          }))
        } catch {
          setError('Failed to paste image')
        } finally {
          setUploadingImage(false)
        }
        break // Only handle first image
      }
    }
  }

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

  
  useEffect(() => {
    const fetchUsageInfo = async () => {
      if (!user) {
        return
      }
      
      try {
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
            
            const plan = session?.user?.subscriptionPlan || 'free'
            
            const limits: Record<string, number> = {
              'free': 100,
              'pro': 2000,
              'pro_max': 4000
            }
            const limit = limits[plan] || 100
            
            setUsageInfo({
              currentCount,
              limit,
              plan,
              remaining: limit - currentCount
            })
          }
        }
      } catch {
        // Error fetching usage info
      } finally {
      }
    }
    
    fetchUsageInfo()
  }, [user, session?.user?.subscriptionPlan])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      return
    }

    
    if (usageInfo && usageInfo.remaining <= 0) {
      setLimitReached(true)
      setLimitInfo({
        currentCount: usageInfo.currentCount,
        limit: usageInfo.limit,
        currentPlan: usageInfo.plan
      })
      setError(`You've reached your ${usageInfo.plan} plan limit of ${usageInfo.limit} problems. Please upgrade to continue.`)
      return
    }

    setLoading(true)
    setError('')
    setLimitReached(false)
    
    try {
      const problemData = {
        title: formData.title,
        problemStatement: formData.problemStatement,
        problemImages: formData.problemImages,
        solutions: solutions.filter(sol => sol.code.trim() !== ''),
        Confidence: formData.Confidence,
        category: formData.category,
        tags: formData.tags,
       
        myCode: solutions[0]?.code || '',
        intuition: solutions[0]?.intuition || ''
      }
      
      const response = await fetch('/api/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(problemData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSuccess(true)
        
        
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
        
        setLimitReached(true)
        setLimitInfo({
          currentCount: result.currentCount,
          limit: result.limit,
          currentPlan: result.currentPlan
        })
        setError(result.message)
      } else {
        setError(result.error || 'Failed to save problem')
      }
      
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  
  if (limitReached && limitInfo) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center transition-colors p-6">
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
      <div className="min-h-screen bg-transparent flex items-center justify-center transition-colors">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg text-center transition-colors">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Problem Saved!</h2>
          <p className="text-gray-600 dark:text-gray-400 transition-colors">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <button
            onClick={() => router.back()}
            className="p-1.5 sm:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900 dark:text-white" />
          </button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Add New Problem</h1>
        </div>

        
        {/* Your Progress Box - Commented Out */}
        {/* {usageInfo && !loadingUsage && (
          <div className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 sm:p-6 shadow-sm border border-blue-100 dark:border-gray-600">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <TrendingUp className="text-blue-600 dark:text-blue-400 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Your Progress
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <span className="capitalize font-medium">{usageInfo.plan}</span> Plan
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-around sm:justify-end gap-4 sm:gap-6">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {usageInfo.currentCount}
                  </p>
                  <p className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400">Created</p>
                </div>
                
                <div className="h-8 sm:h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
                
                <div className="text-center">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400">
                    {usageInfo.remaining}
                  </p>
                  <p className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400">Remaining</p>
                </div>
                
                <div className="h-8 sm:h-12 w-px bg-gray-300 dark:bg-gray-600 hidden sm:block"></div>
                
                <div className="text-center hidden sm:block">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-600 dark:text-gray-400">
                    {usageInfo.limit}
                  </p>
                  <p className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400">Total Limit</p>
                </div>
              </div>
            </div>
            
           
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
        )} */}
  
        {/* Limit Reached Warning */}
        {usageInfo && usageInfo.remaining <= 0 && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="text-yellow-500" size={20} />
              <span className="font-semibold text-yellow-700 dark:text-yellow-300">Limit Reached</span>
            </div>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-3">
              You&apos;ve reached your <span className="font-semibold capitalize">{usageInfo.plan}</span> plan limit of {usageInfo.limit} problems.
              To continue adding problems, please upgrade your plan.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
            >
              <Crown size={16} />
              Upgrade Now
            </Link>
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

            <div>
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
                        setFormData({...formData, tags: [...formData.tags, tag]})
                        setTagInput('')
                      }
                    }
                  }}
                  className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add tags (e.g., important, interview-prep, company:google)"
                />
                <button
                  type="button"
                  onClick={() => {
                    const tag = tagInput.trim()
                    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
                      setFormData({...formData, tags: [...formData.tags, tag]})
                      setTagInput('')
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Press Enter or click Add. Max 10 tags. Examples: important, interview-prep, company:google
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
                          setFormData({
                            ...formData,
                            tags: formData.tags.filter((_, i) => i !== index)
                          })
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

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Confidence Level: <span className={`font-bold ${
                  formData.Confidence <= 3 ? 'text-red-600' : 
                  formData.Confidence <= 6 ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>{formData.Confidence}/10</span>
              </label>
              
              <input
                type="range"
                min="1"
                max="10"
                value={formData.Confidence}
                onChange={(e) => setFormData({...formData, Confidence: parseInt(e.target.value)})}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, 
                    #ef4444 0%, #ef4444 30%, 
                    #eab308 30%, #eab308 60%, 
                    #22c55e 60%, #22c55e 100%)`
                }}
              />
              
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>1 - Low</span>
                <span>5 - Medium</span>
                <span>10 - High</span>
              </div>
              
              <style jsx>{`
                .slider::-webkit-slider-thumb {
                  appearance: none;
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  background: white;
                  border: 3px solid ${formData.Confidence <= 3 ? '#ef4444' : formData.Confidence <= 6 ? '#eab308' : '#22c55e'};
                  cursor: pointer;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                .slider::-moz-range-thumb {
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  background: white;
                  border: 3px solid ${formData.Confidence <= 3 ? '#ef4444' : formData.Confidence <= 6 ? '#eab308' : '#22c55e'};
                  cursor: pointer;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
              `}</style>
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

            {/* Problem Images Upload */}
            <div
              onPaste={handlePaste}
              tabIndex={0}
              className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-1 -m-1"
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <ImageIcon className="inline w-4 h-4 mr-1" />
                Problem Images (Optional)
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Add images to help explain the problem. <span className="font-medium text-blue-600 dark:text-blue-400">Paste from clipboard (Ctrl+V)</span> or upload. Max 5 images, 5MB each.
              </p>
              
              {/* Image Preview Grid */}
              {formData.problemImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                  {formData.problemImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Problem image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Upload Button */}
              {formData.problemImages.length < 5 && (
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className={`inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                      uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <ImagePlus className="text-gray-500 dark:text-gray-400" size={20} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {uploadingImage ? 'Uploading...' : `Add Images (${formData.problemImages.length}/5)`}
                    </span>
                  </label>
                  <span className="text-xs text-gray-400 dark:text-gray-500">or press Ctrl+V to paste</span>
                </div>
              )}
            </div>
          </div>

          {/* Multiple Solutions Section */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Code className="text-green-500" size={20} />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Solutions ({solutions.length})</h2>
              </div>
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
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Code size={16} />
                Add Another Solution
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
                      <Brain className="inline w-4 h-4 mr-1" />
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
                      required={index === 0}
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
              disabled={loading || (usageInfo?.remaining !== undefined && usageInfo.remaining <= 0)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                usageInfo?.remaining !== undefined && usageInfo.remaining <= 0
                  ? 'bg-gray-400 text-gray-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Save size={20} />
              {loading ? 'Saving...' : usageInfo?.remaining !== undefined && usageInfo.remaining <= 0 ? 'Limit Reached' : 'Save Problem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

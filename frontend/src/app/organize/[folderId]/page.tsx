'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  Plus, 
  ArrowLeft, 
  Code, 
  Brain, 
  Clock, 
  Star, 
  Play,
  BookOpen,
  Target,
  Zap
} from 'lucide-react'

interface Problem {
  id: string
  title: string
  problem_statement: string
  code: string
  intuition: string
  difficulty: number
  tags: string[]
  platform: string
  problem_url: string
  time_complexity: string
  space_complexity: string
  created_at: string
  updated_at: string
}

interface Folder {
  id: string
  name: string
  description: string
  color: string
}

export default function FolderDetailPage() {
  const { user } = useUser()
  const params = useParams()
  const router = useRouter()
  const folderId = params.folderId as string

  const [folder, setFolder] = useState<Folder | null>(null)
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateProblem, setShowCreateProblem] = useState(false)
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null)

  useEffect(() => {
    if (user && folderId) {
      fetchFolderData()
    }
  }, [user, folderId])

  const fetchFolderData = async () => {
    setLoading(true)
    try {
      await Promise.all([fetchFolder(), fetchProblems()])
    } catch (error) {
      console.error('Error fetching folder data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFolder = async () => {
    if (!user) return

    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single()

    if (!userData) return

    const { data: folderData } = await supabase
      .from('folders')
      .select('*')
      .eq('id', folderId)
      .eq('user_id', userData.id)
      .single()

    if (folderData) {
      setFolder(folderData)
    }
  }

  const fetchProblems = async () => {
    if (!user) return

    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single()

    if (!userData) return

    const { data: problemsData } = await supabase
      .from('problems')
      .select('*')
      .eq('folder_id', folderId)
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })

    if (problemsData) {
      setProblems(problemsData)
    }
  }

  const handleCreateProblem = async (problemData: any) => {
    if (!user) return

    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single()

    if (!userData) return

    const { error } = await supabase.from('problems').insert([{
      ...problemData,
      folder_id: folderId,
      user_id: userData.id,
    }])

    if (!error) {
      await fetchProblems()
      setShowCreateProblem(false)
    } else {
      console.error('Failed to create problem:', error)
    }
  }

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'text-green-600 bg-green-100'
    if (difficulty <= 6) return 'text-yellow-600 bg-yellow-100'
    if (difficulty <= 8) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getDifficultyText = (difficulty: number) => {
    if (difficulty <= 3) return 'Easy'
    if (difficulty <= 6) return 'Medium'
    if (difficulty <= 8) return 'Hard'
    return 'Expert'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!folder) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Folder not found</h2>
          <button
            onClick={() => router.push('/organize')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Organize
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push('/organize')}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: folder.color }}
              />
              <h1 className="text-3xl font-bold text-gray-900">{folder.name}</h1>
            </div>
            <p className="text-gray-600">{folder.description}</p>
          </div>
          <button
            onClick={() => setShowCreateProblem(true)}
            className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add Problem
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="text-blue-500" size={24} />
              <span className="text-sm font-medium text-gray-600">Total Problems</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{problems.length}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <Target className="text-green-500" size={24} />
              <span className="text-sm font-medium text-gray-600">Average Difficulty</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {problems.length > 0 
                ? (problems.reduce((sum, p) => sum + p.difficulty, 0) / problems.length).toFixed(1)
                : '0'
              }/10
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="text-purple-500" size={24} />
              <span className="text-sm font-medium text-gray-600">Ready for Revision</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {problems.filter(p => p.difficulty >= 7).length}
            </p>
          </div>
        </div>

        {/* Problems List */}
        {problems.length === 0 ? (
          <div className="text-center py-20">
            <Code size={80} className="mx-auto text-gray-300 mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No problems yet</h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Add your first problem to this pattern folder. Include the problem statement, 
              your solution, and your intuition for better revision.
            </p>
            <button
              onClick={() => setShowCreateProblem(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg flex items-center gap-3 mx-auto"
            >
              <Plus size={24} />
              Add Your First Problem
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {problems.map((problem) => (
              <div
                key={problem.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => setSelectedProblem(problem)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{problem.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                    {getDifficultyText(problem.difficulty)} {problem.difficulty}/10
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {problem.problem_statement}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{problem.platform || 'Custom'}</span>
                  <span>{new Date(problem.created_at).toLocaleDateString()}</span>
                </div>

                {problem.tags && problem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {problem.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                    {problem.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                        +{problem.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <Clock size={14} />
                    <span>{problem.time_complexity || 'Not specified'}</span>
                  </div>
                  <span className="text-xs text-gray-500">Click to view</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Start Revision Button */}
        {problems.length > 0 && (
          <div className="fixed bottom-6 right-6">
            <button
              onClick={() => router.push(`/organize/${folderId}/revision`)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-full font-medium hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg flex items-center gap-3"
            >
              <Brain size={24} />
              Start Revision
            </button>
          </div>
        )}

        {/* Modals */}
        {showCreateProblem && (
          <CreateProblemModal
            onClose={() => setShowCreateProblem(false)}
            onCreate={handleCreateProblem}
          />
        )}

        {selectedProblem && (
          <ProblemViewModal
            problem={selectedProblem}
            onClose={() => setSelectedProblem(null)}
          />
        )}
      </div>
    </div>
  )
}

// Create Problem Modal Component
function CreateProblemModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (data: any) => void
}) {
  const [formData, setFormData] = useState({
    title: '',
    problem_statement: '',
    code: '',
    intuition: '',
    difficulty: 5,
    tags: '',
    platform: '',
    problem_url: '',
    time_complexity: '',
    space_complexity: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    
    onCreate({
      ...formData,
      tags: tagsArray,
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <h2 className="text-2xl font-bold">Add New Problem</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Problem Title *
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty (1-10) *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.difficulty}
                onChange={(e) => setFormData({...formData, difficulty: parseInt(e.target.value)})}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Problem Statement *
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              value={formData.problem_statement}
              onChange={(e) => setFormData({...formData, problem_statement: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Solution Code *
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              rows={8}
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intuition & Approach
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Explain your thought process and approach..."
              value={formData.intuition}
              onChange={(e) => setFormData({...formData, intuition: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform
              </label>
              <input
                type="text"
                placeholder="e.g., LeetCode, HackerRank"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.platform}
                onChange={(e) => setFormData({...formData, platform: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Problem URL
              </label>
              <input
                type="url"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.problem_url}
                onChange={(e) => setFormData({...formData, problem_url: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Complexity
              </label>
              <input
                type="text"
                placeholder="e.g., O(n log n)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.time_complexity}
                onChange={(e) => setFormData({...formData, time_complexity: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Space Complexity
              </label>
              <input
                type="text"
                placeholder="e.g., O(1)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.space_complexity}
                onChange={(e) => setFormData({...formData, space_complexity: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g., array, sorting, greedy"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Add Problem
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Problem View Modal Component
function ProblemViewModal({
  problem,
  onClose,
}: {
  problem: Problem
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{problem.title}</h2>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  problem.difficulty <= 3 ? 'text-green-600 bg-green-100' :
                  problem.difficulty <= 6 ? 'text-yellow-600 bg-yellow-100' :
                  problem.difficulty <= 8 ? 'text-orange-600 bg-orange-100' :
                  'text-red-600 bg-red-100'
                }`}>
                  Difficulty: {problem.difficulty}/10
                </span>
                {problem.platform && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                    {problem.platform}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Problem Statement</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="whitespace-pre-wrap">{problem.problem_statement}</p>
            </div>
          </div>

          {problem.intuition && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Intuition & Approach</h3>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="whitespace-pre-wrap">{problem.intuition}</p>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-3">Solution Code</h3>
            <div className="p-4 bg-gray-900 text-gray-100 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{problem.code}</pre>
            </div>
          </div>

          {(problem.time_complexity || problem.space_complexity) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {problem.time_complexity && (
                <div>
                  <h4 className="font-semibold mb-2">Time Complexity</h4>
                  <p className="text-gray-600">{problem.time_complexity}</p>
                </div>
              )}
              {problem.space_complexity && (
                <div>
                  <h4 className="font-semibold mb-2">Space Complexity</h4>
                  <p className="text-gray-600">{problem.space_complexity}</p>
                </div>
              )}
            </div>
          )}

          {problem.tags && problem.tags.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {problem.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {problem.problem_url && (
            <div>
              <h4 className="font-semibold mb-2">Original Problem</h4>
              <a
                href={problem.problem_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View on {problem.platform || 'Platform'}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
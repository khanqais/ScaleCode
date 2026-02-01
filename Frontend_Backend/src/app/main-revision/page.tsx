'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import type { ProblemWithScore } from '@/utils/revisionAlgorithm'
import Navbar from '@/components/navbar'
import { useSession } from 'next-auth/react'

interface GroupedProblems {
  urgent: ProblemWithScore[]
  high: ProblemWithScore[]
  medium: ProblemWithScore[]
  low: ProblemWithScore[]
}

interface RevisionStats {
  total: number
  urgent: number
  high: number
  medium: number
  low: number
  avgConfidence: number
  avgDaysSinceRevision: number
  needsImmediateRevision: number
}

interface RevisionData {
  problems: ProblemWithScore[]
  grouped: GroupedProblems
  stats: RevisionStats
  mode: string
  total: number
}

const RevisionPage = () => {
  const { data: session } = useSession()
  const user = session?.user
  const [loading, setLoading] = useState(false)
  const [revisionData, setRevisionData] = useState<RevisionData | null>(null)
  const [selectedMode, setSelectedMode] = useState<'priority' | 'urgent' | 'all' | 'needsRevision'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedGroup, setExpandedGroup] = useState<string>('urgent')
  const router = useRouter()

  const fetchRevisionProblems = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/problems/revision', {
        params: {
          mode: selectedMode,
          category: selectedCategory,
          limit: 50
        }
      })
      
      if (response.data.success) {
        setRevisionData(response.data.data)
      }
    } catch {
      
    } finally {
      setLoading(false)
    }
  }, [selectedMode, selectedCategory])

  useEffect(() => {
    fetchRevisionProblems()
  }, [fetchRevisionProblems])

  const getConfidenceColor = (confidence: number) => {
    if (confidence < 4) return 'text-red-500'
    if (confidence < 6) return 'text-orange-500'
    if (confidence < 8) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getConfidenceBg = () => {
    return 'bg-white dark:bg-gray-900'
  }

  const formatDays = (days: number) => {
    if (days === 0) return 'Today'
    if (days === 1) return '1 day ago'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return `${Math.floor(days / 30)} months ago`
  }

  const handleProblemClick = (problemId: string) => {
    router.push(`/revision/${problemId}`)
  }

  const renderProblemCard = (problem: ProblemWithScore) => (
    <div
      key={problem._id}
      onClick={() => handleProblemClick(problem._id)}
      className={`relative p-4 sm:p-5 rounded-xl border cursor-pointer transition-all ${getConfidenceBg()} border-gray-200 dark:border-gray-700`}
    >
      <GlowingEffect 
        proximity={150} 
        spread={40} 
        blur={15}
        borderWidth={2}
        disabled={false}
      />
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white flex-1 line-clamp-2 transition-colors">{problem.title}</h3>
        <div className={`text-2xl font-bold ${getConfidenceColor(problem.adjustedConfidence)} ml-2`}>
          {problem.adjustedConfidence.toFixed(1)}
        </div>
      </div>
      
      <div className="space-y-2 text-xs sm:text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400 transition-colors">Category:</span>
          <span className="font-medium text-gray-900 dark:text-white transition-colors">{problem.category}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400 transition-colors">Last Revised:</span>
          <span className="font-medium text-gray-900 dark:text-white transition-colors">{formatDays(problem.daysSinceRevision)}</span>
        </div>
        
        {problem.confidenceDecay > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400 transition-colors">Confidence Decay:</span>
            <span className="font-medium text-red-500 dark:text-red-400">-{(problem.confidenceDecay * 100).toFixed(0)}%</span>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400 transition-colors">Original:</span>
          <span className="font-medium text-gray-900 dark:text-white transition-colors">{problem.Confidence}/10</span>
        </div>

        {problem.revisionCount !== undefined && problem.revisionCount > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400 transition-colors">Revisions:</span>
            <span className="font-medium text-gray-900 dark:text-white transition-colors">{problem.revisionCount}</span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors">
          Priority Score: {problem.priorityScore.toFixed(2)}
        </div>
      </div>
    </div>
  )

  const renderGroup = (title: string, problems: ProblemWithScore[], groupKey: string, color: string) => {
    if (!problems || problems.length === 0) return null

    const isExpanded = expandedGroup === groupKey

    return (
      <div className="mb-6">
        <button
          onClick={() => setExpandedGroup(isExpanded ? '' : groupKey)}
          className="w-full flex items-center justify-between p-4 sm:p-5 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-3 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${color}`}></div>
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white transition-colors">{title}</h2>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 transition-colors">({problems.length})</span>
          </div>
          <svg
            className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {problems.map(problem => renderProblemCard(problem))}
          </div>
        )}
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-transparent transition-colors">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh] text-center px-4 py-8">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
              Please sign in to access revisions
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 transition-colors">
              You need to be signed in to view your revision dashboard.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent transition-colors">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">
            Smart Revision System
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 transition-colors">
            Problems prioritized by confidence decay and last revision time
          </p>
        </div>

        
        {revisionData && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 transition-colors">Urgent</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600 dark:text-red-400 transition-colors">{revisionData.stats.urgent}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Confidence &lt; 4</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 transition-colors">High Priority</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600 dark:text-orange-400 transition-colors">{revisionData.stats.high}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Confidence 4-6</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 transition-colors">Medium Priority</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600 dark:text-yellow-400 transition-colors">{revisionData.stats.medium}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Confidence 6-8</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 transition-colors">Low Priority</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400 transition-colors">{revisionData.stats.low}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Confidence &gt; 8</p>
                </div>
              </div>
            </div>
          </div>
        )}

        
        <div className="mb-6 p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2 transition-colors">Revision Mode</label>
              <div className="flex flex-wrap gap-2">
                {(['priority', 'urgent', 'needsRevision', 'all'] as const).map((mode) => (
                  <Button
                    key={mode}
                    onClick={() => setSelectedMode(mode)}
                    variant={selectedMode === mode ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs sm:text-sm"
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2 transition-colors">Filter by Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-white transition-colors"
                >
                  <option value="all">All Categories</option>
                  <option value="Arrays">Arrays</option>
                  <option value="Dynamic Programming">Dynamic Programming</option>
                  <option value="Graph">Graph</option>
                  <option value="Binary Tree">Binary Tree</option>
                  <option value="Linked List">Linked List</option>
                  <option value="Strings">Strings</option>
                  <option value="Stack">Stack</option>
                  <option value="Queue">Queue</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button onClick={fetchRevisionProblems} disabled={loading} className="w-full sm:w-auto">
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        
        {loading ? (
          <div className="text-center py-12 sm:py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400 transition-colors">Loading revision problems...</p>
          </div>
        ) : revisionData && revisionData.grouped ? (
          <div>
            {renderGroup('🚨 Urgent - Need Immediate Attention', revisionData.grouped.urgent, 'urgent', 'bg-red-500')}
            {renderGroup('⚠️ High Priority', revisionData.grouped.high, 'high', 'bg-orange-500')}
            {renderGroup('📋 Medium Priority', revisionData.grouped.medium, 'medium', 'bg-yellow-500')}
            {renderGroup('✅ Low Priority', revisionData.grouped.low, 'low', 'bg-green-500')}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-20">
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-4 transition-colors">No problems found for revision</p>
            <Button onClick={() => router.push('/add-problem')} className="mt-4">
              Add Your First Problem
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default RevisionPage

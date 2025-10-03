'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import type { ProblemWithScore } from '@/utils/revisionAlgorithm'
import Link from 'next/link'

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
    } catch (error) {
      console.error('Error fetching revision problems:', error)
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

  const getConfidenceBg = (confidence: number) => {
    if (confidence < 4) return 'bg-red-100 dark:bg-red-900/20'
    if (confidence < 6) return 'bg-orange-100 dark:bg-orange-900/20'
    if (confidence < 8) return 'bg-yellow-100 dark:bg-yellow-900/20'
    return 'bg-green-100 dark:bg-green-900/20'
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
      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${getConfidenceBg(problem.adjustedConfidence)} border-gray-200 dark:border-gray-700`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg flex-1">{problem.title}</h3>
        <div className={`text-2xl font-bold ${getConfidenceColor(problem.adjustedConfidence)}`}>
          {problem.adjustedConfidence.toFixed(1)}
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Category:</span>
          <span className="font-medium">{problem.category}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Last Revised:</span>
          <span className="font-medium">{formatDays(problem.daysSinceRevision)}</span>
        </div>
        
        {problem.confidenceDecay > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Confidence Decay:</span>
            <span className="font-medium text-red-500">-{(problem.confidenceDecay * 100).toFixed(0)}%</span>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Original:</span>
          <span className="font-medium">{problem.Confidence}/10</span>
        </div>

        {problem.revisionCount !== undefined && problem.revisionCount > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Revisions:</span>
            <span className="font-medium">{problem.revisionCount}</span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
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
          className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${color}`}></div>
            <h2 className="text-xl font-bold">{title}</h2>
            <span className="text-sm text-gray-500">({problems.length})</span>
          </div>
          <svg
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {problems.map(problem => renderProblemCard(problem))}
          </div>
        )}
      </div>
    )
  }

  return (
    
    <div className="min-h-screen bg-white dark:bg-gray-900">
     
      <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                AlgoGrid
              </Link>
              <div className="hidden md:flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-sm">Revision Dashboard</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/problems">
                <Button variant="ghost" size="sm">
                  All Problems
                </Button>
              </Link>
              <Link href="/add-problem">
                <Button variant="default" size="sm">
                  + Add Problem
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Smart Revision System</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Problems prioritized by confidence decay and last revision time
          </p>
        </div>

        
        {revisionData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-6 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg shadow-lg">
              <div className="text-3xl font-bold">{revisionData.stats.urgent}</div>
              <div className="text-sm opacity-90">Urgent (Confidence &lt; 4)</div>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-lg">
              <div className="text-3xl font-bold">{revisionData.stats.high}</div>
              <div className="text-sm opacity-90">High Priority (4-6)</div>
            </div>
            
            {/* <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg">
              <div className="text-3xl font-bold">{revisionData.stats.avgConfidence}</div>
              <div className="text-sm opacity-90">Avg Confidence</div>
            </div> */}
            
            {/* <div className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg">
              <div className="text-3xl font-bold">{revisionData.stats.avgDaysSinceRevision}</div>
              <div className="text-sm opacity-90">Avg Days Since Revision</div>
            </div> */}
          </div>
        )}

        
        <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Revision Mode</label>
              <div className="flex gap-2">
                {(['priority', 'urgent', 'needsRevision', 'all'] as const).map((mode) => (
                  <Button
                    key={mode}
                    onClick={() => setSelectedMode(mode)}
                    variant={selectedMode === mode ? 'default' : 'outline'}
                    size="sm"
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Filter by Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
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
              <Button onClick={fetchRevisionProblems} disabled={loading}>
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </div>

        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading revision problems...</p>
          </div>
        ) : revisionData && revisionData.grouped ? (
          <div>
            {renderGroup('🚨 Urgent - Need Immediate Attention', revisionData.grouped.urgent, 'urgent', 'bg-red-500')}
            {renderGroup('⚠️ High Priority', revisionData.grouped.high, 'high', 'bg-orange-500')}
            {renderGroup('📋 Medium Priority', revisionData.grouped.medium, 'medium', 'bg-yellow-500')}
            {renderGroup('✅ Low Priority', revisionData.grouped.low, 'low', 'bg-green-500')}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-400">No problems found for revision</p>
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

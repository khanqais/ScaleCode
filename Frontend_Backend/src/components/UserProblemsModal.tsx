'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { X, ChevronDown, ChevronUp, Code } from 'lucide-react'

interface Solution {
  code: string
  language: string
  intuition: string
  approach: string
  timeComplexity: string
  spaceComplexity: string
}

interface Problem {
  id: string
  title: string
  problemStatement: string
  solutions: Solution[]
  category: string
  createdAt: string
}

interface UserProblemsModalProps {
  userId: string
  userName: string
  isOpen: boolean
  onClose: () => void
}

export default function UserProblemsModal({
  userId,
  userName,
  isOpen,
  onClose,
}: UserProblemsModalProps) {
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedProblem, setExpandedProblem] = useState<string | null>(null)
  const [expandedSolution, setExpandedSolution] = useState<{
    problemId: string
    solutionIndex: number
  } | null>(null)

  const fetchUserProblems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/admin/users/${userId}`)
      const data = await response.json()

      if (data.success) {
        setProblems(data.data.problems)
      } else {
        setError(data.error || 'Failed to fetch problems')
      }
    } catch {
      setError('Failed to fetch user problems')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserProblems()
    }
  }, [isOpen, userId, fetchUserProblems])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {userName}&apos;s Problems
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {problems.length} problem{problems.length !== 1 ? 's' : ''} created
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          ) : problems.length === 0 ? (
            <div className="text-center py-12">
              <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No problems created yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {problems.map((problem) => (
                <div
                  key={problem.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  {/* Problem Header */}
                  <button
                    onClick={() =>
                      setExpandedProblem(
                        expandedProblem === problem.id ? null : problem.id
                      )
                    }
                    className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {problem.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                          {problem.category}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(problem.createdAt)}
                        </span>
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                          {problem.solutions.length} solution
                          {problem.solutions.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    {expandedProblem === problem.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {/* Problem Details */}
                  {expandedProblem === problem.id && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
                      {/* Problem Statement */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Problem Statement
                        </h4>
                        <div className="bg-white dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700">
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                            {problem.problemStatement}
                          </p>
                        </div>
                      </div>

                      {/* Solutions */}
                      {problem.solutions.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                            Solutions
                          </h4>
                          <div className="space-y-3">
                            {problem.solutions.map((solution, index) => (
                              <div
                                key={index}
                                className="border border-gray-200 dark:border-gray-700 rounded overflow-hidden"
                              >
                                <button
                                  onClick={() =>
                                    setExpandedSolution(
                                      expandedSolution?.problemId === problem.id &&
                                        expandedSolution?.solutionIndex === index
                                        ? null
                                        : { problemId: problem.id, solutionIndex: index }
                                    )
                                  }
                                  className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors bg-gray-50 dark:bg-gray-800"
                                >
                                  <div className="flex items-center gap-2">
                                    <Code className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      Solution {index + 1} - {solution.language}
                                    </span>
                                  </div>
                                  {expandedSolution?.problemId === problem.id &&
                                    expandedSolution?.solutionIndex === index ? (
                                    <ChevronUp className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                  )}
                                </button>

                                {expandedSolution?.problemId === problem.id &&
                                  expandedSolution?.solutionIndex === index && (
                                    <div className="px-3 py-3 space-y-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                                      {/* Code */}
                                      <div>
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                          Code
                                        </p>
                                        <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                                          <code>{solution.code}</code>
                                        </pre>
                                      </div>

                                      {/* Approach */}
                                      {solution.approach && (
                                        <div>
                                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            Approach
                                          </p>
                                          <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {solution.approach}
                                          </p>
                                        </div>
                                      )}

                                      {/* Intuition */}
                                      {solution.intuition && (
                                        <div>
                                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            Intuition
                                          </p>
                                          <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {solution.intuition}
                                          </p>
                                        </div>
                                      )}

                                      {/* Complexity */}
                                      <div className="grid grid-cols-2 gap-3">
                                        {solution.timeComplexity && (
                                          <div>
                                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                              Time Complexity
                                            </p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                              {solution.timeComplexity}
                                            </p>
                                          </div>
                                        )}
                                        {solution.spaceComplexity && (
                                          <div>
                                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                              Space Complexity
                                            </p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                              {solution.spaceComplexity}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

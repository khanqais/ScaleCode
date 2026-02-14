'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import UserProblemsModal from '@/components/UserProblemsModal'
import { BarChart3, Users, FileCode, TrendingUp } from 'lucide-react'

interface UserStat {
  userId: string
  email: string
  name: string
  totalProblems: number
  categories: number
  averageConfidence: number
  lastProblemDate: string | null
  categoryBreakdown: Record<string, number>
}

interface AdminStats {
  totalUsers: number
  totalProblems: number
  users: UserStat[]
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const user = session?.user
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (user) {
      fetchAdminStats()
    }
  }, [user, router])

  const fetchAdminStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin')
      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      } else {
        setError(data.error || 'Failed to fetch stats')
      }
    } catch {
      setError('Failed to fetch admin statistics')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-transparent transition-colors">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh] pt-32">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Please sign in
            </h2>
          </div>
        </div>
      </div>
    )
  }

  if (error === 'Forbidden') {
    return (
      <div className="min-h-screen bg-transparent transition-colors">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh] pt-32">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You don&apos;t have admin access to this page.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent transition-colors">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh] pt-32">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-transparent transition-colors">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pt-32">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
            <h2 className="text-lg font-bold text-red-900 dark:text-red-100 mb-2">Error</h2>
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent transition-colors">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pt-32">
        {}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 transition-colors">
            Overview of all users and their DSA problems
          </p>
        </div>

        {}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 transition-colors">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">
                    {stats.totalUsers}
                  </p>
                </div>
                <Users className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 transition-colors">
                    Total Problems
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">
                    {stats.totalProblems}
                  </p>
                </div>
                <FileCode className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 transition-colors">
                    Avg Problems/User
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">
                    {stats.totalUsers > 0 ? (stats.totalProblems / stats.totalUsers).toFixed(1) : 0}
                  </p>
                </div>
                <BarChart3 className="w-12 h-12 text-purple-500 opacity-20" />
              </div>
            </div>
          </div>
        )}

        {}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              User Statistics
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white transition-colors">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white transition-colors">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white transition-colors">
                    Total Problems
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white transition-colors">
                    Categories
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white transition-colors">
                    Avg Confidence
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white transition-colors">
                    Last Problem
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats?.users.map((user) => (
                  <tr
                    key={user.userId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedUser({ id: user.userId, name: user.name })
                      setIsModalOpen(true)
                    }}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white transition-colors">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white transition-colors">
                      {user.totalProblems}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                      {user.categories}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.averageConfidence >= 7 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        user.averageConfidence >= 4 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {user.averageConfidence}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                      {formatDate(user.lastProblemDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {}
      {selectedUser && (
        <UserProblemsModal
          userId={selectedUser.id}
          userName={selectedUser.name}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedUser(null)
          }}
        />
      )}
    </div>
  )
}

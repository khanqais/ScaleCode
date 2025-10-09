'use client'

import { Crown, Zap, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface PlanUsageCardProps {
  currentCount: number
  limit: number
  plan: string
}

export default function PlanUsageCard({ currentCount, limit, plan }: PlanUsageCardProps) {
  const percentage = (currentCount / limit) * 100
  const remaining = limit - currentCount
  const isNearLimit = percentage >= 80
  const isAtLimit = percentage >= 100

  const planConfig = {
    free: {
      name: 'Free',
      icon: Sparkles,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      borderColor: 'border-gray-300 dark:border-gray-700',
      progressColor: 'bg-gray-500'
    },
    pro: {
      name: 'Pro',
      icon: Zap,
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      borderColor: 'border-teal-300 dark:border-teal-700',
      progressColor: 'bg-teal-500'
    },
    pro_max: {
      name: 'Advanced',
      icon: Crown,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-300 dark:border-purple-700',
      progressColor: 'bg-purple-500'
    }
  }

  const config = planConfig[plan as keyof typeof planConfig] || planConfig.free
  const Icon = config.icon

  return (
    <div className={`rounded-xl border-2 ${config.borderColor} ${config.bgColor} p-6 shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${config.color}`} />
          <h3 className={`font-bold text-lg ${config.color}`}>
            {config.name} Plan
          </h3>
        </div>
        {plan === 'free' && (
          <Link 
            href="/pricing"
            className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:underline"
          >
            Upgrade
          </Link>
        )}
      </div>

      {/* Usage Stats */}
      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Problems Used
          </span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentCount.toLocaleString()}
            <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
              {' '}/ {limit.toLocaleString()}
            </span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-orange-500' : config.progressColor} transition-all duration-500 ease-out`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>

        {/* Remaining */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {remaining > 0 ? (
              <>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {remaining.toLocaleString()}
                </span>
                {' '}problems remaining
              </>
            ) : (
              <span className="font-semibold text-red-600 dark:text-red-400">
                Limit reached
              </span>
            )}
          </span>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {percentage.toFixed(0)}%
          </span>
        </div>

        {/* Warning Message */}
        {isNearLimit && !isAtLimit && (
          <div className="mt-4 p-3 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded-lg">
            <p className="text-sm text-orange-800 dark:text-orange-200">
              ⚠️ You&apos;re running low on problems. Consider upgrading your plan!
            </p>
          </div>
        )}

        {isAtLimit && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200 mb-2">
              🚫 You&apos;ve reached your problem limit.
            </p>
            {plan === 'free' && (
              <Link 
                href="/pricing"
                className="inline-block text-sm font-semibold text-red-600 dark:text-red-400 hover:underline"
              >
                Upgrade to add more problems →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

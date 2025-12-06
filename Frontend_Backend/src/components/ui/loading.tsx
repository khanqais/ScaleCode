import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export const LoadingSpinner = ({ size = 'md', className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  return (
    <div className={cn('inline-block', className)}>
      <svg
        className={cn('animate-spin text-current', sizeClasses[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )
}

interface LoadingProps {
  text?: string
  fullScreen?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const Loading = ({ text = 'Loading...', fullScreen = false, size = 'lg' }: LoadingProps) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size={size} className="text-blue-600 dark:text-blue-400" />
          <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">{text}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <LoadingSpinner size={size} className="text-blue-600 dark:text-blue-400" />
      {text && <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">{text}</p>}
    </div>
  )
}

export const LoadingSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn('animate-pulse bg-gray-200 dark:bg-gray-700 rounded', className)} />
  )
}

interface CardSkeletonProps {
  count?: number
}

export const CardSkeleton = ({ count = 3 }: CardSkeletonProps) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="space-y-3">
            <LoadingSkeleton className="h-6 w-3/4" />
            <LoadingSkeleton className="h-4 w-full" />
            <LoadingSkeleton className="h-4 w-5/6" />
            <div className="flex gap-2 pt-2">
              <LoadingSkeleton className="h-8 w-20" />
              <LoadingSkeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Loading

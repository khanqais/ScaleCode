'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, Home, RefreshCw, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ErrorPage({
  error,
  reset,
}: {
  error?: Error & { digest?: string }
  reset?: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log error to error reporting service
    if (error) {
      console.error('Error boundary caught:', error)
    }
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Oops! Something went wrong
        </h1>
        
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8">
          We encountered an unexpected error. Don't worry, our team has been notified and we're working on it.
        </p>

        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg text-left">
            <p className="text-sm font-mono text-red-800 dark:text-red-300 break-all">
              {error.message || 'Unknown error'}
            </p>
            {error.digest && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          {reset && (
            <Button
              onClick={reset}
              className="w-full sm:w-auto bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          
          <Link href="/organize" className="w-full sm:w-auto">
            <Button
              variant="ghost"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>

        {/* Support Link */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help?{' '}
            <Link 
              href="mailto:support@algogrid.com" 
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
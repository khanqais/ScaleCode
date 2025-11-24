'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Global error caught:', error)
  }, [error])

  return (
    <html>
      <body>
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
              Application Error
            </h1>
            
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8">
              Something went wrong with the application. Please try refreshing the page.
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
              <Button
                onClick={reset}
                className="w-full sm:w-auto bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Link href="/" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
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
      </body>
    </html>
  )
}

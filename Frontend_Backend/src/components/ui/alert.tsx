'use client'

import React from 'react'
import { AlertCircle, XCircle, CheckCircle, Info, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export type AlertVariant = 'error' | 'success' | 'warning' | 'info'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  message: string
  onClose?: () => void
  className?: string
}

const variantConfig = {
  error: {
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-800 dark:text-red-300',
    iconColor: 'text-red-600 dark:text-red-400',
    Icon: XCircle,
  },
  success: {
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    textColor: 'text-green-800 dark:text-green-300',
    iconColor: 'text-green-600 dark:text-green-400',
    Icon: CheckCircle,
  },
  warning: {
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    textColor: 'text-yellow-800 dark:text-yellow-300',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    Icon: AlertCircle,
  },
  info: {
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-800 dark:text-blue-300',
    iconColor: 'text-blue-600 dark:text-blue-400',
    Icon: Info,
  },
}

export const Alert = ({ 
  variant = 'info', 
  title, 
  message, 
  onClose, 
  className 
}: AlertProps) => {
  const { Icon, ...config } = variantConfig[variant]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'rounded-lg border p-4',
        config.bgColor,
        config.borderColor,
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconColor)} aria-hidden="true" />
        
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={cn('font-semibold mb-1', config.textColor)}>
              {title}
            </h3>
          )}
          <p className={cn('text-sm', config.textColor)}>
            {message}
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className={cn(
              'p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors',
              config.textColor
            )}
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </motion.div>
  )
}

interface ToastProps extends AlertProps {
  isVisible: boolean
  duration?: number
}

export const Toast = ({ 
  isVisible, 
  duration = 5000, 
  onClose, 
  ...alertProps 
}: ToastProps) => {
  React.useEffect(() => {
    if (isVisible && duration > 0 && onClose) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed top-4 right-4 z-50 max-w-md"
        >
          <Alert {...alertProps} onClose={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface ErrorBoundaryFallbackProps {
  error: Error
  resetErrorBoundary?: () => void
}

export const ErrorBoundaryFallback = ({ 
  error, 
  resetErrorBoundary 
}: ErrorBoundaryFallbackProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full">
        <Alert
          variant="error"
          title="Something went wrong"
          message={error.message || 'An unexpected error occurred'}
        />
        {resetErrorBoundary && (
          <button
            onClick={resetErrorBoundary}
            className="mt-4 w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  )
}

export default Alert

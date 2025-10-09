'use client'

import { Sparkles, Zap, Crown, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function PricingBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border border-blue-200 dark:border-gray-600 rounded-xl p-6 mb-8">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Choose Your Plan
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Start with our free plan or upgrade for more problems and features
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        {/* Free Plan */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="font-semibold text-gray-900 dark:text-white">Free</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">100</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">problems</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">$0</div>
          <div className="text-xs text-gray-500 dark:text-gray-500">forever</div>
        </div>
        
        {/* Pro Plan */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-2 border-teal-300 dark:border-teal-600 relative">
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <span className="bg-teal-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Popular
            </span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span className="font-semibold text-gray-900 dark:text-white">Pro</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">2,000</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">problems</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">$9.99</div>
          <div className="text-xs text-gray-500 dark:text-gray-500">per month</div>
        </div>
        
        {/* Advanced Plan */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="font-semibold text-gray-900 dark:text-white">Advanced</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">4,000</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">problems</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">$19.99</div>
          <div className="text-xs text-gray-500 dark:text-gray-500">per month</div>
        </div>
      </div>
      
      <div className="text-center mt-6">
        <Link 
          href="/pricing"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          View Full Pricing
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
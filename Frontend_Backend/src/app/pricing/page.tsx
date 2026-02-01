'use client'

import Navbar from '@/components/navbar'
import React from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Check, Sparkles, Zap, Crown } from 'lucide-react'
import Link from 'next/link'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    icon: Sparkles,
    features: [
      'Up to 50 problems',
      'Basic revision algorithm',
      'Light/Dark mode',
      'Problem categorization',
      'Basic analytics'
    ],
    highlighted: false,
    buttonText: 'Get Started',
    buttonVariant: 'outline' as const
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    description: 'For serious problem solvers',
    icon: Zap,
    features: [
      'Unlimited problems',
      'Advanced revision algorithm',
      'AI-powered hints (50/month)',
      'Priority support',
      'Export problems',
      'Advanced analytics',
      'Custom tags & categories'
    ],
    highlighted: true,
    buttonText: 'Upgrade to Pro',
    buttonVariant: 'primary' as const
  },
  {
    name: 'Pro Max',
    price: '$19',
    period: '/month',
    description: 'For power users & teams',
    icon: Crown,
    features: [
      'Everything in Pro',
      'Unlimited AI hints',
      'API access',
      'Team collaboration',
      'Custom integrations',
      'Dedicated support',
      'Early access features'
    ],
    highlighted: false,
    buttonText: 'Go Pro Max',
    buttonVariant: 'outline' as const
  }
]

const PricingPage = () => {
  const { status } = useSession()

  return (
    <div className="min-h-screen bg-transparent pb-20">
      <Navbar/>
      <main className="container mx-auto px-4 py-3 md:py-16 max-w-7xl">
        
        <div className="text-center mb-12 md:mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-black dark:text-white"
          >
            Choose Your Plan
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4"
          >
            Select the perfect plan for your coding journey. Upgrade or downgrade at any time.
          </motion.p>
        </div>
        
        {}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className={`relative rounded-2xl p-6 md:p-8 border ${
                plan.highlighted 
                  ? 'border-teal-500 bg-gradient-to-b from-teal-50 to-white dark:from-teal-950/30 dark:to-gray-900 shadow-xl shadow-teal-500/10' 
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-teal-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <plan.icon className={`w-10 h-10 mx-auto mb-4 ${plan.highlighted ? 'text-teal-500' : 'text-gray-400 dark:text-gray-500'}`} />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{plan.description}</p>
              </div>
              
              <div className="text-center mb-6">
                <span className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                <span className="text-gray-500 dark:text-gray-400">{plan.period}</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-teal-500' : 'text-gray-400'}`} />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {status === 'authenticated' ? (
                <button
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    plan.buttonVariant === 'primary'
                      ? 'bg-teal-600 hover:bg-teal-700 text-white'
                      : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {plan.buttonText}
                </button>
              ) : (
                <Link
                  href="/login"
                  className={`block w-full py-3 px-4 rounded-lg font-medium text-center transition-colors ${
                    plan.buttonVariant === 'primary'
                      ? 'bg-teal-600 hover:bg-teal-700 text-white'
                      : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Sign in to Subscribe
                </Link>
              )}
            </motion.div>
          ))}
        </div>
        
        {}
        <div className="mt-12 md:mt-16 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            All plans include secure payment processing through Stripe
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs md:text-sm text-gray-600 dark:text-gray-500">
            <span>✓ Cancel anytime</span>
            <span>✓ Instant access</span>
            <span>✓ Secure checkout</span>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PricingPage

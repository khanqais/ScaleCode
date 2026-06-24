import React from 'react'
import Navbar from '@/components/navbar'
import Hero from '@/components/hero'
import dynamic from 'next/dynamic'

// Lightweight skeleton for below-fold content — prevents Speed Index regression
const FeaturesLoadingSkeleton = () => (
  <section className="py-16 px-6 max-w-7xl mx-auto">
    <div className="text-center mb-16">
      <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-64 mx-auto animate-pulse" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white/60 dark:bg-gray-900/60 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="w-14 h-14 bg-gray-200 dark:bg-gray-800 rounded-2xl mb-4 animate-pulse" />
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-3 animate-pulse" />
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full animate-pulse" />
        </div>
      ))}
    </div>
  </section>
)

const Features = dynamic(() => import('@/components/features'), {
  loading: () => <FeaturesLoadingSkeleton />,
})
const CallToAction = dynamic(() => import('@/components/call-to-action'), {
  loading: () => <div className="py-16" />,
})

const page = () => {
  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      <div className="relative z-10">
        <Navbar />
        <div className="pt-4">
          <Hero />
          <Features />
          <CallToAction />
        </div>
      </div>
    </div>
  )
}

export default page




import Navbar from '@/components/navbar'
import { PricingTable } from '@clerk/nextjs'
import React from 'react'

const page = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900 pb-20">
      <Navbar/>
      <main className="container mx-auto px-4 py-3 md:py-16 max-w-7xl">
        
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16">
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-black dark:text-white">
            Choose Your Plan
          </h1>
          {/* <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
            Select the perfect plan for your coding journey. Upgrade or downgrade at any time.
          </p> */}
        </div>
        
        {/* Pricing Table Section */}
        <div className="relative z-0 w-full">
          <PricingTable />
        </div>
        
        {/* Additional Info Section */}
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

export default page

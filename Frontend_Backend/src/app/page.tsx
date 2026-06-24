import React from 'react'
import Navbar from '@/components/navbar'
import Hero from '@/components/hero'
import dynamic from 'next/dynamic'

const Features = dynamic(() => import('@/components/features'))
const CallToAction = dynamic(() => import('@/components/call-to-action'))

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




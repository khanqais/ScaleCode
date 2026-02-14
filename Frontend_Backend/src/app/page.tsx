import React from 'react'
import Navbar from '@/components/navbar'
import Hero from '@/components/hero'
import Features from '@/components/features'
import CallToAction from '@/components/call-to-action'

const page = () => {
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <div className="pt-4">
        <Hero />
        <Features />
        <CallToAction />
      </div>
    </div>
  )
}

export default page




import React from 'react'
import Navbar from '@/components/navbar'
import Hero from '@/components/hero'
import Features from '@/components/features'
import CallToAction from '@/components/call-to-action'
import { SnowfallWrapper } from '@/components/SnowfallWrapper'

const page = () => {
  return (
    <div className="min-h-screen bg-transparent">
      {/* <SnowfallWrapper /> */}
      <Navbar />
      <Hero />
      <Features />
      <CallToAction />
      
    </div>
  )
}

export default page




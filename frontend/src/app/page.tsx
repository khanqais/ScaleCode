import React from 'react'
import Navbar from '@/components/navbar'
import Hero from '@/components/hero'
import Features from '@/components/features'
import CallToAction from '@/components/call-to-action'
import Footer from '@/components/footer'

const page = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <CallToAction />
      <Footer />
    </div>
  )
}

export default page




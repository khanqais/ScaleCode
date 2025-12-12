'use client'

import React, { Suspense, useState } from 'react'
import Navbar from '@/components/navbar'
import { DemoProblemsShowcase } from '@/components/DemoProblemsShowcase'
import { useRouter } from 'next/navigation'
import { type DemoProblem } from '@/lib/sampleProblems'

function DemoProblemsPageContent() {
  const router = useRouter()

  const handleSelectProblem = (problem: DemoProblem) => {
    router.push(`/demo/problems/preview?id=${problem._id}`)
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <DemoProblemsShowcase onSelectProblem={handleSelectProblem} />
      </div>
    </div>
  )
}

export default function DemoProblemsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading problems...</p>
        </div>
      </div>
    }>
      <DemoProblemsPageContent />
    </Suspense>
  )
}

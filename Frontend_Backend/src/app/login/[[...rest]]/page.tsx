'use client'

import React from 'react'
import StyledLoginForm from '@/components/StyledLoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col justify-center">
        <div className="text-center mb-4">
          <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif' }} className="text-3xl md:text-4xl font-normal text-white leading-tight italic">
            Sign in to unlock the full potential of AlgoGrid
          </h1>
        </div>

        <StyledLoginForm />
      </div>
    </div>
  )
}
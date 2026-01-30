'use client'

import React, { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import StyledLoginForm from '@/components/StyledLoginForm'

export default function LoginPage() {
  const router = useRouter()
  const { status } = useSession()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/organize')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (status === 'authenticated') {
    return null
  }

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
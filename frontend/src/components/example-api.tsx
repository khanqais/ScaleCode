'use client'

import React from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { makeAuthenticatedCall } from '@/utils/api'

const ExampleApiComponent = () => {
  const { getToken } = useAuth()
  const { user } = useUser()

  const handleApiCall = async () => {
    try {
      const response = await makeAuthenticatedCall(getToken, '/api/problems')
      console.log('API Response:', response)
    } catch (error) {
      console.error('API Error:', error)
    }
  }

  if (!user) {
    return <div>Please sign in to view this content.</div>
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Welcome, {user.firstName}!</h2>
      <button 
        onClick={handleApiCall}
        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
      >
        Test API Call
      </button>
    </div>
  )
}

export default ExampleApiComponent
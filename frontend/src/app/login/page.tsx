'use client'

import React from 'react'
import { SignIn, SignUp } from '@clerk/nextjs'
import { useState } from 'react'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="relative h-12 bg-gray-100">
            <div className="flex h-full">
              <button
                onClick={() => {
                  setIsLogin(true)
                }}
                className={`flex-1 text-sm font-medium transition-colors ${
                  isLogin ? 'text-teal-600' : 'text-gray-500'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setIsLogin(false)
                }}
                className={`flex-1 text-sm font-medium transition-colors ${
                  !isLogin ? 'text-teal-600' : 'text-gray-500'
                }`}
              >
                Sign up
              </button>
            </div>
            <div
              className={`absolute bottom-0 h-0.5 bg-teal-600 transition-transform duration-300 ease-out ${
                isLogin ? 'translate-x-0' : 'translate-x-full'
              }`}
              style={{ width: '50%' }}
            />
          </div>

          <div className="p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-black rounded-xl mb-4">
                <span className="text-white font-mono text-lg">{'</>'}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h1>
              <p className="text-gray-600 mt-2">
                {isLogin 
                  ? 'Enter your credentials to access your account' 
                  : 'Join ScaleCode and organize your coding solutions'
                }
              </p>
            </div>

            <div className="flex justify-center">
              {isLogin ? (
                <SignIn 
                  appearance={{
                    elements: {
                      formButtonPrimary: 
                        "bg-black hover:bg-gray-800 text-sm normal-case",
                      card: "shadow-none border-0",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsBlockButton: 
                        "border border-gray-300 hover:bg-gray-50",
                      formFieldInput: 
                        "border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500",
                      footerActionLink: "text-teal-600 hover:text-teal-700"
                    }
                  }}
                  redirectUrl="/"
                />
              ) : (
                <SignUp 
                  appearance={{
                    elements: {
                      formButtonPrimary: 
                        "bg-black hover:bg-gray-800 text-sm normal-case",
                      card: "shadow-none border-0",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsBlockButton: 
                        "border border-gray-300 hover:bg-gray-50",
                      formFieldInput: 
                        "border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500",
                      footerActionLink: "text-teal-600 hover:text-teal-700"
                    }
                  }}
                  redirectUrl="/"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
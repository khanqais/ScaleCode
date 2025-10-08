'use client'

import React from 'react'
import { SignIn, SignUp } from '@clerk/nextjs'
import { useState, useEffect } from 'react'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isDark, setIsDark] = useState(() => {
    // Initialize with correct theme state
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark')
    }
    return false
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const checkDarkMode = () => {
      const isDarkMode = document.documentElement.classList.contains('dark')
      setIsDark(isDarkMode)
    }
    
    checkDarkMode()
    
    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    return () => observer.disconnect()
  }, [])

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <>
      <style jsx global>{`
        /* Social buttons styling */
        .cl-socialButtonsBlockButton,
        .cl-socialButtonsBlockButton *,
        .cl-socialButtonsBlockButton span,
        .cl-socialButtonsBlockButtonText,
        .cl-internal-b3fm6y {
          color: ${isDark ? '#ffffff !important' : '#111827 !important'};
        }
        
        /* Card background - force gray-800 in dark mode */
        .cl-card,
        .cl-rootBox,
        .cl-main,
        .cl-internal-1ta0xnx,
        div[class*="cl-internal"] {
          background-color: ${isDark ? '#1f2937 !important' : '#ffffff !important'};
        }
        
        /* Override all nested divs inside clerk card */
        .cl-card > div,
        .cl-card > div > div,
        .cl-card > div > div > div {
          background-color: ${isDark ? '#1f2937 !important' : '#ffffff !important'};
        }
        
        /* Form inputs */
        .cl-formFieldInput,
        .cl-formFieldInput__identifier,
        .cl-formFieldInput__emailAddress,
        .cl-formFieldInput__password,
        input[name="identifier"],
        input[name="emailAddress"],
        input[name="password"] {
          background-color: ${isDark ? '#111827 !important' : '#ffffff !important'};
          color: ${isDark ? '#ffffff !important' : '#111827 !important'};
          border-color: ${isDark ? '#4b5563 !important' : '#d1d5db !important'};
        }
        
        /* Form labels and text */
        .cl-formFieldLabel,
        .cl-formFieldLabelRow__emailAddress,
        .cl-formFieldLabelRow__password,
        .cl-text,
        label {
          color: ${isDark ? '#e5e7eb !important' : '#111827 !important'};
        }
        
        /* Divider text */
        .cl-dividerText {
          color: ${isDark ? '#9ca3af !important' : '#6b7280 !important'};
        }
        
        /* Footer links */
        .cl-footerActionLink,
        .cl-footerActionText {
          color: ${isDark ? '#5eead4 !important' : '#0d9488 !important'};
        }
        
        /* Input placeholders */
        .cl-formFieldInput::placeholder,
        input::placeholder {
          color: ${isDark ? '#9ca3af !important' : '#6b7280 !important'};
        }
        
        /* Social button backgrounds */
        .cl-socialButtonsBlockButton {
          background-color: ${isDark ? '#374151 !important' : '#ffffff !important'};
          border-color: ${isDark ? '#4b5563 !important' : '#d1d5db !important'};
        }
        
        .cl-socialButtonsBlockButton:hover {
          background-color: ${isDark ? '#4b5563 !important' : '#f9fafb !important'};
        }
      `}</style>
      <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="relative h-12 bg-gray-100 dark:bg-gray-900">
            <div className="flex h-full">
              <button
                onClick={() => {
                  setIsLogin(true)
                }}
                className={`flex-1 text-sm font-medium transition-colors ${
                  isLogin ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setIsLogin(false)
                }}
                className={`flex-1 text-sm font-medium transition-colors ${
                  !isLogin ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Sign up
              </button>
            </div>
            <div
              className={`absolute bottom-0 h-0.5 bg-teal-600 dark:bg-teal-400 transition-transform duration-300 ease-out ${
                isLogin ? 'translate-x-0' : 'translate-x-full'
              }`}
              style={{ width: '50%' }}
            />
          </div>

          <div className="p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-600 rounded-xl mb-4">
                <span className="text-white font-mono text-lg">{'</>'}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {isLogin 
                  ? 'Enter your credentials to access your account' 
                  : 'Join AlgoGrid and organize your coding solutions'
                }
              </p>
            </div>

            <div className="flex justify-center">
              {isLogin ? (
                <SignIn 
                  appearance={{
                    baseTheme: undefined,
                    variables: isDark ? {
                      colorPrimary: '#14b8a6',
                      colorBackground: '#1f2937',
                      colorInputBackground: '#111827',
                      colorInputText: '#ffffff',
                      colorText: '#ffffff',
                      colorTextSecondary: '#9ca3af',
                      colorNeutral: '#ffffff',
                    } : {
                      colorPrimary: '#0d9488',
                      colorBackground: '#ffffff',
                      colorInputBackground: '#ffffff',
                      colorInputText: '#111827',
                      colorText: '#111827',
                      colorTextSecondary: '#4b5563',
                      colorNeutral: '#111827',
                    },
                    elements: isDark ? {
                      formButtonPrimary: 
                        "bg-teal-600 hover:bg-teal-700 text-sm normal-case text-white",
                      card: "shadow-none border-0 !bg-gray-800",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsBlockButton: 
                        "border border-gray-600 hover:bg-gray-700 !bg-gray-700",
                      socialButtonsBlockButtonText: "font-medium",
                      formFieldInput: 
                        "bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 !text-white",
                      formFieldLabel: "text-gray-300",
                      footerActionLink: "text-teal-400 hover:text-teal-300",
                      identityPreviewText: "text-gray-300",
                      formFieldInputShowPasswordButton: "text-gray-400 hover:text-gray-200",
                      dividerLine: "bg-gray-600",
                      dividerText: "text-gray-400",
                      formFieldAction: "text-teal-400 hover:text-teal-300",
                    } : {
                      formButtonPrimary: 
                        "bg-teal-600 hover:bg-teal-700 text-sm normal-case text-white",
                      card: "shadow-none border-0 bg-white",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsBlockButton: 
                        "border border-gray-300 hover:bg-gray-50 !text-gray-900",
                      socialButtonsBlockButtonText: "font-medium !text-gray-900",
                      formFieldInput: 
                        "bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 !text-gray-900",
                      formFieldLabel: "text-gray-900 font-medium",
                      footerActionLink: "text-teal-600 hover:text-teal-700",
                      identityPreviewText: "text-gray-900",
                      formFieldInputShowPasswordButton: "text-gray-700 hover:text-gray-900",
                      dividerLine: "bg-gray-300",
                      dividerText: "text-gray-700",
                      formFieldAction: "text-teal-600 hover:text-teal-700",
                    }
                  }}
                  redirectUrl="/"
                />
              ) : (
                <SignUp 
                  appearance={{
                    baseTheme: undefined,
                    variables: isDark ? {
                      colorPrimary: '#14b8a6',
                      colorBackground: '#1f2937',
                      colorInputBackground: '#111827',
                      colorInputText: '#ffffff',
                      colorText: '#ffffff',
                      colorTextSecondary: '#9ca3af',
                      colorNeutral: '#ffffff',
                    } : {
                      colorPrimary: '#0d9488',
                      colorBackground: '#ffffff',
                      colorInputBackground: '#ffffff',
                      colorInputText: '#111827',
                      colorText: '#111827',
                      colorTextSecondary: '#4b5563',
                      colorNeutral: '#111827',
                    },
                    elements: isDark ? {
                      formButtonPrimary: 
                        "bg-teal-600 hover:bg-teal-700 text-sm normal-case text-white",
                      card: "shadow-none border-0 !bg-gray-800",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsBlockButton: 
                        "border border-gray-600 hover:bg-gray-700 !bg-gray-700",
                      socialButtonsBlockButtonText: "font-medium",
                      formFieldInput: 
                        "bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 !text-white",
                      formFieldLabel: "text-gray-300",
                      footerActionLink: "text-teal-400 hover:text-teal-300",
                      identityPreviewText: "text-gray-300",
                      formFieldInputShowPasswordButton: "text-gray-400 hover:text-gray-200",
                      dividerLine: "bg-gray-600",
                      dividerText: "text-gray-400",
                      formFieldAction: "text-teal-400 hover:text-teal-300",
                    } : {
                      formButtonPrimary: 
                        "bg-teal-600 hover:bg-teal-700 text-sm normal-case text-white",
                      card: "shadow-none border-0 bg-white",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsBlockButton: 
                        "border border-gray-300 hover:bg-gray-50 !text-gray-900",
                      socialButtonsBlockButtonText: "font-medium !text-gray-900",
                      formFieldInput: 
                        "bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 !text-gray-900",
                      formFieldLabel: "text-gray-900 font-medium",
                      footerActionLink: "text-teal-600 hover:text-teal-700",
                      identityPreviewText: "text-gray-900",
                      formFieldInputShowPasswordButton: "text-gray-700 hover:text-gray-900",
                      dividerLine: "bg-gray-300",
                      dividerText: "text-gray-700",
                      formFieldAction: "text-teal-600 hover:text-teal-700",
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
    </>
  )
}
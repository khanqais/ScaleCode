'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import { GlowingEffect } from '@/components/ui/glowing-effect'


const CallToAction = () => {
  const { status } = useSession()
  const isSignedIn = status === 'authenticated'

  return (
    <section
      className="py-16 px-6 max-w-5xl mx-auto animate-in fade-in duration-500"
    >
      <div
        className="bg-gradient-to-r from-black to-gray-800 dark:from-white dark:to-gray-200 rounded-3xl p-8 sm:p-12 text-center text-white dark:text-black relative overflow-hidden transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        <GlowingEffect 
          proximity={200} 
          spread={50} 
          blur={20}
          borderWidth={3}
          disabled={false}
        />
       
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-gray-800/90 dark:from-white/90 dark:to-gray-200/90"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 dark:bg-black/5 rounded-full transform translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 dark:bg-black/5 rounded-full transform -translate-x-12 translate-y-12"></div>
        
        <div className="relative z-10">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white dark:text-black transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100"
          >
            Ready to organize your coding journey?
          </h2>
          
          <p
            className="text-lg sm:text-xl text-gray-200 dark:text-gray-800 mb-8 max-w-3xl mx-auto transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150"
          >
            Join hundreds of developers who are already using AlgoGrid to track their progress,
            organize their solutions, and accelerate their learning.
          </p>
          
          <div
            className="flex flex-col sm:flex-row gap-4 items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200"
          >
            {isSignedIn ? (
              <Link href="/organize">
                <div className="transition-transform duration-200 hover:scale-105 active:scale-95">
                  <Button 
                    size="lg" 
                    className="bg-white dark:bg-black text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-8 py-6 text-lg font-medium rounded-full transition-colors relative overflow-hidden"
                  >
                    <GlowingEffect 
                      proximity={150} 
                      spread={40} 
                      blur={15}
                      borderWidth={2}
                      disabled={false}
                    />
                    <span className="relative z-10">Get Started Free</span>
                  </Button>
                </div>
              </Link>
            ) : (
              <div className="transition-transform duration-200 hover:scale-105 active:scale-95">
                <Link href="/login?callbackUrl=/organize">
                  <Button 
                    size="lg" 
                    className="bg-white dark:bg-black text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-8 py-6 text-lg font-medium rounded-full transition-colors relative overflow-hidden"
                  >
                    <GlowingEffect 
                      proximity={150} 
                      spread={40} 
                      blur={15}
                      borderWidth={2}
                      disabled={false}
                    />
                    <span className="relative z-10">Get Started Free</span>
                  </Button>
                </Link>
              </div>
            )}
            
            <Link href="/problems">
              <div className="transition-transform duration-200 hover:scale-105 active:scale-95">
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="text-white dark:text-black hover:text-gray-200 dark:hover:text-gray-800 hover:bg-white/10 dark:hover:bg-black/10 px-8 py-6 text-lg font-medium border border-white/20 dark:border-black/20 rounded-full transition-colors relative overflow-hidden"
                  aria-label="Browse available problems"
                >
                  <GlowingEffect 
                    proximity={150} 
                    spread={40} 
                    blur={15}
                    borderWidth={2}
                    disabled={false}
                  />
                  <span className="relative z-10">View Problems</span>
                </Button>
              </div>
            </Link>
          </div>
          
          <p
            className="text-sm text-gray-300 dark:text-gray-700 mt-6 transition-colors animate-in fade-in duration-500 delay-300"
          >
            No credit card required • Start organizing today
          </p>
        </div>
      </div>
    </section>
  )
}

export default CallToAction

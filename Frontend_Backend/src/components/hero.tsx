'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { GlowingEffect } from '@/components/ui/glowing-effect'


const Hero = () => {
  return (
    <div 
      className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      {}
      <div 
        className="mb-8 sm:mb-12 transition-transform duration-300 hover:scale-110 hover:rotate-3"
      >
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-black dark:bg-white rounded-3xl flex items-center justify-center shadow-lg relative overflow-hidden">
          <GlowingEffect 
            proximity={100} 
            spread={30} 
            blur={10}
            borderWidth={2}
            disabled={false}
          />
          <span className="text-white dark:text-black text-2xl sm:text-3xl font-bold relative z-10">{'</>'}</span>
        </div>
      </div>

      {}
      <h1 
        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-black dark:text-white mb-6 sm:mb-8 max-w-4xl leading-tight animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100"
      >
        Remember every algorithm, forever
      </h1>

      {}
      <p 
        className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 sm:mb-12 max-w-2xl leading-relaxed px-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200"
      >
        Save and revise your LeetCode, HackerRank, and coding platform solutions. 
        Group them by topics, difficulty, or custom categories. 
        Never lose track of your progress again.
      </p>

      {}
      <div 
        className="flex flex-col sm:flex-row gap-4 items-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300"
      >
        <Link href="/organize">
          <div className="relative transition-transform duration-200 hover:scale-105 active:scale-95">
            <Button 
              size="lg" 
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-8 py-6 text-lg font-medium rounded-full transition-colors shadow-lg hover:shadow-xl relative overflow-hidden"
              aria-label="Start organizing your coding problems"
            >
              <GlowingEffect 
                proximity={150} 
                spread={40} 
                blur={15}
                borderWidth={2}
                disabled={false}
              />
              <span className="relative z-10">Start organizing</span>
            </Button>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default Hero

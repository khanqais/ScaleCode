'use client'

import React from 'react'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { BookOpen, Target, Repeat, BarChart3, Search, CreditCard } from 'lucide-react'

const Features = () => {
  const features = [
    {
      icon: <BookOpen className="w-8 h-8 text-blue-500" />,
      title: 'Problem Management',
      description: 'Save and manage your coding solutions with detailed problem statements, code, and intuition notes.'
    },
    {
      icon: <Target className="w-8 h-8 text-indigo-500" />,
      title: 'Smart Organization',
      description: 'Organize problems by categories and confidence levels with an intuitive dashboard view.'
    },
    {
      icon: <Repeat className="w-8 h-8 text-teal-500" />,
      title: 'Intelligent Revision System',
      description: 'Review problems with our confidence-based spaced repetition algorithm that prioritizes what needs practice.'
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-purple-500" />,
      title: 'Basic Analytics',
      description: 'Track your total problems, categories covered, and confidence distribution across your solutions.'
    },
    {
      icon: <Search className="w-8 h-8 text-pink-500" />,
      title: 'Filter & Search',
      description: 'Filter problems by category and confidence level to quickly find the problems you need.'
    },
    {
      icon: <CreditCard className="w-8 h-8 text-rose-500" />,
      title: 'Flexible Plans',
      description: 'Choose from Free, Pro, or Advanced plans to scale your problem-solving journey as you grow.'
    }
  ]

  return (
    <section
      className="py-16 px-6 max-w-7xl mx-auto animate-in fade-in duration-500"
    >
      <div className="text-center mb-16">
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-black dark:text-white mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          Why choose AlgoGrid?
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="group bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-700 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <GlowingEffect 
              proximity={120} 
              spread={35} 
              blur={12}
              borderWidth={2}
              disabled={false}
            />
            {/* Soft gradient background on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="mb-4 bg-gray-100 dark:bg-gray-800 w-14 h-14 rounded-2xl flex items-center justify-center relative z-10 transition-transform duration-300 group-hover:scale-110">
              {feature.icon}
            </div>
            
            <h3 className="text-xl font-semibold text-black dark:text-white mb-3 relative z-10">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed relative z-10">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Features

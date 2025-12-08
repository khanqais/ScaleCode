'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GlowingEffect } from '@/components/ui/glowing-effect'

const Features = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 12
      }
    }
  }

  const features = [
    {
      icon: '📝',
      title: 'Problem Management',
      description: 'Save and manage your coding solutions with detailed problem statements, code, and intuition notes.'
    },
    {
      icon: '🎯',
      title: 'Smart Organization',
      description: 'Organize problems by categories and confidence levels with an intuitive dashboard view.'
    },
    {
      icon: '📚',
      title: 'Intelligent Revision System',
      description: 'Review problems with our confidence-based spaced repetition algorithm that prioritizes what needs practice.'
    },
    {
      icon: '📊',
      title: 'Basic Analytics',
      description: 'Track your total problems, categories covered, and confidence distribution across your solutions.'
    },
    {
      icon: '🔍',
      title: 'Filter & Search',
      description: 'Filter problems by category and confidence level to quickly find the problems you need.'
    },
    {
      icon: '💼',
      title: 'Flexible Plans',
      description: 'Choose from Free, Pro, or Advanced plans to scale your problem-solving journey as you grow.'
    }
  ]

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
      className="py-16 px-6 max-w-7xl mx-auto"
    >
      <div className="text-center mb-16">
        <motion.h2
          variants={itemVariants}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-black dark:text-white mb-6"
        >
          Why choose AlgoGrid?
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
        >
          Everything you need to organize, track, and improve your coding skills in one place.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            variants={itemVariants}
            className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-lg transition-all relative overflow-hidden"
          >
            <GlowingEffect 
              proximity={120} 
              spread={35} 
              blur={12}
              borderWidth={2}
              disabled={false}
            />
            <div className="text-4xl mb-4 relative z-10">{feature.icon}</div>
            <h3 className="text-xl font-semibold text-black dark:text-white mb-3 relative z-10">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed relative z-10">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

export default Features
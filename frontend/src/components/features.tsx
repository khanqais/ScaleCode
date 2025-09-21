'use client'

import React from 'react'
import { motion } from 'framer-motion'

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
      description: 'Save your coding solutions from various platforms including LeetCode, HackerRank, and CodeForces.'
    },
    {
      icon: '🎯',
      title: 'Smart Organization',
      description: 'Group problems by difficulty, topics, data structures, or create custom categories that work for you.'
    },
    {
      icon: '📊',
      title: 'Progress Tracking',
      description: 'Track your coding journey with detailed analytics and insights about your problem-solving patterns.'
    },
    {
      icon: '🔍',
      title: 'Quick Search',
      description: 'Find any problem quickly with our powerful search and filtering system across all your solutions.'
    },
    {
      icon: '📚',
      title: 'Revision Mode',
      description: 'Review your solutions systematically with our spaced repetition system to reinforce learning.'
    },
    {
      icon: '🚀',
      title: 'Performance Insights',
      description: 'Get insights into your coding patterns, most solved topics, and areas that need improvement.'
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
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-6"
        >
          Why choose ScaleCode?
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="text-lg text-gray-600 max-w-2xl mx-auto"
        >
          Everything you need to organize, track, and improve your coding skills in one place.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05,
              transition: { type: 'spring', stiffness: 400, damping: 10 }
            }}
            className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold text-black mb-3">
              {feature.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

export default Features
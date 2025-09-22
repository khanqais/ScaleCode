'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const CallToAction = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const
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

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="py-16 px-6 max-w-5xl mx-auto"
    >
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-black to-gray-800 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-gray-800/90"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full transform translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full transform -translate-x-12 translate-y-12"></div>
        
        <div className="relative z-10">
          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
          >
            Ready to organize your coding journey?
          </motion.h2>
          
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-gray-200 mb-8 max-w-3xl mx-auto"
          >
            Join thousands of developers who are already using AlgoGrid to track their progress,
            organize their solutions, and accelerate their learning.
          </motion.p>
          
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center"
          >
            <Link href="/organize">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <Button 
                  size="lg" 
                  className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg font-medium rounded-full"
                >
                  Get Started Free
                </Button>
              </motion.div>
            </Link>
            
            <Link href="/problems">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="text-white hover:text-gray-200 hover:bg-white/10 px-8 py-6 text-lg font-medium border border-white/20 rounded-full"
                >
                  View Problems
                </Button>
              </motion.div>
            </Link>
          </motion.div>
          
          <motion.p
            variants={itemVariants}
            className="text-sm text-gray-300 mt-6"
          >
            No credit card required • Start organizing today
          </motion.p>
        </div>
      </motion.div>
    </motion.section>
  )
}

export default CallToAction
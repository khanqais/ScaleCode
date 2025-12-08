'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { GlowingEffect } from '@/components/ui/glowing-effect'

const Hero = () => {
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

  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center mb-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        className="mb-8 sm:mb-12"
        variants={itemVariants}
        whileHover={{ 
          scale: 1.1,
          rotate: 5,
          transition: { type: 'spring', stiffness: 400, damping: 10 }
        }}
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
      </motion.div>

      <motion.h1 
        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-black dark:text-white mb-6 sm:mb-8 max-w-4xl leading-tight"
        variants={itemVariants}
      >
        Remember every algorithm, forever
      </motion.h1>

      <motion.p 
        className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 sm:mb-12 max-w-2xl leading-relaxed px-4"
        variants={itemVariants}
      >
        Save and revise your LeetCode, HackerRank, and coding platform solutions. 
        Group them by topics, difficulty, or custom categories. 
        Never lose track of your progress again.
      </motion.p>
      <motion.div 
        className="flex flex-col sm:flex-row gap-4 items-center"
        variants={itemVariants}
      >
        <Link href="/organize">
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
    className="relative"
  >
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
  </motion.div>
</Link>
        <Link href="/pricing">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <Button 
              variant="ghost" 
              size="lg" 
              className="text-black dark:text-white px-8 py-6 text-lg font-medium group hover:bg-transparent hover:text-black dark:hover:text-white cursor-pointer"
              aria-label="View pricing plans"
            >
              See our plans 
              <motion.span 
                className="ml-2"
                whileHover={{ x: 5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                →
              </motion.span>
            </Button>
          </motion.div>
        </Link>
      </motion.div>
    </motion.div>
  )
}

export default Hero
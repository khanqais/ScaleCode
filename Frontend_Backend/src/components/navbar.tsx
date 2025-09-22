'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { UserButton, useUser, SignInButton } from '@clerk/nextjs'
import Image from 'next/image'
import ThemeToggle from './ThemeToggle'

const Navbar = () => {
  const { isSignedIn, user } = useUser()

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex items-center justify-between p-6 max-w-7xl mx-auto bg-white dark:bg-black transition-colors"
    >
      <motion.div 
        className="flex items-center space-x-3"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden">
            <Image 
              src="/logo.png" 
              alt="AlgoGrid Logo" 
              width={50} 
              height={50}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-xl font-bold text-black dark:text-white transition-colors">AlgoGrid</span>
        </Link>
      </motion.div>

      <div className="hidden md:flex items-center space-x-8">
        <motion.div whileHover={{ scale: 1.05 }}>
          <Link 
            href="/pricing" 
            className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors font-medium"
          >
            Pricing
          </Link>
        </motion.div>
        <ThemeToggle />
        
        {isSignedIn ? (
          <div className="flex items-center space-x-4">
            <span className="text-black dark:text-white font-medium transition-colors">
              Hello, {user?.firstName || 'User'}!
            </span>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            />
          </div>
        ) : (
          <motion.div whileHover={{ scale: 1.05 }}>
            <SignInButton mode="modal">
              <button className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                Log in
              </button>
            </SignInButton>
          </motion.div>
        )}
      </div>

      {/* Mobile menu */}
      <div className="md:hidden flex items-center space-x-4">
        <ThemeToggle />
        {isSignedIn ? (
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-8 h-8"
              }
            }}
          />
        ) : (
          <SignInButton mode="modal">
            <button className="bg-black dark:bg-white text-white dark:text-black px-3 py-2 text-sm rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
              Log in
            </button>
          </SignInButton>
        )}
      </div>
    </motion.nav>
  )
}

export default Navbar
'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { UserButton, useUser, SignInButton } from '@clerk/nextjs'
import Image from 'next/image'

const Navbar = () => {
  const { isSignedIn, user } = useUser()

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex items-center justify-between p-6 max-w-7xl mx-auto"
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
          <span className="text-xl font-bold text-gray-900">AlgoGrid</span>
        </Link>
      </motion.div>

      <div className="hidden md:flex items-center space-x-8">
        <motion.div whileHover={{ scale: 1.05 }}>
          <Link 
            href="/pricing" 
            className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            Pricing
          </Link>
        </motion.div>
        
        {isSignedIn ? (
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium">
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
              <button className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                Log in
              </button>
            </SignInButton>
          </motion.div>
        )}
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
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
            <button className="bg-black text-white px-3 py-2 text-sm rounded-lg font-medium hover:bg-gray-800 transition-colors">
              Log in
            </button>
          </SignInButton>
        )}
      </div>
    </motion.nav>
  )
}

export default Navbar
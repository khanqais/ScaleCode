'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { UserButton, useUser, SignInButton } from '@clerk/nextjs'
import Image from 'next/image'
import ThemeToggle from './ThemeToggle'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const Navbar = () => {
  const { isSignedIn, user } = useUser()
  const pathname = usePathname()

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
              src="/logo_white.png" 
              alt="AlgoGrid Logo" 
              width={50}  
              height={50} 
              className="w-full h-full object-cover dark:hidden" 
            />
          
            <Image 
              src="/logo_black.png" 
              alt="AlgoGrid Logo" 
              width={50}  
              height={50} 
              className="w-full h-full object-cover hidden dark:block" 
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
           <Button
           
           >
            Pricing
           </Button>
          </Link>
        </motion.div>

        {isSignedIn && pathname !== '/' && pathname !== '/organize' && (
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link href="/add-problem">
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                <Plus size={18} />
                Add Problem
              </button>
            </Link>
          </motion.div>
        )}

        <ThemeToggle />
        
        {isSignedIn ? (
          <div className="flex items-center space-x-4">
            <span className="text-black dark:text-white font-medium transition-colors">
              Hello, {user?.firstName || 'User'}!
            </span>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                  userButtonPopoverCard: "bg-white dark:bg-gray-900",
                  userButtonPopoverMain: "bg-white dark:bg-gray-900",
                  userButtonPopoverFooter: "hidden",
                  userButtonPopoverActionButton: "text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800",
                  userButtonPopoverActionButtonText: "text-black dark:text-white",
                  userButtonPopoverActionButtonIcon: "text-black dark:text-white",
                  userPreviewTextContainer: "text-black dark:text-white",
                  userPreviewMainIdentifier: "text-black dark:text-white",
                  userPreviewSecondaryIdentifier: "text-gray-600 dark:text-gray-400",
                }
              }}
              afterSignOutUrl="/"
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
        {isSignedIn && pathname !== '/' && pathname !== '/organize' && (
          <Link href="/add-problem">
            <button className="flex items-center gap-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-3 py-2 rounded-lg font-medium text-sm transition-colors">
              <Plus size={16} />
              Add
            </button>
          </Link>
        )}
        <ThemeToggle />
        {isSignedIn ? (
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
                userButtonPopoverCard: "bg-white dark:bg-gray-900",
                userButtonPopoverMain: "bg-white dark:bg-gray-900",
                userButtonPopoverFooter: "hidden",
                userButtonPopoverActionButton: "text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800",
                userButtonPopoverActionButtonText: "text-black dark:text-white",
                userButtonPopoverActionButtonIcon: "text-black dark:text-white",
                userPreviewTextContainer: "text-black dark:text-white",
                userPreviewMainIdentifier: "text-black dark:text-white",
                userPreviewSecondaryIdentifier: "text-gray-600 dark:text-gray-400",
              }
            }}
            afterSignOutUrl="/"
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
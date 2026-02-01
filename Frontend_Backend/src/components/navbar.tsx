'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import AnimatedThemeSwitch from './AnimatedThemeSwitch'
import { Button } from '@/components/ui/button'
import { Plus, LogOut } from 'lucide-react'

function UserButton() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!session?.user) return null

  const userInitial = session.user.firstName?.[0] || session.user.name?.[0] || session.user.email?.[0] || 'U'

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none"
        aria-label="User menu"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center select-none">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || 'User'}
              width={40}
              height={40}
              className="w-full h-full object-cover"
              draggable="false"
              unoptimized
            />
          ) : (
            <span className="text-white font-semibold text-lg uppercase">{userInitial}</span>
          )}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center flex-shrink-0 select-none">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      draggable="false"
                      unoptimized
                    />
                  ) : (
                    <span className="text-white font-semibold text-xl uppercase">{userInitial}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-black dark:text-white truncate">
                    {session.user.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="py-2">
              <button
                onClick={() => {
                  setIsOpen(false)
                  signOut({ callbackUrl: '/' })
                }}
                className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full text-left"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const Navbar = () => {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const isSignedIn = status === 'authenticated'

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex items-center justify-between p-6 max-w-7xl mx-auto bg-transparent transition-colors"
    >
      <motion.div 
        className="flex items-center space-x-3"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center pointer-events-none select-none">
            <Image
              src="/logo_white.png"
              alt="AlgoGrid Logo"
              className="object-contain dark:hidden"
              draggable="false"
              width={48}
              height={48}
              unoptimized
            />
            <Image
              src="/logo_black.png"
              alt="AlgoGrid Logo"
              className="object-contain hidden dark:block"
              draggable="false"
              width={48}
              height={48}
              unoptimized
            />
          </div>
          <span className="text-xl font-bold text-black dark:text-white transition-colors leading-none">AlgoGrid</span>
        </Link>
      </motion.div>

      <div className="hidden md:flex items-center space-x-8">
        {isSignedIn && pathname !== '/' && pathname !== '/organize' && pathname !== '/pricing' && (
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link href="/add-problem">
              <Button 
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                aria-label="Add a new problem"
              >
                <Plus size={18} aria-hidden="true" />
                Add Problem
              </Button>
            </Link>
          </motion.div>
        )}

        <AnimatedThemeSwitch />
        
        {isSignedIn ? (
          <div className="flex items-center space-x-4">
            <span className="text-black dark:text-white font-medium transition-colors">
              Hello, {session?.user?.firstName || session?.user?.name?.split(' ')[0] || 'User'}!
            </span>
            <UserButton />
          </div>
        ) : (
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link href="/login">
              <Button 
                className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                aria-label="Sign in to your account"
              >
                Log in
              </Button>
            </Link>
          </motion.div>
        )}
      </div>

      {}
      <div className="md:hidden flex items-center space-x-4">
        {isSignedIn && pathname !== '/' && pathname !== '/organize' && pathname !== '/pricing' && (
          <Link href="/add-problem">
            <Button 
              size="sm"
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-3 py-2 rounded-lg font-medium text-sm transition-colors"
              aria-label="Add a new problem"
            >
              <Plus size={16} aria-hidden="true" />
              Add
            </Button>
          </Link>
        )}
        <AnimatedThemeSwitch />
        {isSignedIn ? (
          <UserButton />
        ) : (
          <Link href="/login">
            <Button 
              size="sm"
              className="bg-black dark:bg-white text-white dark:text-black px-3 py-2 text-sm rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              aria-label="Sign in to your account"
            >
              Log in
            </Button>
          </Link>
        )}
      </div>
    </motion.nav>
  )
}

export default Navbar

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
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

      {isOpen && (
          <div
            className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150"
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
          </div>
        )}
    </div>
  )
}

const Navbar = () => {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const isSignedIn = status === 'authenticated'
  const isLoading = status === 'loading'
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navContent = (
    <nav
      className={`fixed left-0 right-0 z-50 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-top-12 duration-500 ${
        isScrolled 
          ? 'top-4 px-4 sm:px-6 md:px-8' 
          : 'top-0 px-0'
      }`}
    >
      <div 
        className={`pointer-events-auto transition-all duration-300 ease-in-out ${
          isScrolled
            ? 'max-w-3xl mx-auto backdrop-blur-md shadow-lg rounded-full px-6 py-3 border border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-950/80'
            : 'max-w-7xl mx-auto px-6 py-6 bg-transparent'
        }`}
      >
        <div className="flex items-center justify-between">
        <div 
          className="flex items-center space-x-3 transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          <Link href="/" className="flex items-center space-x-3">
            <div className={`rounded-lg overflow-hidden flex items-center justify-center pointer-events-none select-none transition-all duration-300 ${
              isScrolled ? 'w-8 h-8' : 'w-12 h-12'
            }`}>
              <Image
                src="/logo_white.webp"
                alt="AlgoGrid Logo"
                className={`object-contain block dark:hidden`}
                draggable="false"
                width={48}
                height={48}
                priority
                unoptimized
              />
              <Image
                src="/logo_black.webp"
                alt="AlgoGrid Logo"
                className={`object-contain hidden dark:block`}
                draggable="false"
                width={48}
                height={48}
                priority
                unoptimized
              />
            </div>
            <span className={`font-bold transition-all duration-300 leading-none ${
              isScrolled ? 'text-lg text-black dark:text-white' : 'text-xl text-black dark:text-white'
            }`}>AlgoGrid</span>
          </Link>
        </div>

      <div className={`hidden md:flex items-center ${isScrolled ? 'space-x-4' : 'space-x-8'}`}>
        {isLoading ? (
          <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg hidden lg:block"></div>
        ) : isSignedIn && pathname !== '/' && pathname !== '/organize' && pathname !== '/pricing' && (
          <div className="transition-transform duration-200 hover:scale-105">
            <Link href="/add-problem">
              <Button 
                className={`flex items-center gap-2 text-white font-medium transition-colors ${isScrolled ? 'bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-full text-sm' : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 px-4 py-2 rounded-lg'}`}
                aria-label="Add a new problem"
              >
                <Plus size={isScrolled ? 16 : 18} aria-hidden="true" />
                Add Problem
              </Button>
            </Link>
          </div>
        )}

        <AnimatedThemeSwitch />
        
        {isLoading ? (
          <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
        ) : isSignedIn ? (
          <div className="flex items-center space-x-4">
            {!isScrolled && (
              <span className="text-black dark:text-white font-medium transition-colors">
                Hello, {session?.user?.firstName || session?.user?.name?.split(' ')[0] || 'User'}!
              </span>
            )}
            <UserButton />
          </div>
        ) : (
          <div className="transition-transform duration-200 hover:scale-105">
            <Link href="/login">
              <Button 
                className={`font-medium transition-colors ${isScrolled ? 'bg-white text-black hover:bg-gray-200 px-4 py-1.5 rounded-full text-sm' : 'bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200'}`}
                aria-label="Sign in to your account"
              >
                Log in
              </Button>
            </Link>
          </div>
        )}
      </div>

      {}
      <div className="md:hidden flex items-center space-x-4">
        {isLoading ? (
          <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg hidden sm:block"></div>
        ) : isSignedIn && pathname !== '/' && pathname !== '/organize' && pathname !== '/pricing' && (
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
        {isLoading ? (
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full"></div>
        ) : isSignedIn ? (
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
      </div>
      </div>
    </nav>
  )

  if (!mounted) return null

  return (
    <>
      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-24" />
      {createPortal(navContent, document.body)}
    </>
  )
}

export default Navbar

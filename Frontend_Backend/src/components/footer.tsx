'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Github, Twitter, Linkedin } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const
      }
    }
  }

  const linkVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2
      }
    }
  }

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={footerVariants}
      className="bg-white/80 dark:bg-black/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 mt-16 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <motion.div 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <div className="w-10 h-10 bg-black dark:bg-white rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-white dark:text-black font-bold text-lg">{'</>'}</span>
                </div>
                <span className="text-xl font-bold text-black dark:text-white transition-colors">AlgoGrid</span>
              </motion.div>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md transition-colors">
              Organize and manage your coding solutions from LeetCode, HackerRank, 
              and other coding platforms. Keep track of your progress and improve your skills.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-black dark:text-white mb-4 transition-colors">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { name: 'Home', href: '/' },
                { name: 'Problems', href: '/problems' },
                { name: 'Add Problem', href: '/add-problem' },
                { name: 'Organize', href: '/organize' }
              ].map((link) => (
                <li key={link.name}>
                  <motion.div variants={linkVariants} whileHover="hover">
                    <Link 
                      href={link.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-black dark:text-white mb-4 transition-colors">Support</h3>
            <ul className="space-y-3">
              {[
                { name: 'Help Center', href: '#' },
                { name: 'Contact Us', href: '#' },
                { name: 'Privacy Policy', href: '#' },
                { name: 'Terms of Service', href: '#' }
              ].map((link) => (
                <li key={link.name}>
                  <motion.div variants={linkVariants} whileHover="hover">
                    <Link 
                      href={link.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 transition-colors">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors">
              © {currentYear} AlgoGrid. All rights reserved.
            </p>
            
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              {[
                { name: 'GitHub', href: '#', Icon: Github, label: 'Visit our GitHub' },
                { name: 'Twitter', href: '#', Icon: Twitter, label: 'Follow us on Twitter' },
                { name: 'LinkedIn', href: '#', Icon: Linkedin, label: 'Connect on LinkedIn' }
              ].map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.Icon className="w-5 h-5" aria-hidden="true" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}

export default Footer
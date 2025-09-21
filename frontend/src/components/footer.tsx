'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

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
      className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-16"
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <motion.div 
              className="flex items-center space-x-3 mb-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SC</span>
              </div>
              <span className="text-xl font-bold text-gray-900">ScaleCode</span>
            </motion.div>
            <p className="text-gray-600 mb-4 max-w-md">
              Organize and manage your coding solutions from LeetCode, HackerRank, 
              and other coding platforms. Keep track of your progress and improve your skills.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
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
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
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
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              © {currentYear} ScaleCode. All rights reserved.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <p className="text-gray-600 text-sm mr-2">Follow us:</p>
              {[
                { name: 'GitHub', href: '#', icon: '🐙' },
                { name: 'Twitter', href: '#', icon: '🐦' },
                { name: 'LinkedIn', href: '#', icon: '💼' }
              ].map((social) => (
                <motion.div
                  key={social.name}
                  variants={linkVariants}
                  whileHover="hover"
                >
                  <Link
                    href={social.href}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    title={social.name}
                  >
                    <span className="text-lg">{social.icon}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}

export default Footer
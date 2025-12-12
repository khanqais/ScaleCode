'use client'

import React from 'react'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { Zap, Code2, BookOpen, Sparkles, ArrowRight } from 'lucide-react'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30">
            <Sparkles size={16} className="text-blue-400" />
            <span className="text-sm font-semibold text-blue-300">DEMO EXPERIENCE</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Explore ScaleCode <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Free</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-8">
            Get a hands-on preview of our platform. Browse problems, see sample solutions, and understand how our AI-powered learning system works.
          </p>
        </div>

        {/* Demo Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: Code2,
              title: 'Sample Problems',
              description: 'Explore 5 curated problems across different categories and difficulty levels',
              color: 'from-blue-500 to-blue-600'
            },
            {
              icon: BookOpen,
              title: 'Full Problem Details',
              description: 'View complete problem statements, examples, and constraints',
              color: 'from-purple-500 to-purple-600'
            },
            {
              icon: Zap,
              title: 'Sample Solutions',
              description: 'See efficient TypeScript solutions with complexity analysis',
              color: 'from-orange-500 to-orange-600'
            }
          ].map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div key={idx} className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-lg p-6 hover:border-slate-600/50 transition-all duration-300">
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-lg opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className="relative">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} p-2.5 mb-4 flex items-center justify-center`}>
                    <Icon size={24} className="text-white" />
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600/20 to-blue-500/10 border border-blue-500/30 rounded-xl p-12 text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Exploring?</h2>
          <p className="text-slate-400 mb-8 text-lg">
            Browse our sample problems to see exactly what you'll get with ScaleCode.
          </p>

          <Link
            href="/demo/problems"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 text-lg"
          >
            <Code2 size={20} />
            View Sample Problems
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* What You Get Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">What You'll Get</h2>

          <div className="space-y-4">
            {[
              {
                title: 'Problem Browsing',
                description: 'Browse through a collection of problems filtered by difficulty, category, and tags'
              },
              {
                title: 'Detailed Explanations',
                description: 'Understand the approach with clear explanations and complexity analysis for each solution'
              },
              {
                title: 'Code Examples',
                description: 'See working TypeScript solutions that you can learn from and reference'
              },
              {
                title: 'Sign-up Prompts',
                description: 'When you\'re ready to practice, sign in to start solving and tracking progress'
              },
              {
                title: 'AI Features Preview',
                description: 'Learn about our AI-powered hints and smart revision system (available after login)'
              }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-600/20 border border-blue-500/30">
                    <span className="text-sm font-bold text-blue-400">{idx + 1}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-slate-400 mb-6">
            Want to unlock all features and start your learning journey?
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
          >
            Create Your Account
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}

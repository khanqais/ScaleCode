'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { sampleProblems } from '@/lib/sampleProblems'
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Lock, 
  FileCode, 
  BookOpen,
  ChevronDown
} from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

const DifficultyBadge = ({ difficulty }: { difficulty: 'easy' | 'medium' | 'hard' }) => {
  const colors = {
    easy: 'bg-green-500/20 text-green-400 border border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    hard: 'bg-red-500/20 text-red-400 border border-red-500/30'
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[difficulty]}`}>
      {difficulty.toUpperCase()}
    </span>
  )
}

function DemoProblemsPreviewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const problemId = searchParams.get('id')
  
  const problem = sampleProblems.find(p => p._id === problemId)
  const [copiedCode, setCopiedCode] = useState(false)
  const [expandedSection, setExpandedSection] = useState<'statement' | 'code' | null>('statement')

  if (!problem) {
    return (
      <div className="min-h-screen bg-transparent">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Problem Not Found</h1>
          <p className="text-slate-400 mb-6">The problem you're looking for doesn't exist.</p>
          <Link
            href="/demo/problems"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Problems
          </Link>
        </div>
      </div>
    )
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(problem.sampleCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
            title="Go back"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">{problem.title}</h1>
            <p className="text-slate-400">{problem.shortDescription}</p>
          </div>
        </div>

        {/* Problem Meta */}
        <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-slate-700">
          <DifficultyBadge difficulty={problem.difficulty} />
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-700/50 text-slate-300">
            {problem.category}
          </span>
          <div className="flex flex-wrap gap-2">
            {problem.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs rounded bg-slate-700/30 text-slate-300 border border-slate-600/50"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Problem Statement Section */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'statement' ? null : 'statement')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors bg-slate-900/50"
              >
                <div className="flex items-center gap-3">
                  <BookOpen size={20} className="text-blue-400" />
                  <h2 className="text-xl font-bold text-white">Problem Statement</h2>
                </div>
                <ChevronDown 
                  size={20} 
                  className={`text-slate-400 transition-transform ${expandedSection === 'statement' ? 'rotate-180' : ''}`}
                />
              </button>

              {expandedSection === 'statement' && (
                <div className="px-6 py-4 space-y-6 bg-slate-800/20">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {problem.problemStatement}
                    </p>
                  </div>

                  <div className="border-t border-slate-700 pt-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Examples & Constraints</h3>
                    <pre className="bg-slate-900 p-4 rounded-lg text-slate-300 text-sm overflow-x-auto whitespace-pre-wrap break-words">
                      {problem.problemDescription}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Sample Solution Section */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'code' ? null : 'code')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors bg-slate-900/50"
              >
                <div className="flex items-center gap-3">
                  <FileCode size={20} className="text-green-400" />
                  <h2 className="text-xl font-bold text-white">Sample Solution</h2>
                </div>
                <ChevronDown 
                  size={20} 
                  className={`text-slate-400 transition-transform ${expandedSection === 'code' ? 'rotate-180' : ''}`}
                />
              </button>

              {expandedSection === 'code' && (
                <div className="p-6 bg-slate-800/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">TypeScript Solution</p>
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded transition-colors text-sm"
                    >
                      {copiedCode ? (
                        <>
                          <Check size={14} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy Code
                        </>
                      )}
                    </button>
                  </div>

                  <SyntaxHighlighter
                    language="typescript"
                    style={oneDark}
                    customStyle={{
                      margin: 0,
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    {problem.sampleCode}
                  </SyntaxHighlighter>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Login CTA Card */}
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-500/10 border border-blue-500/30 rounded-lg p-6 sticky top-8">
              <div className="mb-4 flex items-center gap-2">
                <Lock size={20} className="text-blue-400" />
                <h3 className="text-lg font-bold text-white">Try This Problem</h3>
              </div>

              <p className="text-sm text-slate-300 mb-6">
                Sign in to solve this problem, submit your code, and track your progress with our AI-powered revision system.
              </p>

              <Link
                href="/login"
                className="w-full block px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-lg transition-all duration-300 text-center hover:shadow-lg hover:shadow-blue-500/50"
              >
                Login to Solve
              </Link>

              <p className="text-xs text-slate-400 text-center mt-4">
                Don't have an account? Sign up during login.
              </p>
            </div>

            {/* Features Highlight */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Premium Features</h3>
              <ul className="space-y-3">
                {[
                  'AI-Powered Hints',
                  'Smart Revision System',
                  'Detailed Explanations',
                  'Progress Tracking',
                  'Performance Analytics'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Browse More */}
            <Link
              href="/demo/problems"
              className="w-full px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white font-semibold rounded-lg transition-colors text-center flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Browse More Problems
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DemoProblemsPreview() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading problem...</p>
        </div>
      </div>
    }>
      <DemoProblemsPreviewContent />
    </Suspense>
  )
}

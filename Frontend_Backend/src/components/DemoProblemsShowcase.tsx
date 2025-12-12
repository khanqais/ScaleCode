'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Code2, Target, Zap, Lock, ArrowRight, ChevronDown } from 'lucide-react'
import { sampleProblems, type DemoProblem } from '@/lib/sampleProblems'

interface DemoProblemCardProps {
  problem: DemoProblem
  onPreview: (problem: DemoProblem) => void
}

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

const DemoProblemCard = ({ problem, onPreview }: DemoProblemCardProps) => {
  return (
    <div className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-lg p-6 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/0 to-transparent rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      
      <div className="relative">
        {/* Lock Icon for Premium Feel */}
        <div className="absolute top-0 right-0 text-slate-600 group-hover:text-slate-400 transition-colors">
          <Lock size={16} />
        </div>

        {/* Title and Category */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
            {problem.title}
          </h3>
          <p className="text-sm text-slate-400 mb-3">{problem.shortDescription}</p>
        </div>

        {/* Difficulty and Category */}
        <div className="flex items-center gap-2 mb-4">
          <DifficultyBadge difficulty={problem.difficulty} />
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300">
            {problem.category}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {problem.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-1 text-xs rounded bg-slate-700/30 text-slate-300 border border-slate-600/50"
            >
              #{tag}
            </span>
          ))}
          {problem.tags.length > 3 && (
            <span className="px-2 py-1 text-xs text-slate-400">+{problem.tags.length - 3}</span>
          )}
        </div>

        {/* Preview Button */}
        <button
          onClick={() => onPreview(problem)}
          className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group/btn"
        >
          <Code2 size={16} />
          View Problem
          <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}

interface DemoProblemsShowcaseProps {
  onSelectProblem?: (problem: DemoProblem) => void
}

export const DemoProblemsShowcase = ({ onSelectProblem }: DemoProblemsShowcaseProps) => {
  const [selectedProblem, setSelectedProblem] = useState<DemoProblem | null>(null)

  const handlePreview = (problem: DemoProblem) => {
    setSelectedProblem(problem)
    onSelectProblem?.(problem)
  }

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30">
          <Zap size={16} className="text-blue-400" />
          <span className="text-sm font-semibold text-blue-300">EXPLORE SAMPLE PROBLEMS</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          See How It Works
        </h2>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Browse our curated collection of coding problems. Get a feel for the platform before signing up.
        </p>
      </div>

      {/* Problems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {sampleProblems.map((problem) => (
          <DemoProblemCard
            key={problem._id}
            problem={problem}
            onPreview={handlePreview}
          />
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 p-8 rounded-lg border border-blue-500/30 bg-gradient-to-r from-blue-600/10 to-blue-500/5 text-center">
        <h3 className="text-2xl font-bold text-white mb-3">Ready to Start Coding?</h3>
        <p className="text-slate-400 mb-6">
          Sign up now to solve these problems, track your progress, and use AI-powered hints.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50"
        >
          <Target size={18} />
          Login to Solve Problems
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}

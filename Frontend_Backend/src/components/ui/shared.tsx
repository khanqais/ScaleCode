interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-32 w-32'
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`animate-spin rounded-full border-b-2 border-purple-600 ${sizeClasses[size]}`}></div>
      {text && <p className="mt-4 text-gray-600 animate-pulse">{text}</p>}
    </div>
  )
}

interface EmptyStateProps {
  icon: React.ComponentType<{ size: number; className?: string }>
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    icon?: React.ComponentType<{ size: number }>
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-20">
      <Icon size={80} className="mx-auto text-gray-300 mb-6" />
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg flex items-center gap-3 mx-auto"
        >
          {action.icon && <action.icon size={24} />}
          {action.label}
        </button>
      )}
    </div>
  )
}

interface StatCardProps {
  icon: React.ComponentType<{ size: number; className?: string }>
  label: string
  value: string | number
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red'
}

export function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    yellow: 'text-yellow-500',
    red: 'text-red-500'
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-2">
        <Icon className={colorClasses[color]} size={24} />
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

interface DifficultyBadgeProps {
  difficulty: number
  showText?: boolean
}

export function DifficultyBadge({ difficulty, showText = true }: DifficultyBadgeProps) {
  const getDifficultyConfig = (difficulty: number) => {
    if (difficulty <= 3) return { 
      color: 'text-green-600 bg-green-100', 
      text: 'Easy' 
    }
    if (difficulty <= 6) return { 
      color: 'text-yellow-600 bg-yellow-100', 
      text: 'Medium' 
    }
    if (difficulty <= 8) return { 
      color: 'text-orange-600 bg-orange-100', 
      text: 'Hard' 
    }
    return { 
      color: 'text-red-600 bg-red-100', 
      text: 'Expert' 
    }
  }

  const config = getDifficultyConfig(difficulty)

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      {showText ? `${config.text} ${difficulty}/10` : `${difficulty}/10`}
    </span>
  )
}

interface CodeBlockProps {
  code: string
  language?: string
  title?: string
}

export function CodeBlock({ code, language = 'javascript', title }: CodeBlockProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {title && (
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="p-4 bg-gray-900 text-gray-100 overflow-x-auto">
        <pre className="font-mono text-sm">
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </div>
    </div>
  )
}

interface TagsProps {
  tags: string[]
  maxVisible?: number
  size?: 'sm' | 'md'
}

export function Tags({ tags, maxVisible = 3, size = 'sm' }: TagsProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm'
  }

  const visibleTags = tags.slice(0, maxVisible)
  const remainingCount = tags.length - maxVisible

  return (
    <div className="flex flex-wrap gap-1">
      {visibleTags.map((tag, index) => (
        <span
          key={index}
          className={`bg-gray-100 text-gray-600 rounded-md ${sizeClasses[size]}`}
        >
          {tag}
        </span>
      ))}
      {remainingCount > 0 && (
        <span
          className={`bg-gray-100 text-gray-600 rounded-md ${sizeClasses[size]}`}
        >
          +{remainingCount}
        </span>
      )}
    </div>
  )
}

interface ProgressBarProps {
  value: number
  max: number
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red'
  showPercentage?: boolean
}

export function ProgressBar({ value, max, color = 'blue', showPercentage = true }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)
  
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600'
  }

  return (
    <div className="w-full">
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {showPercentage && (
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  )
}
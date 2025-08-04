'use client'

import React from 'react'

interface MinimalLayoutProps {
  children: React.ReactNode
  showThemeToggle?: boolean
  className?: string
}

export const MinimalLayout: React.FC<MinimalLayoutProps> = ({
  children,
  showThemeToggle = true,
  className = ""
}) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 ${className}`}>
      {children}
    </div>
  )
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  badge?: {
    text: string
    color?: 'green' | 'yellow' | 'blue' | 'purple'
  }
  className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  className = ""
}) => {
  const badgeColors = {
    green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
  }

  return (
    <div className={`text-center space-y-6 ${className}`}>
      {badge && (
        <div className="animate-fade-scale">
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${badgeColors[badge.color || 'blue']}`}>
            <span className="w-2 h-2 bg-current rounded-full mr-2 opacity-60"></span>
            {badge.text}
          </span>
        </div>
      )}
      
      <div className="space-y-4 animate-slide-up">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {title}
        </h1>
        
        {subtitle && (
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg' | 'xl'
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hover = true,
  padding = 'md'
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12'
  }

  return (
    <div 
      className={`
        bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 
        ${hover ? 'hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300' : ''} 
        ${paddingClasses[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

const MinimalComponents = {
  MinimalLayout,
  PageHeader,
  Card
}

export default MinimalComponents

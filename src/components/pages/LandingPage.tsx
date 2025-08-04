'use client'

import { useEffect, useState } from 'react'
import NainovateLogo from '../../assets/Nainovate_GenX_Logo.svg'
import Image from 'next/image'

interface LandingPageProps {
  onNavigate?: (pageId: string) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  pageConfig?: any;
  config?: any;
}

/**
 * LandingPage Component
 * 
 * Features:
 * - Hero section with branding
 * - Feature showcase
 * - KPI statistics
 * - Call-to-action sections
 * - Preserves all original animations and styling
 * - Backend links remain unchanged
 */
export const LandingPage: React.FC<LandingPageProps> = ({ 
  onNavigate, 
  onNext, 
  onPrevious, 
  canGoNext, 
  canGoPrevious, 
  pageConfig, 
  config 
}) => {
  const [mounted, setMounted] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [kpiVisible, setKpiVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Setup intersection observer for KPI section
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setKpiVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    const kpiSection = document.getElementById('kpi-section')
    if (kpiSection) {
      observer.observe(kpiSection)
    }

    return () => {
      if (kpiSection) {
        observer.unobserve(kpiSection)
      }
    }
  }, [])

  const features = [
    {
      name: 'Intelligent Data Processing',
      description: 'Advanced dataset validation and preprocessing with real-time insights',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      status: 'Production Ready'
    },
    {
      name: 'Model Optimization',
      description: 'State-of-the-art model selection and hyperparameter tuning',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      status: 'Production Ready'
    },
    {
      name: 'Training Pipeline',
      description: 'Scalable training infrastructure with real-time monitoring',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      status: 'In Development'
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 gradient-mesh">
      {/* Navigation - Simplified since header handles main navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center">
              {!logoError ? (
                <Image 
                  src={NainovateLogo} 
                  alt="Nainovate Logo" 
                  width={0}
                  height={0}
                  className="w-auto h-auto max-w-80 max-h-20 object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white dark:text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
              )}
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => onNavigate?.('dashboard-minimal')} 
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Dashboard
            </button>
            <button 
              onClick={() => onNavigate?.('dataset-selection')} 
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Fine-tuning
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6">
        <div className={`text-center py-24 transition-all duration-1000 ${mounted ? 'animate-fade-scale' : 'opacity-0'}`}>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-8 leading-tight tracking-tight">
              AI fine-tuning
              <br />
              <span className="text-slate-500 dark:text-slate-400">made simple</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Transform your datasets into powerful AI models with our intuitive platform. 
              No coding required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => onNavigate?.('dataset-selection')}
                className="group inline-flex items-center px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all duration-200 shadow-lg hover:shadow-xl hover-lift"
              >
                Start fine-tuning
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button 
                onClick={() => onNavigate?.('dashboard-minimal')}
                className="inline-flex items-center px-8 py-4 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
              >
                View dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className={`py-16 transition-all duration-1000 delay-300 ${mounted ? 'animate-stagger-up' : 'opacity-0'}`}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Everything you need to train AI models
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                From data processing to model deployment, our platform handles the complexity 
                so you can focus on your use case.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="group p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 hover-lift glass-effect"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900 transition-all duration-200">
                      {feature.icon}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${feature.status === 'Production Ready' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">{feature.status}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                    {feature.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KPI Section */}
        <div id="kpi-section" className={`py-24 transition-all duration-1000 ${kpiVisible ? 'animate-fade-scale' : 'opacity-0'}`}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Accelerate Your AI Development
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Our platform dramatically reduces development time and costs while increasing success rates
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className={`text-center p-6 rounded-2xl glass-effect transition-all duration-700 delay-100 ${kpiVisible ? 'animate-stagger-up' : 'opacity-0 translate-y-8'}`}>
                <div className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  85%
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Time Saved
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Reduce model training setup from weeks to hours
                </p>
              </div>

              <div className={`text-center p-6 rounded-2xl glass-effect transition-all duration-700 delay-200 ${kpiVisible ? 'animate-stagger-up' : 'opacity-0 translate-y-8'}`}>
                <div className="text-4xl md:text-5xl font-bold text-green-600 dark:text-green-400 mb-2">
                  $50K+
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Cost Savings
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Average savings per project vs custom development
                </p>
              </div>

              <div className={`text-center p-6 rounded-2xl glass-effect transition-all duration-700 delay-300 ${kpiVisible ? 'animate-stagger-up' : 'opacity-0 translate-y-8'}`}>
                <div className="text-4xl md:text-5xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  92%
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Success Rate
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Models reach production with our guided workflow
                </p>
              </div>

              <div className={`text-center p-6 rounded-2xl glass-effect transition-all duration-700 delay-400 ${kpiVisible ? 'animate-stagger-up' : 'opacity-0 translate-y-8'}`}>
                <div className="text-4xl md:text-5xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  3x
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Faster ROI
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Achieve return on investment compared to traditional methods
                </p>
              </div>
            </div>

            {/* Additional detailed stats */}
            <div className={`mt-16 grid md:grid-cols-3 gap-8 transition-all duration-1000 delay-500 ${kpiVisible ? 'animate-fade-scale' : 'opacity-0'}`}>
              <div className="text-center p-8 border border-slate-200 dark:border-slate-700 rounded-2xl hover-lift">
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  2-3 weeks → 4-6 hours
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  <strong>Model Setup Time:</strong> From initial data preparation to first training run
                </p>
              </div>

              <div className="text-center p-8 border border-slate-200 dark:border-slate-700 rounded-2xl hover-lift">
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  $75K → $15K
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  <strong>Average Project Cost:</strong> Typical enterprise AI project budget reduction
                </p>
              </div>

              <div className="text-center p-8 border border-slate-200 dark:border-slate-700 rounded-2xl hover-lift">
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  6 months → 3 weeks
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  <strong>Time to Production:</strong> From concept to deployed model in production
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className={`py-16 transition-all duration-1000 delay-500 ${mounted ? 'animate-fade-scale' : 'opacity-0'}`}>
          <div className="max-w-4xl mx-auto text-center">
            <div className="p-12 rounded-3xl border border-slate-200 dark:border-slate-800 glass-effect">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Ready to start building?
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
                Join the future of AI development. Create your first fine-tuned model in minutes.
              </p>
              <button 
                onClick={() => onNavigate?.('dataset-selection')}
                className="inline-flex items-center px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all duration-200 shadow-lg hover:shadow-xl hover-lift"
              >
                Get started for free
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-12 border-t border-slate-200 dark:border-slate-800">
          <div className="text-center">
            <p className="text-slate-500 dark:text-slate-400">
              © 2025 Nainovate AI. Building the future of accessible AI.
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default LandingPage;

'use client'

import React, { useEffect, useState } from 'react';

interface AmbientAnimationsProps {
  className?: string;
}

/**
 * AmbientAnimations Component
 * 
 * Provides smooth, non-intrusive background animations with neural network-inspired paths.
 * Features sequential strand animations with highlight pulses in muted tones.
 * Responsive design with mobile fallback and theme compatibility.
 */
export const AmbientAnimations: React.FC<AmbientAnimationsProps> = ({ className = '' }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check for mobile screen size
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check for theme
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark') || 
                    document.body.classList.contains('dark') ||
                    window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(isDark ? 'dark' : 'light');
    };

    checkMobile();
    checkTheme();

    window.addEventListener('resize', checkMobile);
    
    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    return () => {
      window.removeEventListener('resize', checkMobile);
      observer.disconnect();
    };
  }, []);

  // Color schemes based on theme
  const colors = {
    light: {
      primary: 'rgba(59, 130, 246, 0.15)', // soft blue
      secondary: 'rgba(139, 92, 246, 0.12)', // soft violet
      tertiary: 'rgba(20, 184, 166, 0.1)', // soft teal
      glow: 'rgba(59, 130, 246, 0.3)',
    },
    dark: {
      primary: 'rgba(96, 165, 250, 0.2)', // lighter blue
      secondary: 'rgba(167, 139, 250, 0.18)', // lighter violet
      tertiary: 'rgba(45, 212, 191, 0.15)', // lighter teal
      glow: 'rgba(96, 165, 250, 0.4)',
    }
  };

  const currentColors = colors[theme];

  // If mobile, return static minimal visual
  if (isMobile) {
    return (
      <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
        {/* Static left side */}
        <div className="absolute left-0 top-0 h-full w-16 opacity-30">
          <svg className="w-full h-full" viewBox="0 0 64 400" preserveAspectRatio="none">
            <path
              d="M10,50 Q20,100 10,150 T10,250 Q20,300 10,350"
              stroke={currentColors.primary}
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M30,80 Q40,130 30,180 T30,280 Q40,330 30,380"
              stroke={currentColors.secondary}
              strokeWidth="1.5"
              fill="none"
              opacity="0.4"
            />
          </svg>
        </div>
        
        {/* Static right side */}
        <div className="absolute right-0 top-0 h-full w-16 opacity-30">
          <svg className="w-full h-full" viewBox="0 0 64 400" preserveAspectRatio="none">
            <path
              d="M54,50 Q44,100 54,150 T54,250 Q44,300 54,350"
              stroke={currentColors.primary}
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M34,80 Q24,130 34,180 T34,280 Q24,330 34,380"
              stroke={currentColors.tertiary}
              strokeWidth="1.5"
              fill="none"
              opacity="0.4"
            />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Left side animations */}
      <div className="absolute left-0 top-0 h-full w-24 lg:w-32">
        <svg className="w-full h-full" viewBox="0 0 128 800" preserveAspectRatio="none">
          {/* Primary flowing line */}
          <path
            d="M20,100 Q40,200 20,300 T20,500 Q40,600 20,700"
            stroke={currentColors.primary}
            strokeWidth="3"
            fill="none"
            className="animate-flow-1"
          />
          
          {/* Secondary neural path */}
          <path
            d="M60,150 Q80,250 60,350 T60,550 Q80,650 60,750"
            stroke={currentColors.secondary}
            strokeWidth="2"
            fill="none"
            className="animate-flow-2"
          />
          
          {/* Tertiary subtle strand */}
          <path
            d="M100,80 Q120,180 100,280 T100,480 Q120,580 100,680"
            stroke={currentColors.tertiary}
            strokeWidth="1.5"
            fill="none"
            className="animate-flow-3"
          />
          
          {/* Pulsing nodes */}
          <circle cx="20" cy="200" r="3" fill={currentColors.glow} className="animate-pulse-1" />
          <circle cx="60" cy="350" r="2.5" fill={currentColors.glow} className="animate-pulse-2" />
          <circle cx="100" cy="500" r="2" fill={currentColors.glow} className="animate-pulse-3" />
        </svg>
      </div>

      {/* Right side animations */}
      <div className="absolute right-0 top-0 h-full w-24 lg:w-32">
        <svg className="w-full h-full" viewBox="0 0 128 800" preserveAspectRatio="none">
          {/* Primary flowing line (mirrored) */}
          <path
            d="M108,100 Q88,200 108,300 T108,500 Q88,600 108,700"
            stroke={currentColors.primary}
            strokeWidth="3"
            fill="none"
            className="animate-flow-4"
          />
          
          {/* Secondary neural path (mirrored) */}
          <path
            d="M68,150 Q48,250 68,350 T68,550 Q48,650 68,750"
            stroke={currentColors.tertiary}
            strokeWidth="2"
            fill="none"
            className="animate-flow-5"
          />
          
          {/* Tertiary subtle strand (mirrored) */}
          <path
            d="M28,80 Q8,180 28,280 T28,480 Q8,580 28,680"
            stroke={currentColors.secondary}
            strokeWidth="1.5"
            fill="none"
            className="animate-flow-6"
          />
          
          {/* Pulsing nodes (mirrored) */}
          <circle cx="108" cy="300" r="3" fill={currentColors.glow} className="animate-pulse-4" />
          <circle cx="68" cy="450" r="2.5" fill={currentColors.glow} className="animate-pulse-5" />
          <circle cx="28" cy="600" r="2" fill={currentColors.glow} className="animate-pulse-6" />
        </svg>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes flowStroke1 {
          0%, 100% { stroke-dasharray: 0, 1000; opacity: 0.3; }
          20% { stroke-dasharray: 200, 1000; opacity: 0.8; }
          50% { stroke-dasharray: 400, 1000; opacity: 0.6; }
          80% { stroke-dasharray: 600, 1000; opacity: 0.4; }
        }
        
        @keyframes flowStroke2 {
          0%, 100% { stroke-dasharray: 0, 1000; opacity: 0.2; }
          30% { stroke-dasharray: 200, 1000; opacity: 0.7; }
          60% { stroke-dasharray: 400, 1000; opacity: 0.5; }
          90% { stroke-dasharray: 600, 1000; opacity: 0.3; }
        }
        
        @keyframes flowStroke3 {
          0%, 100% { stroke-dasharray: 0, 1000; opacity: 0.15; }
          40% { stroke-dasharray: 200, 1000; opacity: 0.6; }
          70% { stroke-dasharray: 400, 1000; opacity: 0.4; }
        }
        
        @keyframes subtlePulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        
        @keyframes delayedPulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          60% { opacity: 0.7; transform: scale(1.15); }
        }
        
        .animate-flow-1 {
          animation: flowStroke1 8s ease-in-out infinite;
        }
        
        .animate-flow-2 {
          animation: flowStroke2 10s ease-in-out infinite 2s;
        }
        
        .animate-flow-3 {
          animation: flowStroke3 12s ease-in-out infinite 4s;
        }
        
        .animate-flow-4 {
          animation: flowStroke1 9s ease-in-out infinite 1s;
        }
        
        .animate-flow-5 {
          animation: flowStroke2 11s ease-in-out infinite 3s;
        }
        
        .animate-flow-6 {
          animation: flowStroke3 13s ease-in-out infinite 5s;
        }
        
        .animate-pulse-1 {
          animation: subtlePulse 6s ease-in-out infinite;
        }
        
        .animate-pulse-2 {
          animation: delayedPulse 8s ease-in-out infinite 2s;
        }
        
        .animate-pulse-3 {
          animation: subtlePulse 10s ease-in-out infinite 4s;
        }
        
        .animate-pulse-4 {
          animation: delayedPulse 7s ease-in-out infinite 1s;
        }
        
        .animate-pulse-5 {
          animation: subtlePulse 9s ease-in-out infinite 3s;
        }
        
        .animate-pulse-6 {
          animation: delayedPulse 11s ease-in-out infinite 5s;
        }
      `}</style>
    </div>
  );
};

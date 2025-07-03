'use client'

import React, { useEffect, useState } from 'react';

interface SideAnimationProps {
  className?: string;
}

interface ParticlePath {
  id: string;
  startY: number;
  endY: number;
  delay: number;
  duration: number;
  color: string;
  intensity: number;
  side: 'left' | 'right';
  direction: 'vertical' | 'diagonal';
}

/**
 * SideAnimation Component
 * 
 * Renders ambient neural flow animations on screen sides
 * - Animated particle paths on larger screens
 * - Static fallback on mobile devices
 * - Theme-adaptive colors and responsiveness
 */
export const SideAnimation: React.FC<SideAnimationProps> = ({ className = '' }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [paths, setPaths] = useState<ParticlePath[]>([]);

  // Check screen size and generate particle paths
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Generate random particle paths
    const generatePaths = (): ParticlePath[] => {
      const colors = [
        'rgba(20, 184, 166, 0.5)', // teal-500
        'rgba(139, 92, 246, 0.5)', // violet-500
        'rgba(6, 182, 212, 0.5)',  // cyan-500
        'rgba(99, 102, 241, 0.5)', // indigo-500
        'rgba(236, 72, 153, 0.5)', // pink-500
        'rgba(34, 197, 94, 0.5)',  // green-500
      ];

      const directions: ('vertical' | 'diagonal')[] = ['vertical', 'diagonal'];
      const sides: ('left' | 'right')[] = ['left', 'right'];

      return Array.from({ length: 8 }, (_, i) => ({
        id: `path-${i}`,
        startY: Math.random() * 90 + 5, // 5% to 95% of screen height
        endY: Math.random() * 90 + 5,
        delay: Math.random() * 3000, // 0-3s delay
        duration: 5000 + Math.random() * 3000, // 5-8s duration
        color: colors[Math.floor(Math.random() * colors.length)],
        intensity: 0.4 + Math.random() * 0.4, // 0.4-0.8 intensity
        side: sides[i % 2], // Alternate between left and right
        direction: directions[Math.floor(i / 2) % 2], // Alternate between vertical and diagonal
      }));
    };

    checkMobile();
    setPaths(generatePaths());

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Static fallback for mobile
  const StaticFallback: React.FC = () => (
    <div className={`fixed inset-0 pointer-events-none z-0 ${className}`}>
      {/* Left side static lines */}
      <svg
        className="absolute left-0 top-0 h-full w-24 opacity-15 dark:opacity-8"
        viewBox="0 0 24 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6 0 Q12 25 6 50 Q3 75 6 100"
          stroke="currentColor"
          strokeWidth="0.2"
          className="text-teal-500 dark:text-teal-400"
          fill="none"
        />
        <path
          d="M18 0 Q12 25 18 50 Q21 75 18 100"
          stroke="currentColor"
          strokeWidth="0.2"
          className="text-violet-500 dark:text-violet-400"
          fill="none"
        />
        <path
          d="M3 20 Q18 40 12 70"
          stroke="currentColor"
          strokeWidth="0.15"
          className="text-cyan-500 dark:text-cyan-400"
          fill="none"
        />
      </svg>
      
      {/* Right side static lines */}
      <svg
        className="absolute right-0 top-0 h-full w-24 opacity-15 dark:opacity-8"
        viewBox="0 0 24 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18 0 Q12 25 18 50 Q21 75 18 100"
          stroke="currentColor"
          strokeWidth="0.2"
          className="text-indigo-500 dark:text-indigo-400"
          fill="none"
        />
        <path
          d="M6 0 Q12 25 6 50 Q3 75 6 100"
          stroke="currentColor"
          strokeWidth="0.2"
          className="text-pink-500 dark:text-pink-400"
          fill="none"
        />
        <path
          d="M21 30 Q6 50 12 80"
          stroke="currentColor"
          strokeWidth="0.15"
          className="text-green-500 dark:text-green-400"
          fill="none"
        />
      </svg>
    </div>
  );

  // Animated version for larger screens
  const AnimatedFlow: React.FC = () => (
    <div className={`fixed inset-0 pointer-events-none z-0 ${className}`}>
      {/* Left side animation */}
      <div className="absolute left-0 top-0 w-24 h-full">
        <svg className="w-full h-full" viewBox="0 0 24 100" preserveAspectRatio="none">
          {paths.filter(path => path.side === 'left').map((path, index) => {
            let pathD = '';
            
            if (path.direction === 'vertical') {
              // Vertical paths from top to bottom or bottom to top
              const xPos = 6 + index * 4;
              const reverse = index % 2 === 0;
              pathD = reverse 
                ? `M${xPos} 100 Q${xPos + 3} 75 ${xPos} 50 Q${xPos - 3} 25 ${xPos} 0`
                : `M${xPos} 0 Q${xPos + 3} 25 ${xPos} 50 Q${xPos - 3} 75 ${xPos} 100`;
            } else {
              // Diagonal paths from top-left to center or bottom-left to center
              const reverse = index % 2 === 0;
              pathD = reverse
                ? `M3 100 Q9 75 15 50 Q21 25 18 0`
                : `M3 0 Q9 25 15 50 Q21 75 18 100`;
            }
            
            return (
              <g key={`left-${path.id}`}>
                {/* Glowing trail */}
                <path
                  d={pathD}
                  stroke={path.color}
                  strokeWidth="0.3"
                  fill="none"
                  opacity="0.2"
                  className="animate-pulse"
                  style={{
                    animationDelay: `${path.delay}ms`,
                    animationDuration: `${path.duration}ms`
                  }}
                />
                
                {/* Train of particles - 3 particles per path */}
                {[0, 1, 2].map((particleIndex) => (
                  <circle
                    key={`particle-${particleIndex}`}
                    r="0.6"
                    fill={path.color}
                    opacity="0.8"
                    className="drop-shadow-sm"
                  >
                    <animateMotion
                      dur={`${path.duration}ms`}
                      repeatCount="indefinite"
                      begin={`${path.delay + (particleIndex * path.duration / 6)}ms`}
                      path={pathD}
                    />
                    <animate
                      attributeName="opacity"
                      values="0;0.8;1;0.8;0"
                      dur={`${path.duration}ms`}
                      repeatCount="indefinite"
                      begin={`${path.delay + (particleIndex * path.duration / 6)}ms`}
                    />
                    <animate
                      attributeName="r"
                      values="0.3;0.6;0.8;0.6;0.3"
                      dur={`${path.duration}ms`}
                      repeatCount="indefinite"
                      begin={`${path.delay + (particleIndex * path.duration / 6)}ms`}
                    />
                  </circle>
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Right side animation */}
      <div className="absolute right-0 top-0 w-24 h-full">
        <svg className="w-full h-full" viewBox="0 0 24 100" preserveAspectRatio="none">
          {paths.filter(path => path.side === 'right').map((path, index) => {
            let pathD = '';
            
            if (path.direction === 'vertical') {
              // Vertical paths from top to bottom or bottom to top
              const xPos = 18 - index * 4;
              const reverse = index % 2 === 0;
              pathD = reverse 
                ? `M${xPos} 100 Q${xPos - 3} 75 ${xPos} 50 Q${xPos + 3} 25 ${xPos} 0`
                : `M${xPos} 0 Q${xPos - 3} 25 ${xPos} 50 Q${xPos + 3} 75 ${xPos} 100`;
            } else {
              // Diagonal paths from top-right to center or bottom-right to center
              const reverse = index % 2 === 0;
              pathD = reverse
                ? `M21 100 Q15 75 9 50 Q3 25 6 0`
                : `M21 0 Q15 25 9 50 Q3 75 6 100`;
            }
            
            return (
              <g key={`right-${path.id}`}>
                {/* Glowing trail */}
                <path
                  d={pathD}
                  stroke={path.color}
                  strokeWidth="0.3"
                  fill="none"
                  opacity="0.2"
                  className="animate-pulse"
                  style={{
                    animationDelay: `${path.delay}ms`,
                    animationDuration: `${path.duration}ms`
                  }}
                />
                
                {/* Train of particles - 3 particles per path */}
                {[0, 1, 2].map((particleIndex) => (
                  <circle
                    key={`particle-${particleIndex}`}
                    r="0.6"
                    fill={path.color}
                    opacity="0.8"
                    className="drop-shadow-sm"
                  >
                    <animateMotion
                      dur={`${path.duration}ms`}
                      repeatCount="indefinite"
                      begin={`${path.delay + (particleIndex * path.duration / 6)}ms`}
                      path={pathD}
                    />
                    <animate
                      attributeName="opacity"
                      values="0;0.8;1;0.8;0"
                      dur={`${path.duration}ms`}
                      repeatCount="indefinite"
                      begin={`${path.delay + (particleIndex * path.duration / 6)}ms`}
                    />
                    <animate
                      attributeName="r"
                      values="0.3;0.6;0.8;0.6;0.3"
                      dur={`${path.duration}ms`}
                      repeatCount="indefinite"
                      begin={`${path.delay + (particleIndex * path.duration / 6)}ms`}
                    />
                  </circle>
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Subtle corner glows - only on sides */}
      <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-teal-500/8 to-transparent rounded-full blur-xl animate-pulse" 
           style={{ animationDuration: '8s' }} />
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-violet-500/8 to-transparent rounded-full blur-xl animate-pulse" 
           style={{ animationDuration: '9s', animationDelay: '2s' }} />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-500/8 to-transparent rounded-full blur-xl animate-pulse" 
           style={{ animationDuration: '7s', animationDelay: '4s' }} />
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-pink-500/8 to-transparent rounded-full blur-xl animate-pulse" 
           style={{ animationDuration: '10s', animationDelay: '1s' }} />
    </div>
  );

  return isMobile ? <StaticFallback /> : <AnimatedFlow />;
};

export default SideAnimation;

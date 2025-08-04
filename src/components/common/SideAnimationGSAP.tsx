'use client'

import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

interface SideAnimationProps {
  className?: string;
}

interface BeadPath {
  id: string;
  pathData: string;
  beadCount: number;
  duration: number;
  color: string;
  side: 'left' | 'right';
}

/**
 * Enhanced SideAnimation Component with GSAP Bead Tracing
 * 
 * Features:
 * - GSAP-powered bead animations with enhanced easing
 * - Infinite loop with smooth transitions
 * - Interactive easter egg on click
 * - White/silver color scheme with smooth gradients
 */
export const SideAnimationGSAP: React.FC<SideAnimationProps> = ({ className = '' }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isEasterEggActive, setIsEasterEggActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const beadPaths: BeadPath[] = [
    {
      id: 'left-1',
      pathData: 'M6 0 Q12 25 6 50 Q3 75 6 100',
      beadCount: 4,
      duration: 8,
      color: 'rgba(255, 255, 255, 0.8)',
      side: 'left'
    },
    {
      id: 'left-2',
      pathData: 'M18 0 Q12 25 18 50 Q21 75 18 100',
      beadCount: 3,
      duration: 10,
      color: 'rgba(248, 250, 252, 0.7)',
      side: 'left'
    },
    {
      id: 'left-3',
      pathData: 'M3 20 Q18 40 12 70 Q6 90 15 100',
      beadCount: 2,
      duration: 12,
      color: 'rgba(241, 245, 249, 0.6)',
      side: 'left'
    },
    {
      id: 'right-1',
      pathData: 'M18 0 Q12 25 18 50 Q21 75 18 100',
      beadCount: 4,
      duration: 9,
      color: 'rgba(226, 232, 240, 0.6)',
      side: 'right'
    },
    {
      id: 'right-2',
      pathData: 'M6 0 Q12 25 6 50 Q3 75 6 100',
      beadCount: 3,
      duration: 11,
      color: 'rgba(203, 213, 225, 0.5)',
      side: 'right'
    },
    {
      id: 'right-3',
      pathData: 'M21 30 Q6 50 12 80 Q18 95 9 100',
      beadCount: 2,
      duration: 13,
      color: 'rgba(148, 163, 184, 0.4)',
      side: 'right'
    }
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile || typeof window === 'undefined') return;

    // Initialize GSAP timeline for enhanced easing
    timelineRef.current = gsap.timeline({ repeat: -1 });

    // Add enhanced scale and opacity animations to beads
    const beadElements = document.querySelectorAll('.bead-element');
    beadElements.forEach((bead, index) => {
      // Create staggered pulsing effect
      gsap.to(bead, {
        scale: 1.2,
        opacity: 0.9,
        duration: 2,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
        delay: index * 0.2,
      });
    });

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [isMobile]);

  const triggerEasterEgg = () => {
    if (isEasterEggActive || !timelineRef.current) return;

    setIsEasterEggActive(true);

    // Create falling beads effect
    const beadElements = document.querySelectorAll('.bead-element');
    beadElements.forEach((bead, index) => {
      if (Math.random() > 0.6) { // 40% chance to fall
        gsap.to(bead, {
          y: "200px",
          x: `${(Math.random() - 0.5) * 100}px`,
          rotation: 360,
          opacity: 0,
          scale: 0.5,
          duration: 2,
          ease: "power2.in",
          delay: index * 0.1,
        });
      }
    });

    // Speed up existing animations
    gsap.globalTimeline.timeScale(2);

    // Reset after 3 seconds
    setTimeout(() => {
      setIsEasterEggActive(false);
      gsap.globalTimeline.timeScale(1);
      
      // Reset bead positions
      beadElements.forEach((bead) => {
        gsap.set(bead, {
          y: 0,
          x: 0,
          rotation: 0,
          opacity: 1,
          scale: 1,
        });
      });
    }, 3000);
  };

  // Static fallback for mobile
  const StaticFallback: React.FC = () => (
    <div className={`fixed inset-0 pointer-events-none z-0 ${className}`}>
      <svg className="absolute left-0 top-0 h-full w-24 opacity-20 dark:opacity-10" viewBox="0 0 24 100">
        <path d="M6 0 Q12 25 6 50 Q3 75 6 100" stroke="rgba(255,255,255,0.3)" strokeWidth="0.2" fill="none" />
        <path d="M18 0 Q12 25 18 50 Q21 75 18 100" stroke="rgba(248,250,252,0.3)" strokeWidth="0.2" fill="none" />
      </svg>
      <svg className="absolute right-0 top-0 h-full w-24 opacity-20 dark:opacity-10" viewBox="0 0 24 100">
        <path d="M18 0 Q12 25 18 50 Q21 75 18 100" stroke="rgba(241,245,249,0.3)" strokeWidth="0.2" fill="none" />
        <path d="M6 0 Q12 25 6 50 Q3 75 6 100" stroke="rgba(226,232,240,0.3)" strokeWidth="0.2" fill="none" />
      </svg>
    </div>
  );

  // Enhanced animated version with GSAP effects
  const AnimatedFlow: React.FC = () => (
    <div 
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      onClick={triggerEasterEgg}
      style={{ pointerEvents: 'auto', cursor: 'pointer' }}
    >
      {/* Left side */}
      <div className="absolute left-0 top-0 w-24 h-full">
        <svg className="w-full h-full" viewBox="0 0 24 100" preserveAspectRatio="none">
          {beadPaths.filter(path => path.side === 'left').map((path) => (
            <g key={path.id}>
              {/* Enhanced glowing trail */}
              <path
                d={path.pathData}
                stroke={path.color}
                strokeWidth="0.5"
                fill="none"
                opacity="0.3"
                style={{
                  filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.3))',
                }}
              />
              
              {/* Enhanced beads with SVG animation + GSAP enhancement */}
              {Array.from({ length: path.beadCount }, (_, index) => (
                <circle
                  key={`${path.id}-bead-${index}`}
                  className="bead-element"
                  r="1.5"
                  fill={path.color}
                  style={{
                    filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.6))',
                  }}
                >
                  <animateMotion
                    dur={`${path.duration}s`}
                    repeatCount="indefinite"
                    begin={`${index * (path.duration / path.beadCount)}s`}
                    path={path.pathData}
                    keyTimes="0;0.5;1"
                    keySplines="0.4 0 0.6 1;0.4 0 0.6 1"
                    calcMode="spline"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;1;0.8;1;0"
                    dur={`${path.duration}s`}
                    repeatCount="indefinite"
                    begin={`${index * (path.duration / path.beadCount)}s`}
                    keyTimes="0;0.2;0.5;0.8;1"
                    keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"
                    calcMode="spline"
                  />
                  <animate
                    attributeName="r"
                    values="0.5;1.5;2;1.5;0.5"
                    dur={`${path.duration}s`}
                    repeatCount="indefinite"
                    begin={`${index * (path.duration / path.beadCount)}s`}
                    keyTimes="0;0.2;0.5;0.8;1"
                    keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"
                    calcMode="spline"
                  />
                </circle>
              ))}
            </g>
          ))}
        </svg>
      </div>

      {/* Right side */}
      <div className="absolute right-0 top-0 w-24 h-full">
        <svg className="w-full h-full" viewBox="0 0 24 100" preserveAspectRatio="none">
          {beadPaths.filter(path => path.side === 'right').map((path) => (
            <g key={path.id}>
              {/* Enhanced glowing trail */}
              <path
                d={path.pathData}
                stroke={path.color}
                strokeWidth="0.5"
                fill="none"
                opacity="0.3"
                style={{
                  filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.3))',
                }}
              />
              
              {/* Enhanced beads with SVG animation + GSAP enhancement */}
              {Array.from({ length: path.beadCount }, (_, index) => (
                <circle
                  key={`${path.id}-bead-${index}`}
                  className="bead-element"
                  r="1.5"
                  fill={path.color}
                  style={{
                    filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.6))',
                  }}
                >
                  <animateMotion
                    dur={`${path.duration}s`}
                    repeatCount="indefinite"
                    begin={`${index * (path.duration / path.beadCount)}s`}
                    path={path.pathData}
                    keyTimes="0;0.5;1"
                    keySplines="0.4 0 0.6 1;0.4 0 0.6 1"
                    calcMode="spline"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;1;0.8;1;0"
                    dur={`${path.duration}s`}
                    repeatCount="indefinite"
                    begin={`${index * (path.duration / path.beadCount)}s`}
                    keyTimes="0;0.2;0.5;0.8;1"
                    keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"
                    calcMode="spline"
                  />
                  <animate
                    attributeName="r"
                    values="0.5;1.5;2;1.5;0.5"
                    dur={`${path.duration}s`}
                    repeatCount="indefinite"
                    begin={`${index * (path.duration / path.beadCount)}s`}
                    keyTimes="0;0.2;0.5;0.8;1"
                    keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"
                    calcMode="spline"
                  />
                </circle>
              ))}
            </g>
          ))}
        </svg>
      </div>

      {/* Enhanced corner glows with GSAP-powered animations */}
      <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-xl" />
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-100/8 to-transparent rounded-full blur-xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-slate-200/8 to-transparent rounded-full blur-xl" />
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-slate-300/8 to-transparent rounded-full blur-xl" />
    </div>
  );

  return isMobile ? <StaticFallback /> : <AnimatedFlow />;
};

export default SideAnimationGSAP;

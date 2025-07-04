import React from 'react';

interface DrawingCheckmarkProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
  delay?: number;
}

export const DrawingCheckmark: React.FC<DrawingCheckmarkProps> = ({
  size = 96,
  className = '',
  strokeWidth = 6,
  delay = 0
}) => {
  const circleRadius = (size - strokeWidth) / 2;
  const checkPath = `M${size * 0.25},${size * 0.5} L${size * 0.4},${size * 0.65} L${size * 0.75},${size * 0.35}`;
  
  return (
    <div className={`inline-block ${className}`} style={{ animationDelay: `${delay}ms` }}>
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className="transform"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={circleRadius}
          fill="rgb(34, 197, 94)" // green-500
          fillOpacity="0.1"
          className="animate-fade-scale"
          style={{ animationDelay: `${delay}ms` }}
        />
        
        {/* Drawing circle border */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={circleRadius}
          fill="none"
          stroke="rgb(34, 197, 94)" // green-500
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="animate-circle-draw"
          style={{ 
            animationDelay: `${delay + 200}ms`,
            strokeDasharray: `${2 * Math.PI * circleRadius}`,
            strokeDashoffset: `${2 * Math.PI * circleRadius}`
          }}
        />
        
        {/* Drawing checkmark */}
        <path
          d={checkPath}
          fill="none"
          stroke="rgb(34, 197, 94)" // green-500
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-checkmark"
          style={{ 
            animationDelay: `${delay + 800}ms`,
            strokeDasharray: 100,
            strokeDashoffset: 100
          }}
        />
      </svg>
    </div>
  );
};

import React from 'react';

export function GridPattern({ squares = [], className = '', ...props }) {
  const patternId = React.useId();
  
  // Default grid configuration
  const gridSize = 50;
  const strokeWidth = 1;
  const strokeColor = 'rgba(166, 156, 172, 0.2)'; // #A69CAC with transparency
  
  // Create SVG pattern with squares
  const squaresMap = new Map();
  squares.forEach(([x, y]) => {
    squaresMap.set(`${x}-${y}`, true);
  });
  
  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
      {...props}
    >
      <svg
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          inset: 0,
        }}
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id={patternId}
            x="0"
            y="0"
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            {/* Grid lines */}
            <path
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        
        {/* Render filled squares */}
        {squares.map(([x, y], index) => (
          <rect
            key={`${x}-${y}-${index}`}
            x={x * gridSize}
            y={y * gridSize}
            width={gridSize}
            height={gridSize}
            fill="rgba(166, 156, 172, 0.1)"
          />
        ))}
      </svg>
    </div>
  );
}


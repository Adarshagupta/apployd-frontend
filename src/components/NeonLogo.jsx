import React from 'react';

const NeonLogo = ({ width = '120', height = '40', ...props }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 120 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="neon-gradient" x1="0" y1="0" x2="120" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#a259ff" />
        <stop offset="0.5" stopColor="#00dbde" />
        <stop offset="1" stopColor="#ff6aee" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="116" height="36" rx="12" fill="url(#neon-gradient)" opacity="0.15" />
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      dominantBaseline="middle"
      fontFamily="Inter, Arial, sans-serif"
      fontWeight="bold"
      fontSize="18"
      fill="url(#neon-gradient)"
      opacity="0.7"
    >
      Apployd DB
    </text>
  </svg>
);

export default NeonLogo; 
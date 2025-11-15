import React from 'react';

// Main reusable component
export function SegmentedProgress({ 
  percentage = 40, 
  size = 384, // default 96 * 4 (w-96)
  bgColor = "bg-blue-600",
  segmentColor = "white",
  textColor = "text-white",
  fontSize = "text-8xl"
}) {
  // Calculate rotation for filled segments
  const filledSegments = Math.floor((percentage / 100) * 40);
  
  return (
    <div className="relative" style={{ width: size, height: size, backgroundColor: bgColor }}>
      <svg
        className="w-full h-full"
        viewBox="0 0 200 200"
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r="70"
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="20"
        />
        
        {/* Segment 1 (top) */}
        <circle
          cx="100"
          cy="100"
          r="70"
          fill="none"
          stroke={filledSegments >= 1 ? segmentColor : "rgba(255, 255, 255, 0.2)"}
          strokeWidth="20"
          strokeDasharray="35 405"
          strokeDashoffset="0"
          strokeLinecap="round"
        />
        
        {/* Segment 2 (right) */}
        <circle
          cx="100"
          cy="100"
          r="70"
          fill="none"
          stroke={filledSegments >= 2 ? segmentColor : "rgba(255, 255, 255, 0.2)"}
          strokeWidth="20"
          strokeDasharray="35 405"
          strokeDashoffset="-110"
          strokeLinecap="round"
        />
        
        {/* Segment 3 (bottom) */}
        <circle
          cx="100"
          cy="100"
          r="70"
          fill="none"
          stroke={filledSegments >= 3 ? segmentColor : "rgba(255, 255, 255, 0.2)"}
          strokeWidth="20"
          strokeDasharray="35 405"
          strokeDashoffset="-220"
          strokeLinecap="round"
        />
        
        {/* Segment 4 (left) */}
        <circle
          cx="100"
          cy="100"
          r="70"
          fill="none"
          stroke={filledSegments >= 4 ? segmentColor : "rgba(255, 255, 255, 0.2)"}
          strokeWidth="20"
          strokeDasharray="35 405"
          strokeDashoffset="-330"
          strokeLinecap="round"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className={`${textColor} ${fontSize} font-bold tracking-tight`}>
            {percentage}%
          </div>
        </div>
      </div>
    </div>
  );
}

// Demo showing both examples
export default function App() {
  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Blue version (40%) */}
      <div className="flex items-center justify-center min-h-screen bg-blue-600">
        <SegmentedProgress 
          percentage={40}
          size={384}
          bgColor="bg-blue-600"
          segmentColor="white"
          textColor="text-white"
          fontSize="text-8xl"
        />
      </div>
      
      {/* Orange version (100%) */}
      <div className="flex items-center justify-center min-h-screen bg-orange-500">
        <SegmentedProgress 
          percentage={100}
          size={384}
          bgColor="bg-orange-500"
          segmentColor="white"
          textColor="text-white"
          fontSize="text-8xl"
        />
      </div>
    </div>
  );
}
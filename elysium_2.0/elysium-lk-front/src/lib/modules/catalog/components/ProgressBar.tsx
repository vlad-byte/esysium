import React from "react";

interface ProgressBarProps {
  percent: number;
  colorClass: string;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percent, colorClass, className = "" }) => (
  <div className={`w-full h-2 bg-gray-100 rounded-full ${className}`}>
    <div
      className={`h-2 rounded-full transition-all duration-300 ${colorClass}`}
      style={{ width: `${percent}%` }}
    />
  </div>
);

export default ProgressBar; 
import React from "react";

interface BackButtonProps {
  onClick: () => void;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, className = "" }) => (
  <button
    className={`fixed top-4 left-16 md:top-6 md:left-72 z-20 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/90 text-blue-700 font-semibold shadow hover:bg-blue-50 hover:shadow-lg transition custom-cursor border border-blue-100 ${className}`}
    onClick={onClick}
  >
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
    Вернуться
  </button>
);

export default BackButton; 
import React from "react";

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, children, className = "" }) => (
  <button
    className={`px-4 py-2 rounded-t-lg font-semibold text-sm transition cursor-pointer custom-cursor hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-100 focus:text-blue-800 ${isActive ? 'bg-white text-blue-700 shadow' : 'bg-gray-100 text-gray-500'} ${className}`}
    onClick={onClick}
  >
    {children}
  </button>
);

export default TabButton; 
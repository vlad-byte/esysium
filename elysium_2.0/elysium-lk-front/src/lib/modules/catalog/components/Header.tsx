import React from "react";

const Header: React.FC = () => (
  <header className="flex items-center justify-between px-10 py-6 border-b border-blue-900/40 bg-black/40 backdrop-blur-md sticky top-0 z-10">
    <div className="flex items-center gap-3">
      <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent tracking-tight">Elysium</span>
      <span className="ml-2 text-base text-white/60 font-mono">Основные категории</span>
    </div>
    <div className="flex items-center gap-4">
    </div>
  </header>
);

export default Header; 
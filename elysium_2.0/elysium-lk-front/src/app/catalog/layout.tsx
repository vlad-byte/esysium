"use client";

import { useState, PropsWithChildren } from "react";
import Sidebar from "../../lib/modules/catalog/components/Sidebar";
import { AuthDrawer } from "@/lib/components/AuthDrawer";

function BurgerButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="md:hidden fixed top-4 left-4 z-30 p-2 bg-white rounded-full shadow-lg border border-gray-200 focus:outline-none"
      onClick={onClick}
      aria-label="Открыть меню"
    >
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
        <rect x="4" y="6" width="16" height="2" rx="1" fill="#37352f" />
        <rect x="4" y="11" width="16" height="2" rx="1" fill="#37352f" />
        <rect x="4" y="16" width="16" height="2" rx="1" fill="#37352f" />
      </svg>
    </button>
  );
}

export default function Layout({ children }: PropsWithChildren<{}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-white relative">
      {/* Sidebar desktop */}
      <Sidebar onAuthClick={() => setAuthOpen(true)} />
      
      {/* Sidebar mobile */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed top-0 left-0 z-40 md:hidden animate-slide-in">
            <Sidebar onClose={() => setSidebarOpen(false)} onAuthClick={() => setAuthOpen(true)} />
          </div>
        </>
      )}
      
      <BurgerButton onClick={() => setSidebarOpen(true)} />
      
      {/* <AuthDrawer open={authOpen} onClose={() => setAuthOpen(false)} /> */}
      
      {/* Main Content */}
      <div className="flex-1 min-h-screen flex flex-col bg-gradient-to-br from-gray-100 via-gray-50 to-white text-gray-900 transition-colors duration-700 w-full md:ml-64">
        {/* Content */}
        <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 md:p-8 w-full pt-16 sm:pt-16 md:pt-8">
          <div className="w-full max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 
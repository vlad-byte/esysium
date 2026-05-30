"use client";
import React, { useState, useEffect, createContext, useContext } from "react";
import { AuthDrawer } from "@/lib/components/AuthDrawer";

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  username: string | null;
  login: (token: string, userId: string, username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const uid = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    const uname = typeof window !== "undefined" ? localStorage.getItem("username") : null;
    if (token && uid && uname) {
      setIsAuthenticated(true);
      setUserId(uid);
      setUsername(uname);
    } else {
      setIsAuthenticated(false);
      setUserId(null);
      setUsername(null);
    }
  }, []);

  const login = (token: string, userId: string, username: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("username", username);
    setIsAuthenticated(true);
    setUserId(userId);
    setUsername(username);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    setIsAuthenticated(false);
    setUserId(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, username, login, logout }}>
      <div className="fixed top-6 right-8 z-50 flex flex-col items-end gap-2">
        <button
          className={`px-4 py-2 rounded shadow font-semibold text-base transition ${
            isAuthenticated 
              ? "bg-white-400 text-gray-600 cursor-default" 
              : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
          }`}
          onClick={() => !isAuthenticated && setDrawerOpen(true)}
          disabled={isAuthenticated}
        >
          {isAuthenticated && username ? `Добро пожаловать, ${username}` : "Войти / Регистрация"}
        </button>
        {isAuthenticated && (
          <button
            className="mt-1 px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-red-500 hover:text-white transition font-semibold text-base shadow border border-gray-200 cursor-pointer"
            onClick={logout}
          >
            Выйти
          </button>
        )}
      </div>
      <AuthDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      {children}
    </AuthContext.Provider>
  );
}; 
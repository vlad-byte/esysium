import React, { useState } from "react";
import { useLoginMutation, useRegisterMutation } from "@/lib/services/api";
import { useAuth } from "@/lib/components/AuthClientProvider";
import { FiUser, FiLock } from "react-icons/fi";

interface AuthDrawerProps {
  open: boolean;
  onClose: () => void;
}

type Mode = "login" | "register";

export const AuthDrawer: React.FC<AuthDrawerProps> = ({ open, onClose }) => {
  const [mode, setMode] = useState<Mode>("login");
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
  const [registerMutation, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "register" && password !== confirm) {
      setError("Пароли не совпадают");
      return;
    }
    try {
      if (mode === "login") {
        const res = await loginMutation({ username: loginValue, password }).unwrap();
        const username = res.username || res.user?.username || loginValue;
        if (res.token) localStorage.setItem("token", res.token);
        if (res.id) localStorage.setItem("userId", res.id.toString());
        if (username) localStorage.setItem("username", username);
        authLogin(res.token, res.id?.toString() || "", username);
        onClose();
      } else {
        const res = await registerMutation({ username: loginValue, password }).unwrap();
        const username = res.username || res.user?.username || loginValue;
        if (res.token) localStorage.setItem("token", res.token);
        if (res.id) localStorage.setItem("userId", res.id.toString());
        if (username) localStorage.setItem("username", username);
        authLogin(res.token, res.id?.toString() || "", username);
        onClose();
      }
    } catch (err: any) {
      setError(err?.data?.detail || "Ошибка авторизации");
    }
  };

  const inputClass =
    "w-full border rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm transition-all duration-200 text-base md:text-lg";

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full max-w-md bg-gradient-to-br from-blue-50 via-white to-violet-50 shadow-2xl z-50 transition-transform duration-300 ease-in-out flex flex-col border-l border-gray-200
        ${open ? "translate-x-0" : "translate-x-full"} md:max-w-md md:border-l md:rounded-l-3xl`}
      style={{ minWidth: undefined }}
    >
      <button
        className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
        onClick={onClose}
        aria-label="Закрыть"
      >
        ×
      </button>
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-6 sm:px-8 md:px-10 md:py-8 w-full">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-100 text-blue-600 rounded-full p-3 mb-2 shadow-md">
            <FiUser size={32} />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-1 tracking-tight text-gray-900">
            {mode === "login" ? "Вход" : "Регистрация"}
          </h2>
          <p className="text-gray-500 text-base mb-2 text-center">
            {mode === "login"
              ? "Войдите в свой аккаунт, чтобы продолжить"
              : "Создайте новый аккаунт для доступа"}
          </p>
        </div>
        <form className="w-full max-w-sm space-y-5" onSubmit={handleSubmit}>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Логин"
              className={inputClass + " pl-10"}
              value={loginValue}
              onChange={e => setLoginValue(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="password"
              placeholder="Пароль"
              className={inputClass + " pl-10"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {mode === "register" && (
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                placeholder="Подтвердите пароль"
                className={inputClass + " pl-10"}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
            </div>
          )}
          {error && <div className="text-red-500 text-sm text-center font-medium mt-2">{error}</div>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white py-3 rounded-xl font-bold text-lg shadow-md hover:from-blue-700 hover:to-violet-700 transition-all duration-200 cursor-pointer"
            disabled={isLoginLoading || isRegisterLoading}
          >
            {isLoginLoading || isRegisterLoading
              ? "Загрузка..."
              : mode === "login"
              ? "Войти"
              : "Зарегистрироваться"}
          </button>
        </form>
        <div className="mt-8 text-sm text-gray-600 text-center">
          {mode === "login" ? (
            <>
              Нет аккаунта?{' '}
              <button className="text-blue-600 hover:underline font-semibold cursor-pointer" onClick={() => setMode("register")}>Зарегистрироваться</button>
            </>
          ) : (
            <>
              Уже есть аккаунт?{' '}
              <button className="text-blue-600 hover:underline font-semibold cursor-pointer" onClick={() => setMode("login")}>Войти</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 
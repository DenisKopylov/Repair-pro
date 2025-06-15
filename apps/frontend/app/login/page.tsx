// apps/frontend/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg("Пожалуйста, заполните все поля.");
      return;
    }

    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        // сохраняем JWT в localStorage (или в cookie, как вам удобнее)
        localStorage.setItem("token", data.token);
        // после успешного входа перенаправляем на главную (или на личный кабинет)
        router.push("/");
      } else {
        setErrorMsg(data.error || "Неверные учётные данные.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Сетевая ошибка. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold text-stone-800 mb-6 text-center">
          Вход
        </h1>

        {errorMsg && (
          <div className="mb-4 text-red-600 text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Поле: Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-stone-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="example@domain.com"
            />
          </div>

          {/* Поле: Пароль */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-stone-700"
            >
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Ваш пароль"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-base font-semibold text-white 
              ${
                loading
                ? "bg-primary-50 cursor-not-allowed"
                : "bg-primary-500 hover:bg-primary-600"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition`}
          >
            {loading ? "Входим..." : "Войти"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-stone-600">
          Ещё нет аккаунта?{" "}
          <Link href="/register" className="text-primary-500 hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </main>
  );
}
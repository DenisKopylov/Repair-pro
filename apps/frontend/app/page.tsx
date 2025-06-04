/*  Главная страница (RU). Mobile‑first, TailwindCSS only */
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";

export default function Home() {
  /* -------------------- Данные -------------------- */
  const parts = [
    { label: "Генератор", img: "generator" },
    { label: "Стартер", img: "starter" },
    { label: "ТНВД", img: "fuel pump" },
    { label: "Форсунки", img: "injector" },
    { label: "Гидроцилиндр", img: "hydraulic cylinder" },
    { label: "Гидрораспределитель", img: "hydraulic valve" },
    { label: "Гидронасос", img: "hydraulic pump" },
    { label: "Гидромотор", img: "hydraulic motor" },
  ];

  const steps = [
    {
      n: 1,
      title: "Создать заявку",
      desc: "Заполните короткую форму с данными детали и описанием неисправности.",
    },
    {
      n: 2,
      title: "Отправить деталь",
      desc: "Надёжно упакуйте и передайте нам деталь удобным способом.",
    },
    {
      n: 3,
      title: "Подтверждение условий",
      desc: "Мы выставим цену дефектовки, цену ремонта и срок. Вы можете согласиться или отказаться.",
    },
    {
      n: 4,
      title: "Обратная доставка",
      desc: "Получите отремонтированную деталь обратно в сервис‑центр.",
    },
  ];

  /* -------------------- Состояние бургер‑меню -------------------- */
  const [open, setOpen] = useState(false);

  return (
    <main className="flex flex-col min-h-screen font-sans">
      {/* Top‑bar с логотипом и бургером */}
      <header className="fixed inset-x-0 top-0 z-20 h-12 flex items-center justify-between bg-white/70 backdrop-blur-sm px-4 shadow-sm sm:px-6">
        <Link href="/" className="font-semibold text-sm">RepairParts</Link>
        <button
          aria-label="Меню"
          onClick={() => setOpen(!open)}
          className="p-2 -m-2 text-stone-700 sm:hidden"
        >
          <Menu size={20} />
        </button>
        {/* Desktop nav */}
        <nav className="hidden sm:flex gap-6 text-sm">
          <Link href="/new-order" className="hover:text-orange-600">Создать заказ</Link>
          <Link href="/orders" className="hover:text-orange-600">Мои заказы</Link>
          <a href="#parts" className="hover:text-orange-600">Детали</a>
        </nav>
        {/* Mobile drawer */}
        {open && (
          <nav className="absolute top-12 left-0 right-0 bg-white shadow-md flex flex-col p-4 gap-3 text-sm sm:hidden">
            <Link href="/new-order" onClick={() => setOpen(false)}>Создать заказ</Link>
            <Link href="/orders" onClick={() => setOpen(false)}>Мои заказы</Link>
            <a href="#parts" onClick={() => setOpen(false)}>Детали</a>
          </nav>
        )}
      </header>

      {/* spacer для header */}
      <div className="h-12" />

      {/* Hero */}
      <section className="relative h-80 sm:h-[420px] w-full overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1600&q=60"
          alt="Запчасть"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4 text-center space-y-4">
          <h1 className="text-2xl sm:text-4xl font-bold leading-tight max-w-lg">
            Отправляйте детали в&nbsp;ремонт с&nbsp;уверенностью
          </h1>
          <p className="max-w-md text-sm sm:text-base">
            Мы бережно проверим, отремонтируем и&nbsp;доставим обратно в&nbsp;сжатые сроки.
          </p>
          <Link
            href="/new-order"
            className="bg-orange-500 hover:bg-orange-600 transition rounded-md px-6 py-2 text-sm font-semibold shadow-md"
          >
            Создать заказ
          </Link>
        </div>
      </section>

      {/* Supported parts */}
      <section id="parts" className="max-w-5xl w-full mx-auto px-4 py-10">
        <h2 className="text-lg sm:text-xl font-semibold mb-6">Поддерживаемые детали</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {parts.map(({ label, img }) => (
            <div key={label} className="flex flex-col items-center text-center">
              <div className="aspect-square w-full rounded-lg border flex items-center justify-center bg-white p-2 shadow-sm">
                <Image
                  src={`https://source.unsplash.com/80x80/?${img}`}
                  alt={label}
                  width={64}
                  height={64}
                />
              </div>
              <span className="mt-2 text-xs font-medium">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-12">
        <h2 className="text-center text-lg sm:text-xl font-semibold mb-10">
          Как это работает
        </h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
          {steps.map(({ n, title, desc }) => (
            <div key={n} className="flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-lg">
                {n}
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-balance">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 max-w-xs">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-200 px-6 py-10 mt-auto text-sm">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-8">
          <div>
            <h4 className="font-semibold mb-2">RepairParts</h4>
            <p className="text-xs text-stone-400">
              Сервис ремонта автозапчастей для сервис‑центров.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Быстрые ссылки</h4>
            <ul className="space-y-1">
              <li><Link href="/new-order" className="hover:underline">Создать заказ</Link></li>
              <li><Link href="/orders" className="hover:underline">Мои заказы</Link></li>
              <li><a href="#parts" className="hover:underline">Детали&nbsp;для&nbsp;ремонта</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Поддержка</h4>
            <ul className="space-y-1 text-balance">
              <li><a href="#contact" className="hover:underline">Связаться с нами</a></li>
              <li><a href="#faq" className="hover:underline">FAQ</a></li>
              <li><a href="#privacy" className="hover:underline">Политика конфиденциальности</a></li>
              <li><a href="#terms" className="hover:underline">Условия сервиса</a></li>
            </ul>
          </div>
        </div>
        <div className="text-center text-xs text-stone-500 mt-10">
          © 2024 RepairParts. Все права защищены.
        </div>
      </footer>
    </main>
  );
}

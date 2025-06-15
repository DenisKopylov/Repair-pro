// apps/frontend/app/admin/orders/page.tsx

"use client";

import { ReactElement } from "react";
import { useState, useMemo, ChangeEvent } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  Loader2,
  ShieldCheck,
  Sparkles,
  XCircle,
  Clock3,
  CheckCircle,
} from "lucide-react";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((r) => r.json());

/** Цвет бейджа по статусу */
const badgeColor: Record<string, string> = {
  NEW: "bg-stone-200 text-stone-700",
  OFFERED: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-primary-50 text-primary-600",
  DONE: "bg-green-100 text-green-700",
  DECLINED: "bg-stone-300 text-stone-600",
};

/** Иконка по статусу */
const statusIcon: Record<string, ReactElement> = {
  NEW: <Sparkles size={16} />,
  OFFERED: <Clock3 size={16} />,
  IN_PROGRESS: <Clock3 size={16} />,
  DONE: <CheckCircle size={16} />,
  DECLINED: <XCircle size={16} />,
  // Add a default icon for any other status
  DEFAULT: <Clock3 size={16} />,
};

/** Доступные статусы для фильтра */
const statusOptions = [
  { value: "", label: "Все статусы" },
  { value: "NEW", label: "Новый" },
  { value: "OFFERED", label: "Ожидает решения" },
  { value: "DECLINED", label: "Отказ" },
  { value: "CONFIRMED", label: "Подтверждён" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "DONE", label: "Готов" },
];

/** Доступные типы деталей для фильтра */
const partOptions = [
  { value: "", label: "Все детали" },
  { value: "Генератор", label: "Генератор" },
  { value: "Стартер", label: "Стартер" },
  { value: "ТНВД", label: "ТНВД" },
  { value: "Форсунки", label: "Форсунки" },
  { value: "Гидроцилиндр", label: "Гидроцилиндр" },
  { value: "Гидрораспределитель", label: "Гидрораспределитель" },
  { value: "Гидронасос", label: "Гидронасос" },
  { value: "Гидромотор", label: "Гидромотор" },
];

export default function AdminOrders() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [partType, setPartType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Собираем строку запроса для SWR
  const queryString = useMemo(() => {
    const params = new URLSearchParams({ all: "true" });

    if (search.trim()) params.set("search", search.trim());
    if (status)       params.set("status", status);
    if (partType)     params.set("partType", partType);
    if (fromDate)     params.set("from", fromDate);
    if (toDate)       params.set("to", toDate);

    return `/orders?${params.toString()}`;
  }, [search, status, partType, fromDate, toDate]);

  const { data: orders, isLoading } = useSWR(queryString, fetcher);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
  };
  const handlePartChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPartType(e.target.value);
  };
  const handleFromChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFromDate(e.target.value);
  };
  const handleToChange = (e: ChangeEvent<HTMLInputElement>) => {
    setToDate(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center mt-20">
        <Loader2 className="animate-spin text-stone-500" />
      </div>
    );
  }

  return (
    <main className="p-4 pb-24 max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <ShieldCheck size={18} /> Заказы сервис-центров
      </h1>

      {/* ——— Фильтры и поиск ——— */}
      <div className="space-y-3 mb-6">
        {/* Строка поиска */}
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Поиск по названию сервиса или ID"
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
        />

        {/* Два селекта в одной строке: статус + деталь */}
        <div className="flex gap-2">
          <select
            value={status}
            onChange={handleStatusChange}
            className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={partType}
            onChange={handlePartChange}
            className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
          >
            {partOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Диапазон дат: from + to */}
        <div className="flex gap-2">
          <input
            type="date"
            value={fromDate}
            onChange={handleFromChange}
            className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
          <input
            type="date"
            value={toDate}
            onChange={handleToChange}
            className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>
      </div>

      {/* ——— Список заказов ——— */}
      {orders?.map((o: any) => (
        <Link
          href={`/admin/orders/${o._id}`}
          key={o._id}
          className="block bg-white shadow rounded-xl p-4 mb-5 ring-1 ring-stone-200 hover:ring-primary-600/60 transition"
        >
          <div className="flex items-start justify-between gap-3">
            {/* левая часть: клиент + тип + дата */}
            <div className="space-y-1">
              <p className="font-medium leading-tight">{o.clientName}</p>
              <p className="text-xs text-gray-500">#{o._id.slice(-6)}</p>
              <p className="text-sm text-stone-700 mt-1">{o.partType}</p>
              <p className="text-xs text-stone-400">
                Создан: {new Date(o.createdAt).toLocaleDateString("ru-RU")}
              </p>
            </div>

            {/* правая часть: статус */}
            <span
              className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${badgeColor[o.status]}`}
            >
              {statusIcon[o.status]}
              {o.status.replace("_", " ")}
            </span>
          </div>
        </Link>
      ))}

      {!orders?.length && (
        <p className="text-center text-stone-500 mt-10">Нет заказов</p>
      )}
    </main>
  );
}
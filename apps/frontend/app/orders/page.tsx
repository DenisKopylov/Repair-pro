/*  Список заказов клиента – мобильная карта  */
"use client";

import { ReactElement } from "react";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import {
  Loader2,
  Package,
  Wrench,
  Sparkles,
  CircleSlash,
  CircleCheck,
  Clock3,
} from "lucide-react";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((r) => r.json());

/* --- вспомогательные мапы ---------------------------------- */
const partIcons: Record<string, ReactElement> = {
  Генератор: <Package className="w-5 h-5" />,
  Стартер: <Package className="w-5 h-5" />,
  "Топливный насос": <Package className="w-5 h-5" />,
  Форсунки: <Sparkles className="w-5 h-5" />,
  Гидронасос: <Wrench className="w-5 h-5" />,
  Гидромотор: <Wrench className="w-5 h-5" />,
  Гидроцилиндр: <Wrench className="w-5 h-5" />,
  Гидрораспределитель: <Wrench className="w-5 h-5" />,
};

const statusColor: Record<string, string> = {
  NEW: "bg-orange-100 text-orange-700",
  OFFERED: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-emerald-100 text-emerald-700",
  DECLINED: "bg-rose-100 text-rose-700",
};

/* --- основной компонент ------------------------------------ */
export default function OrdersList() {
  const { data: orders, isLoading } = useSWR("/orders", fetcher);

  if (isLoading) {
    return (
      <div className="flex justify-center pt-20">
        <Loader2 className="animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <main className="pb-28 pt-4 px-4 max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">Мои заказы</h1>

      {/* ---- карта заказа ---- */}
      {orders?.map((o: any) => (
        <Link
          href={`/orders/${o._id}`}
          key={o._id}
          className="block bg-white rounded-xl shadow-sm mb-5 ring-1 ring-stone-200 hover:ring-orange-400/60 transition"
        >
          {/* верхняя строка */}
          <div className="flex items-start gap-3 p-4">
            <div className="shrink-0 rounded-lg bg-orange-50 p-3">
              {partIcons[o.partType] ?? <Package className="w-5 h-5" />}
            </div>
            <div className="grow">
              <p className="font-medium leading-tight">{o.partType}</p>
              <p className="text-xs text-stone-500 line-clamp-1">
                {o.description}
              </p>
              <p className="text-xs text-stone-400 mt-1">
                Создан: {new Date(o.createdAt).toLocaleDateString("ru")}
              </p>
            </div>

            {/* бейдж статуса */}
            <span
              className={`text-[10px] font-medium py-[2px] px-2 rounded-full whitespace-nowrap ${statusColor[o.status]}`}
            >
              {statusRu(o.status)}
            </span>
          </div>

          {/* индикатор прогресса */}
          <div className="px-4">
            <ProgressBar status={o.status} />
          </div>

          {/* кнопка детально */}
          <button
            className="flex items-center justify-center w-full gap-1 text-sm font-semibold py-2 mt-4 bg-stone-900 text-white rounded-b-xl"
            type="button"
          >
            Подробнее
            <CircleCheck className="w-4 h-4 -mr-1" />
          </button>
        </Link>
      ))}

      {!orders?.length && (
        <p className="text-center text-stone-500 mt-12">Пока заказов нет</p>
      )}
    </main>
  );
}

/* --- индикатор прогресса (без «заморозки» для отказа) ---------- */
function ProgressBar({ status }: { status: string }) {
  /** 
   * Проценты для каждого статуса.
   * DECLINED теперь ведёт себя как CONFIRMED — 50% и оранжевый цвет.
   * IN_PROGRESS — 75% и жёлтый цвет.
   */
  const percentMap: Record<string, number> = {
    NEW: 0,
    OFFERED: 25,
    CONFIRMED: 50,
    DECLINED: 50,
    IN_PROGRESS: 75,
    DONE: 100,
  };

  /** 
   * Цвет полосы:
   * - DONE → зелёный
   * - IN_PROGRESS → жёлтый
   * - всё остальное (NEW, OFFERED, CONFIRMED, DECLINED) → оранжевый
   */
  const barColor =
    status === "DONE"
      ? "bg-emerald-500"
      : status === "IN_PROGRESS"
      ? "bg-yellow-400"
      : "bg-orange-500";

  const pct = percentMap[status] ?? 0;

  return (
    <div className="h-2 rounded bg-stone-200 overflow-hidden mb-4">
      <div
        className={`${barColor} h-full transition-all`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* --- перевод статусов на русский (без изменений) -------------- */
function statusRu(code: string) {
  switch (code) {
    case "NEW":
      return "Новый";
    case "OFFERED":
      return "Ожидает решения";
    case "CONFIRMED":
      return "Подтверждён";
    case "DECLINED":
      return "Отказ";
    case "IN_PROGRESS":
      return "В работе";
    case "DONE":
      return "Готов";
    default:
      return code;
  }
}


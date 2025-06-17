"use client";

import useSWR from "swr";
import { Loader2, BarChart3 } from "lucide-react";

type Stats = {
  partTypeCounts: Record<string, number>;
  totals: {
    repairPrice: number;
    defectPrice: number;
    internalPrice: number;
  };
  partnerStats: Record<string, { count: number; total: number }>;
};

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((r) => r.json());

export default function AdminStats() {
  const { data, isLoading } = useSWR<Stats>("/stats", fetcher);
  
  if (isLoading) {
    return (
      <div className="flex justify-center mt-20">
        <Loader2 className="animate-spin text-stone-500" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <main className="p-4 pb-24 max-w-md mx-auto space-y-6">
      <h1 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <BarChart3 size={18} /> Статистика
      </h1>

      <section>
        <h2 className="font-medium mb-2">Заказы по категориям</h2>
        <ul className="space-y-1">
          {Object.entries(data.partTypeCounts).map(([type, count]) => (
            <li key={type} className="text-sm flex justify-between">
              <span>{type}</span>
              <span className="font-medium">{count}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-medium mb-2">Суммы</h2>
        <ul className="space-y-1 text-sm">
          <li className="flex justify-between">
            <span>Ремонт</span>
            <span className="font-medium">{data.totals.repairPrice} ₽</span>
          </li>
          <li className="flex justify-between">
            <span>Дефектовка</span>
            <span className="font-medium">{data.totals.defectPrice} ₽</span>
          </li>
          <li className="flex justify-between">
            <span>Внутренняя цена</span>
            <span className="font-medium">{data.totals.internalPrice}</span>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-medium mb-2">Партнёры</h2>
        <ul className="space-y-1 text-sm">
          {Object.entries(data.partnerStats).map(([name, s]: any) => (
            <li key={name} className="flex justify-between">
              <span>
                {name} ({s.count})
              </span>
              <span className="font-medium">{s.total} ₽</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
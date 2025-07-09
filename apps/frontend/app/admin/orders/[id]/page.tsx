// apps/frontend/app/admin/orders/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Loader2,
  ArrowLeft,
  Camera,
  Wrench,
  Clock3,
  EyeOff,
} from "lucide-react";

const fetcher = (url: string) =>
  import("../../../../lib/fetchWithAuth").then(({ fetchWithAuth }) =>
    fetchWithAuth(url, { cache: "no-store" }).then((r) => r.json())
  );

export default function AdminOrderEdit() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: order, isLoading } = useSWR(`/orders/${id}`, fetcher);

  const [defectPrice, setDefectPrice] = useState<string>("");
  const [repairPrice, setRepairPrice] = useState<string>("");
  const [workHours, setWorkHours] = useState<string>("");
  const [internalCost, setInternalCost] = useState<string>("");

  // Когда загрузится заказ, заполняем поля
  useEffect(() => {
    if (order) {
      setDefectPrice(order.defectPrice?.toString() ?? "");
      setRepairPrice(order.repairPrice?.toString() ?? "");
      setWorkHours(order.workHours?.toString() ?? "");
      // Для internalCost предположим, что это отдельное поле в order (например, order.internalCost)
      setInternalCost(order.internalCost?.toString() ?? "");
    }
  }, [order]);

  const save = async () => {
    const { fetchWithAuth } = await import("../../../../lib/fetchWithAuth");
    await fetchWithAuth(`/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        defectPrice: Number(defectPrice),
        repairPrice: Number(repairPrice),
        workHours: Number(workHours),
      }),
    });
    router.push("/admin/orders");
  };

  if (isLoading || !order) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-stone-500" size={48} />
      </div>
    );
  }

  return (
    <main className="p-4 max-w-md mx-auto space-y-6">
      {/* Навигационная строка: стрелка назад и заголовок */}
      <div className="flex items-center gap-2">
        <Link href="/admin/orders" className="text-stone-600 hover:text-stone-800">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-semibold">
          Заказ #{order._id.slice(-6)}
        </h1>
      </div>

      {/* Изображение детали */}
      <div>
        <label className="block text-sm font-medium mb-2">Изображение детали</label>
        {order.images && order.images.length > 0 ? (
          <div className="w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={order.images[0]}
              alt="Part Image"
              width={800}
              height={450}
              className="object-cover object-center"
            />
          </div>
        ) : (
          <div className="w-full aspect-video rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
            Нет изображения
          </div>
        )}
      </div>

      {/* Цена дефектовки */}
      <div>
        <label className="block text-sm font-medium mb-1">Цена дефектовки</label>
        <div className="relative rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Camera size={16} />
          </div>
          <input
            type="number"
            value={defectPrice}
            onChange={(e) => setDefectPrice(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="0"
          />
        </div>
      </div>

      {/* Цена ремонта */}
      <div>
        <label className="block text-sm font-medium mb-1">Цена ремонта</label>
        <div className="relative rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Wrench size={16} />
          </div>
          <input
            type="number"
            value={repairPrice}
            onChange={(e) => setRepairPrice(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="0"
          />
        </div>
      </div>

      {/* Время (часы) */}
      <div>
        <label className="block text-sm font-medium mb-1">Время работы (часы)</label>
        <div className="relative rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Clock3 size={16} />
          </div>
          <input
            type="number"
            value={workHours}
            onChange={(e) => setWorkHours(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="0"
          />
        </div>
      </div>

      {/* Внутренняя стоимость (только чтение) */}
      <div>
        <label className="block text-sm font-medium mb-1">Внутренняя стоимость</label>
        <div className="relative rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <EyeOff size={16} />
          </div>
          <input
            type="text"
            value={internalCost}
            disabled
            className="block w-full pl-10 pr-3 py-2 border rounded-md bg-stone-100 text-gray-500 sm:text-sm"
            placeholder="Недоступно"
          />
        </div>
      </div>

      {/* Кнопка Сохранить */}
      <button
        onClick={save}
        className="w-full bg-primary-500 hover:bg-primary-600 text-white rounded-md py-3 text-sm font-semibold transition"
      >
        Сохранить
      </button>
    </main>
  );
}
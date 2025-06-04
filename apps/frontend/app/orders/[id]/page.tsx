// apps/frontend/app/orders/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Loader2, CircleCheck, XCircle } from "lucide-react";

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((r) => r.json());

/** Перевод статусов на русский язык */
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

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: order, isLoading } = useSWR(`/orders/${id}`, fetcher);

  // Состояния локальных значений (если необходимо)
  const [loadingAction, setLoadingAction] = useState(false);

  const accept = async (ok: boolean) => {
    setLoadingAction(true);
    await fetch(`/orders/${id}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok }),
    });
    router.push("/orders");
  };

  if (isLoading || !order) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-stone-400" size={48} />
      </div>
    );
  }

  return (
    <main className="px-4 py-6 max-w-md mx-auto space-y-6">
      {/* Заголовок и подзаголовок */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Заказ #{order._id.slice(-6)}</h1>
        <p className="text-sm text-stone-500">
          Просмотрите условия ремонта и примите решение.
        </p>
      </div>

      {/* Карточка с изображением и основной информацией */}
      <div className="bg-white rounded-xl shadow p-4 space-y-4">
        {/* Изображение детали */}
        <div className="w-full aspect-video bg-gray-100 rounded-md overflow-hidden">
          <Image
            src={order.images?.[0] || "/placeholder.png"}
            alt={order.partType}
            width={800}
            height={450}
            className="object-cover object-center"
          />
        </div>
        <div className="text-center">
          <p className="font-medium">{order.partType}</p>
          {order.model && (
            <p className="text-xs text-stone-500 mt-1">{order.model}</p>
          )}
        </div>
      </div>

      {/* Блок с ценами и сроком */}
      <div className="bg-white rounded-xl shadow p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-stone-600">Цена дефектовки</span>
          <span className="font-medium">
            {order.defectPrice != null ? `${order.defectPrice} ₽` : "—"}
          </span>
        </div>
        <div className="border-t border-stone-200" />
        <div className="flex justify-between text-sm pt-2">
          <span className="text-stone-600">Цена ремонта</span>
          <span className="font-medium">
            {order.repairPrice != null ? `${order.repairPrice} ₽` : "—"}
          </span>
        </div>
        <div className="border-t border-stone-200" />
        <div className="flex justify-between text-sm pt-2">
          <span className="text-stone-600">Срок работы</span>
          <span className="font-medium">
            {order.workHours != null ? `${order.workHours} ч` : "—"}
          </span>
        </div>
      </div>

      {/* Информация по заказу */}
      <div className="bg-white rounded-xl shadow p-4 space-y-2">
        <h2 className="text-sm font-medium">Информация о заказе</h2>
        <div className="flex justify-between text-sm">
          <span className="text-stone-600">Создан</span>
          <span className="font-medium">
            {new Date(order.createdAt).toLocaleDateString("ru", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="border-t border-stone-200" />
        <div className="flex justify-between text-sm pt-2">
          <span className="text-stone-600">Статус</span>
          <span className="inline-flex items-center gap-1 text-xs font-medium py-1 px-2 rounded-full bg-gray-100 text-gray-700">
            {statusRu(order.status)}
          </span>
        </div>
      </div>

      {/* Кнопки «Согласиться» и «Отказаться» */}
      {order.status === "OFFERED" && (
        <div className="space-y-3">
          <button
            disabled={loadingAction}
            onClick={() => accept(true)}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-md py-3 text-sm font-semibold transition"
          >
            {loadingAction ? (
              <Loader2 className="animate-spin text-white" size={16} />
            ) : (
              <CircleCheck size={16} />
            )}
            Согласиться
          </button>
          <button
            disabled={loadingAction}
            onClick={() => accept(false)}
            className="w-full flex items-center justify-center gap-2 border border-red-600 text-red-600 rounded-md py-3 text-sm font-semibold transition"
          >
            {loadingAction ? (
              <Loader2 className="animate-spin text-red-600" size={16} />
            ) : (
              <XCircle size={16} />
            )}
            Отказаться
          </button>
        </div>
      )}
    </main>
  );
}
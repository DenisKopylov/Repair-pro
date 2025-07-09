// apps/frontend/app/new-order/page.tsx
"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UploadCloud, Loader2 } from "lucide-react";

/**
 * Компонент для создания нового заказа с мобильным, многошаговым интерфейсом.
 * Начиная с «Step 1 of 3: Part Details».
 */
export default function NewOrder() {
  const router = useRouter();

  // Локальные состояния
  const [partType, setPartType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Обработчики drag & drop
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  // Обработчик выбора файла через проводник
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Отправка формы (шаг 1 – далее будет многошаговый процесс)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partType) {
      alert("Пожалуйста, выберите тип детали.");
      return;
    }
    if (!file) {
      alert("Пожалуйста, загрузите фото детали.");
      return;
    }
    setUploading(true);

    // Загрузка фото в Firebase Storage
    let imageUrl = "";
    if (file) {
      try {
        // Ленивый импорт, чтобы не выполнять на сервере:
        const { storage } = await import("../../firebaseConfig");
        const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");

        // Если storage === undefined, то бросим ошибку: 
        if (!storage) {
          throw new Error("Firebase Storage не инициализирован");
        }

        // Здесь мы точно знаем, что storage — не undefined:
        const fbStorage = storage; 
        const storageRef = ref(storage, `order-images/${Date.now()}_${file.name}`);
        const snap = await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(snap.ref);
      } catch (err) {
        console.error("Ошибка загрузки фото:", err);
        alert("Не удалось загрузить фото. Попробуйте ещё раз.");
        setUploading(false);
        return;
      }
    }

    // Создание заказа на бэкенде
    try {
      const { fetchWithAuth } = await import("../../lib/fetchWithAuth");
      const res = await fetchWithAuth("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partType,
          description,
          images: [imageUrl || ""],
        }),
      });
      if (!res.ok) throw new Error("Ошибка сервера");
      router.push("/orders");
    } catch (err) {
      console.error(err);
      alert("Не удалось создать заказ. Попробуйте позже.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      {/* Заголовок с кнопкой «назад» */}
      <header className="flex items-center h-12 px-4 bg-white shadow-sm">
        <button
          onClick={() => router.back()}
          className="p-2 -m-2 text-stone-700"
          aria-label="Назад"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold">Новый заказ</h1>
      </header>

      {/* Индикатор шага 1 из 3 */}
      <div className="px-4 pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-stone-700">Step 1 of 3</span>
          <span className="text-sm text-stone-400">Part Details</span>
        </div>
        <div className="w-full h-1 bg-stone-200 rounded-full">
         <div className="w-1/3 h-full bg-primary-500 rounded-full transition-all" />
        </div>
      </div>

      {/* Контент формы */}
      <main className="flex-1 px-4 mt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Поле «Тип детали» */}
          <div className="space-y-1">
            <label htmlFor="partType" className="block text-sm font-medium text-stone-700">
              Тип детали
            </label>
            <select
              id="partType"
              value={partType}
              onChange={(e) => setPartType(e.target.value)}
              className="w-full bg-stone-100 rounded-md border border-transparent focus:border-primary-500 focus:ring-0 px-4 py-3 text-sm text-stone-700"
            >
              <option value="">Выберите тип детали</option>
              <option>Генератор</option>
              <option>Стартер</option>
              <option>Топливный насос</option>
              <option>Форсунки</option>
              <option>Гидрораспределитель</option>
              <option>Гидроцилиндр</option>
              <option>Гидронасос</option>
              <option>Гидромотор</option>
            </select>
          </div>

          {/* Загрузка фото детали */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-700">Фото детали</label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 
                ${
                  dragOver
                    ? "border-primary-600 bg-primary-50"
                    : "border-stone-300 bg-white"
                } transition-colors`}
            >
              <UploadCloud
                size={32}
                className={`${dragOver ? "text-primary-500" : "text-stone-400"}`}
              />
              <p className="mt-2 text-sm text-stone-600 text-center">
                Перетащите фото детали или нажмите «Обзор»
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md px-4 py-2 text-sm font-medium transition"
              >
                Обзор файлов
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            {file && (
              <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                Выбран файл:{" "}
                <span className="font-medium text-stone-700">{file.name}</span>
              </p>
            )}
          </div>

          {/* Поле «Описание проблемы» */}
          <div className="space-y-1">
            <label htmlFor="description" className="block text-sm font-medium text-stone-700">
              Описание
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-stone-100 rounded-md border border-transparent focus:border-primary-500 focus:ring-0 px-4 py-3 text-sm text-stone-700 resize-none"
              placeholder="Чётко опишите проблему с деталью..."
            />
          </div>

          {/* Кнопка «Перейти к следующему шагу» */}
          <button
            type="submit"
            disabled={uploading}
            className={`
              w-full flex items-center justify-center gap-2 bg-primary-500 
              hover:bg-primary-600 text-white rounded-md py-3 text-sm font-semibold transition
              ${uploading ? "opacity-70 cursor-not-allowed" : ""}
            `}
          >
            {uploading ? (
              <Loader2 className="animate-spin text-white" size={20} />
            ) : (
              "Перейти к следующему шагу"
            )}
          </button>
        </form>
      </main>

      {/* Футер с подсказкой */}
      <footer className="px-4 py-3">
        <p className="text-center text-xs text-stone-500">
          Добавьте чёткие фото, чтобы ускорить оценку детали.
        </p>
      </footer>
    </div>
  );
}

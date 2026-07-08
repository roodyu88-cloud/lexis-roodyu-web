"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminReleasesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [fileData, setFileData] = useState("");
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 3000);
  };

  useEffect(() => {
    if (status === "unauthenticated" || (session?.user as any)?.role !== "admin" && (session?.user as any)?.role !== "developer") {
      router.push("/");
    }
  }, [status, session, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4.5 * 1024 * 1024) {
        showToast("Файл слишком большой! Ограничение 4.5 МБ.", "error");
        e.target.value = "";
        return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = (event.target?.result as string).split(",")[1];
        setFileData(base64String);
      };
      reader.readAsDataURL(file);
    } else {
      setFileName("");
      setFileData("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!downloadUrl && !fileData) {
      showToast("Пожалуйста, прикрепите файл ИЛИ укажите ссылку!", "error");
      return;
    }
    
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/releases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version, title, description, downloadUrl, fileData, fileName }),
      });

      if (!res.ok) throw new Error("Failed to create release");
      
      showToast("Релиз успешно опубликован!", "success");
      setVersion("");
      setTitle("");
      setDescription("");
      setDownloadUrl("");
      setFileData("");
      setFileName("");
      
      setTimeout(() => router.push("/releases"), 1500);
    } catch (error) {
      console.error(error);
      showToast("Ошибка при создании релиза", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") return <div className="p-8 text-white">Загрузка...</div>;

  return (
    <div className="min-h-screen text-white p-8 relative overflow-hidden z-0">
      
      {toastMessage && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-2xl animate-fade-in z-50 text-white font-bold flex items-center gap-3 ${toastType === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
          {toastType === "success" ? "✅" : "❌"}
          {toastMessage}
        </div>
      )}

      <div className="max-w-2xl mx-auto z-10 relative">
        <Link href="/releases" className="text-gray-400 hover:text-white mb-6 inline-block transition-colors">
          &larr; Назад к релизам
        </Link>
        
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 tracking-tight">
          Опубликовать новый релиз
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-[#121215]/60 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Тег версии</label>
            <input
              type="text"
              required
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="Например: v1.0.0"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Название обновления</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Крупное улучшение производительности"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <h3 className="text-sm font-bold text-blue-300 mb-3">Способ загрузки файла</h3>
            <p className="text-xs text-gray-400 mb-4">Вы можете загрузить файл прямо на сайт (до 4.5 МБ) или указать внешнюю ссылку на скачивание, если файл большой.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Загрузить файл (до 4.5 МБ)</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/20 file:text-blue-300 hover:file:bg-blue-500/30 transition-all cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="h-px bg-white/10 flex-1"></div>
                <span className="text-xs text-gray-500 font-bold">ИЛИ</span>
                <div className="h-px bg-white/10 flex-1"></div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Внешняя ссылка на скачивание</label>
                <input
                  type="url"
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  placeholder="Например: https://example.com/download.exe"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Список изменений (Changelog)</label>
            <textarea
              required
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="- Добавлена новая функция X&#10;- Исправлен баг Y"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:transform-none"
          >
            {isLoading ? "Публикация..." : "Опубликовать релиз"}
          </button>
        </form>
      </div>
    </div>
  );
}

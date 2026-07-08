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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated" || (session?.user as any)?.role !== "admin" && (session?.user as any)?.role !== "developer") {
      router.push("/");
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/releases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version, title, description, downloadUrl }),
      });

      if (!res.ok) throw new Error("Failed to create release");
      
      alert("Релиз успешно опубликован!");
      setVersion("");
      setTitle("");
      setDescription("");
      setDownloadUrl("");
      
      // Redirect back to releases page
      router.push("/releases");
    } catch (error) {
      console.error(error);
      alert("Ошибка при создании релиза");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") return <div className="p-8 text-white">Загрузка...</div>;

  return (
    <div className="min-h-screen text-white p-8 relative overflow-hidden z-0">
      {/* Background decorations */}
      <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none -z-10" />

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

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ссылка на скачивание (URL)</label>
            <input
              type="url"
              required
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
              placeholder="Например: https://example.com/download.exe"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
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

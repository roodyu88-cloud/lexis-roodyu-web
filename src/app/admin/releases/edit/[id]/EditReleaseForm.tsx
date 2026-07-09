"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditReleaseForm({ release }: { release: any }) {
  const router = useRouter();
  
  const [version, setVersion] = useState(release.version || "");
  const [title, setTitle] = useState(release.title || "");
  const [description, setDescription] = useState(release.description || "");
  const [downloadUrl, setDownloadUrl] = useState(release.downloadUrl || "");
  const [virusTotalUrl, setVirusTotalUrl] = useState(release.virusTotalUrl || "");
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/releases", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: release.id, 
          version, 
          title, 
          description, 
          downloadUrl, 
          virusTotalUrl 
        }),
      });

      if (!res.ok) throw new Error("Failed to update release");
      
      showToast("Релиз успешно обновлен!", "success");
      setTimeout(() => router.push("/releases"), 1500);
    } catch (error) {
      console.error(error);
      showToast("Ошибка при обновлении релиза", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {toastMessage && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-2xl animate-fade-in z-50 text-white font-bold flex items-center gap-3 ${toastType === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
          {toastType === "success" ? "✅" : "❌"}
          {toastMessage}
        </div>
      )}

      <Link href="/releases" className="text-gray-400 hover:text-white mb-6 inline-block transition-colors">
        &larr; Назад к релизам
      </Link>

      <form onSubmit={handleSubmit} className="space-y-6 bg-[#121215]/60 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Тег версии</label>
          <input
            type="text"
            required
            value={version}
            onChange={(e) => setVersion(e.target.value)}
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
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Внешняя ссылка на скачивание (заменяет загруженный файл)</label>
          <input
            type="url"
            value={downloadUrl}
            onChange={(e) => setDownloadUrl(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Ссылка на VirusTotal (опционально)</label>
          <input
            type="url"
            value={virusTotalUrl}
            onChange={(e) => setVirusTotalUrl(e.target.value)}
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
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(202,138,4,0.3)] hover:shadow-[0_0_30px_rgba(202,138,4,0.5)] transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:transform-none"
        >
          {isLoading ? "Сохранение..." : "Сохранить изменения"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

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
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-2xl animate-scale-up z-50 text-white font-bold flex items-center gap-3 ${toastType === "success" ? "" : "bg-red-500"}`}
          style={toastType === "success" ? { background: "var(--color-success-green)" } : undefined}
        >
          {toastType === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" strokeWidth={2} /> : <XCircle className="w-5 h-5 shrink-0" strokeWidth={2} />}
          {toastMessage}
        </div>
      )}

      <Link href="/releases" className="rc-link inline-flex items-center gap-1.5 mb-6">
        <ArrowLeft className="w-4 h-4" strokeWidth={2.25} />
        Назад к релизам
      </Link>

      <form onSubmit={handleSubmit} className="space-y-6 rc-card-edge bg-[var(--color-ink)] p-8">
        <div>
          <label className="block text-sm font-medium text-[var(--color-ash)] mb-2">Тег версии</label>
          <input
            type="text"
            required
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="rc-input w-full px-4 py-3 rounded-xl"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-ash)] mb-2">Название обновления</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rc-input w-full px-4 py-3 rounded-xl"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-ash)] mb-2">Внешняя ссылка на скачивание (заменяет загруженный файл)</label>
          <input
            type="url"
            value={downloadUrl}
            onChange={(e) => setDownloadUrl(e.target.value)}
            className="rc-input w-full px-4 py-3 rounded-xl"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-ash)] mb-2">Ссылка на VirusTotal (опционально)</label>
          <input
            type="url"
            value={virusTotalUrl}
            onChange={(e) => setVirusTotalUrl(e.target.value)}
            className="rc-input w-full px-4 py-3 rounded-xl"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-ash)] mb-2">Список изменений (Changelog)</label>
          <textarea
            required
            rows={8}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rc-input w-full px-4 py-3 rounded-xl"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="rc-btn w-full py-4 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:transform-none cursor-pointer"
        >
          {isLoading ? "Сохранение..." : "Сохранить изменения"}
        </button>
      </form>
    </div>
  );
}

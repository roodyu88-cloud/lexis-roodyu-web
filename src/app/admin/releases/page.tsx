"use client";

import { useState, useEffect } from "react";
import { useDevSession } from "@/app/components/DevAuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, DownloadCloud, Rocket } from "lucide-react";

export default function AdminReleasesPage() {
  const { data: session, status } = useDevSession();
  const router = useRouter();

  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [fileData, setFileData] = useState("");
  const [fileName, setFileName] = useState("");
  const [virusTotalUrl, setVirusTotalUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 3000);
  };

  useEffect(() => {
    if (status === "loading") return;
    const isAdmin = (session?.user as any)?.role === "admin" || (session?.user as any)?.role === "developer";
    if (status === "unauthenticated" || !isAdmin) {
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
        body: JSON.stringify({ version, title, description, downloadUrl, fileData, fileName, virusTotalUrl }),
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

  if (status === "loading") return <div className="p-8 text-[var(--color-pure-white)]">Загрузка...</div>;


  return (
    <div className="min-h-screen bg-[var(--color-void-black)] text-[var(--color-pure-white)] p-4 sm:p-8 relative overflow-hidden z-0">

      {toastMessage && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-2xl animate-scale-up z-50 text-white font-bold flex items-center gap-3 ${toastType === "success" ? "" : "bg-red-500"}`}
          style={toastType === "success" ? { background: "var(--color-success-green)" } : undefined}
        >
          {toastType === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" strokeWidth={2} /> : <XCircle className="w-5 h-5 shrink-0" strokeWidth={2} />}
          {toastMessage}
        </div>
      )}

      <div className="max-w-2xl mx-auto z-10 relative">
        <Link href="/releases" className="rc-link inline-flex items-center gap-1.5 mb-6">
          <ArrowLeft className="w-4 h-4" strokeWidth={2.25} />
          Назад к релизам
        </Link>

        <h1 className="text-heading font-extrabold mb-8 tracking-[var(--tracking-heading-lg)]">
          Опубликовать новый релиз
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 rc-card-edge bg-[var(--color-ink)] p-6 sm:p-8">
          <div>
            <label className="block text-sm font-medium text-[var(--color-ash)] mb-2">Тег версии</label>
            <input
              type="text"
              required
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="Например: v1.0.0"
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
              placeholder="Например: Крупное улучшение производительности"
              className="rc-input w-full px-4 py-3 rounded-xl"
            />
          </div>

          <div className="p-4 rounded-xl" style={{ background: "var(--color-obsidian)", border: "1px solid var(--color-hairline)" }}>
            <h3 className="flex items-center gap-1.5 text-sm font-bold mb-3" style={{ color: "var(--color-coral-text)" }}>
              <DownloadCloud className="w-4 h-4" strokeWidth={2.25} />
              Способ загрузки файла
            </h3>
            <p className="text-xs text-[var(--color-ash)] mb-4">Вы можете загрузить файл прямо на сайт (до 4.5 МБ) или указать внешнюю ссылку на скачивание, если файл большой.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-ash)] mb-2">Загрузить файл (до 4.5 МБ)</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-sm text-[var(--color-ash)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-graphite)] file:text-[var(--color-pure-white)] hover:file:opacity-80 transition-all cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="h-px flex-1" style={{ background: "var(--color-hairline)" }}></div>
                <span className="text-xs text-[var(--color-smoke)] font-bold">ИЛИ</span>
                <div className="h-px flex-1" style={{ background: "var(--color-hairline)" }}></div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-ash)] mb-2">Внешняя ссылка на скачивание</label>
                <input
                  type="url"
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  placeholder="Например: https://example.com/download.exe"
                  className="rc-input w-full px-4 py-3 rounded-xl"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-ash)] mb-2">Ссылка на VirusTotal (опционально)</label>
            <input
              type="url"
              value={virusTotalUrl}
              onChange={(e) => setVirusTotalUrl(e.target.value)}
              placeholder="Например: https://www.virustotal.com/gui/file/..."
              className="rc-input w-full px-4 py-3 rounded-xl mb-6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-ash)] mb-2">Список изменений (Changelog)</label>
            <textarea
              required
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="- Добавлена новая функция X&#10;- Исправлен баг Y"
              className="rc-input w-full px-4 py-3 rounded-xl"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="rc-btn w-full py-4 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:transform-none cursor-pointer"
          >
            {isLoading ? "Публикация..." : (
              <>
                <Rocket className="w-4 h-4" strokeWidth={2.25} />
                Опубликовать релиз
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

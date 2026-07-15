"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { Lock, ChevronDown } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [servers, setServers] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedServerId, setSelectedServerId] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedProject = servers.find(p => p.id === selectedProjectId);
  const selectedServer = selectedProject?.servers?.find((s: any) => s.id === selectedServerId);

  useEffect(() => {
    fetch("/api/servers")
      .then(r => r.json())
      .then(d => {
        if (d.servers) setServers(d.servers);
      })
      .catch(console.error);
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      setError("Необходимо войти через Discord!");
      return;
    }
    if (!file || !name) {
      setError("Укажите название и выберите файл!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const text = await file.text();
      // Basic validation
      JSON.parse(text);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, data: text, serverProjectId: selectedProjectId || null, serverId: selectedServerId || null })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Ошибка при загрузке");
      }

      const result = await res.json();
      router.push(`/presets/${result.id}`);
    } catch (err: any) {
      setError(err.message || "Неверный формат JSON файла");
    } finally {
      setLoading(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-sm animate-pulse" style={{ color: "var(--color-ash)" }}>Проверка авторизации...</div>
      </main>
    );
  }

  // ── Not authenticated ──────────────────────────────────────────────────────
  if (!session?.user) {
    return (
      <main className="min-h-screen p-6 md:p-8 flex items-center justify-center relative overflow-hidden">
        <div className="fixed top-20 left-[10%] w-[350px] h-[350px] rounded-full blur-[120px] pointer-events-none -z-10" style={{ background: "rgba(124, 108, 240, 0.08)" }} aria-hidden="true" />
        <div className="fixed bottom-20 right-[10%] w-[350px] h-[350px] rounded-full blur-[130px] pointer-events-none -z-10" style={{ background: "rgba(124, 108, 240, 0.05)" }} aria-hidden="true" />

        <div className="rc-card-edge p-8 md:p-10 w-full max-w-md text-center relative overflow-hidden" style={{ background: "var(--color-ink)" }}>
          {/* Glow orbs */}
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(124, 108, 240, 0.08)" }} />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(124, 108, 240, 0.05)" }} />

          <div className="relative">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "var(--color-obsidian)", border: "1px solid var(--color-hairline)" }}>
              <Lock className="w-7 h-7" style={{ color: "var(--color-coral-text)" }} />
            </div>
            <h1 className="text-heading-sm font-bold mb-2" style={{ color: "var(--color-pure-white)" }}>Требуется авторизация</h1>
            <p className="text-sm mb-8 leading-relaxed" style={{ color: "var(--color-ash)" }}>
              Чтобы публиковать пресеты, необходимо войти через Discord.
            </p>
            <button
              onClick={() => signIn("discord")}
              className="rc-btn w-full flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.056A19.9 19.9 0 0 0 6.1 21.06a.077.077 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
              Войти через Discord
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── Authenticated — show form ───────────────────────────────────────────────
  return (
    <main className="min-h-screen p-6 md:p-8 flex items-center justify-center relative overflow-hidden">
      <div className="fixed top-20 left-[10%] w-[350px] h-[350px] rounded-full blur-[120px] pointer-events-none -z-10" style={{ background: "rgba(124, 108, 240, 0.08)" }} aria-hidden="true" />
      <div className="fixed bottom-20 right-[10%] w-[350px] h-[350px] rounded-full blur-[130px] pointer-events-none -z-10" style={{ background: "rgba(124, 108, 240, 0.05)" }} aria-hidden="true" />

      <form onSubmit={handleUpload} className="rc-card-edge p-6 md:p-8 w-full max-w-lg relative overflow-hidden" style={{ background: "var(--color-ink)" }}>
        <h1 className="text-heading-sm font-bold mb-6 text-center" style={{ color: "var(--color-pure-white)" }}>Поделиться пресетом</h1>

        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-xl mb-4 border border-red-500/50 text-sm">{error}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-ash)" }}>Название пресета</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rc-input w-full px-4 py-2.5 transition-colors"
              style={{ border: "1px solid var(--color-hairline)" }}
              placeholder="Например: Законы Majestic RP"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-ash)" }}>Краткое описание (опционально)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rc-input w-full px-4 py-2.5 h-24 resize-none transition-colors"
              style={{ border: "1px solid var(--color-hairline)" }}
              placeholder="Версия, для какого сервера, что внутри..."
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-ash)" }}>Проект / Сервер (опционально)</label>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="rc-input w-full px-4 py-2.5 flex items-center justify-between text-left cursor-pointer transition-colors"
              style={{ border: "1px solid var(--color-hairline)" }}
            >
              <div className="flex items-center gap-2">
                {selectedProject ? (
                  <>
                    {selectedProject.iconUrl && (
                      <img src={selectedProject.iconUrl} alt={selectedProject.name} className="w-5 h-5 rounded object-cover" />
                    )}
                    <span className="font-medium">
                      {selectedProject.name}
                      {selectedServer ? <span className="font-normal" style={{ color: "var(--color-ash)" }}> / {selectedServer.name}</span> : <span className="font-normal" style={{ color: "var(--color-ash)" }}> (Без привязки к серверу)</span>}
                    </span>
                  </>
                ) : (
                  <span style={{ color: "var(--color-smoke)" }}>-- Выберите сервер (если нужно) --</span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} style={{ color: "var(--color-smoke)" }} />
            </button>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                <div
                  className="absolute left-0 right-0 mt-2 rounded-xl overflow-hidden z-20 shadow-2xl animate-scale-up max-h-60 overflow-y-auto no-scrollbar"
                  style={{ background: "var(--color-obsidian)", border: "1px solid var(--color-hairline)" }}
                >
                  <button
                    type="button"
                    onClick={() => { setSelectedProjectId(""); setSelectedServerId(""); setIsDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer"
                    style={{
                      background: !selectedProjectId ? "var(--overlay-soft)" : "transparent",
                      color: !selectedProjectId ? "var(--color-coral-text)" : "var(--color-ash)",
                      fontWeight: !selectedProjectId ? 700 : 400,
                    }}
                  >
                    -- Не выбирать (Без сервера) --
                  </button>
                  {servers.map((p: any) => (
                    <div key={p.id}>
                      <div className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: "var(--color-smoke)", background: "var(--color-graphite)" }}>
                        {p.iconUrl && <img src={p.iconUrl} className="w-4 h-4 rounded" alt="icon" />}
                        {p.name}
                      </div>
                      <button
                        type="button"
                        onClick={() => { setSelectedProjectId(p.id); setSelectedServerId(""); setIsDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2.5 pl-8 text-sm transition-colors flex items-center gap-2 cursor-pointer"
                        style={{
                          background: selectedProjectId === p.id && !selectedServerId ? "var(--overlay-soft)" : "transparent",
                          color: selectedProjectId === p.id && !selectedServerId ? "var(--color-coral-text)" : "var(--color-ash)",
                          fontWeight: selectedProjectId === p.id && !selectedServerId ? 700 : 400,
                        }}
                      >
                        <span>Любой сервер</span>
                      </button>
                      {p.servers?.map((s: any) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => { setSelectedProjectId(p.id); setSelectedServerId(s.id); setIsDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2.5 pl-8 text-sm transition-colors flex items-center gap-2 cursor-pointer"
                          style={{
                            background: selectedServerId === s.id ? "var(--overlay-soft)" : "transparent",
                            color: selectedServerId === s.id ? "var(--color-coral-text)" : "var(--color-ash)",
                            fontWeight: selectedServerId === s.id ? 700 : 400,
                          }}
                        >
                          <span>{s.name}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-ash)" }}>Файл .json (Lexis)</label>
            <input
              type="file"
              accept=".json"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-graphite)] file:text-[var(--color-pure-white)] hover:file:bg-[var(--overlay-soft-strong)] cursor-pointer transition-colors"
              style={{ color: "var(--color-ash)" }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rc-btn w-full mt-6"
          >
            {loading ? "Загрузка..." : "Опубликовать"}
          </button>
        </div>
      </form>
    </main>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ServerProject {
  id: string;
  name: string;
  iconUrl: string;
  servers?: { id: string; name: string }[];
}

interface EditPresetFormProps {
  preset: {
    id: string;
    name: string;
    description: string | null;
    serverProjectId: string | null;
    serverId: string | null;
  };
  servers: ServerProject[];
}

export default function EditPresetForm({ preset, servers }: EditPresetFormProps) {
  const router = useRouter();
  const [name, setName] = useState(preset.name);
  const [description, setDescription] = useState(preset.description || "");
  const [selectedProjectId, setSelectedProjectId] = useState(preset.serverProjectId || "");
  const [selectedServerId, setSelectedServerId] = useState(preset.serverId || "");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedProject = servers.find(s => s.id === selectedProjectId);
  const selectedServer = selectedProject?.servers?.find(s => s.id === selectedServerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Укажите название пресета!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/presets/${preset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          serverProjectId: selectedProjectId || null,
          serverId: selectedServerId || null
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Не удалось сохранить изменения");
      }

      router.push(`/presets/${preset.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Произошла системная ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <Link href={`/presets/${preset.id}`} className="rc-link mb-8 inline-flex items-center gap-1.5">
        <ArrowLeft className="w-4 h-4" /> Назад к просмотру
      </Link>

      <form onSubmit={handleSubmit} className="rc-card-edge !p-8 w-full relative bg-[var(--color-ink)]">
        <h1 className="text-heading-sm font-bold mb-6 text-[var(--color-pure-white)] text-center">Редактирование пресета</h1>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 border border-red-500/50 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--color-ash)] mb-1">Название пресета</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[var(--color-obsidian)] border border-[var(--color-hairline)] rounded-lg px-4 py-2.5 text-[var(--color-pure-white)] focus:outline-none focus:border-[var(--color-pure-white)] transition-colors"
              placeholder="Например: Законы Majestic RP"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-ash)] mb-1">Краткое описание (опционально)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[var(--color-obsidian)] border border-[var(--color-hairline)] rounded-lg px-4 py-2.5 text-[var(--color-pure-white)] focus:outline-none focus:border-[var(--color-pure-white)] h-28 resize-none transition-colors"
              placeholder="Версия, для какого сервера, что внутри..."
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-[var(--color-ash)] mb-1">Проект / Сервер (опционально)</label>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-[var(--color-obsidian)] border border-[var(--color-hairline)] rounded-lg px-4 py-2.5 text-[var(--color-pure-white)] flex items-center justify-between text-left focus:outline-none focus:border-[var(--color-pure-white)] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                {selectedProject ? (
                  <>
                    {selectedProject.iconUrl && (
                      <img src={selectedProject.iconUrl} alt={selectedProject.name} className="w-5 h-5 rounded object-cover" />
                    )}
                    <span className="font-medium">
                      {selectedProject.name}
                      {selectedServer ? <span className="text-[var(--color-ash)] font-normal"> / {selectedServer.name}</span> : <span className="text-[var(--color-ash)] font-normal"> (Без привязки к серверу)</span>}
                    </span>
                  </>
                ) : (
                  <span className="text-[var(--color-smoke)]">-- Выберите сервер (если нужно) --</span>
                )}
              </div>
              <svg className={`w-4 h-4 text-[var(--color-smoke)] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                <div
                  className="absolute left-0 right-0 mt-2 rounded-xl overflow-hidden z-20 animate-scale-up max-h-60 overflow-y-auto no-scrollbar"
                  style={{ background: "var(--color-ink)", border: "1px solid var(--color-hairline)", boxShadow: "var(--shadow-key)" }}
                >
                  <button
                    type="button"
                    onClick={() => { setSelectedProjectId(""); setSelectedServerId(""); setIsDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[var(--overlay-soft)] cursor-pointer ${!selectedProjectId ? 'text-[var(--color-pure-white)] font-bold bg-[var(--overlay-soft-strong)]' : 'text-[var(--color-ash)]'}`}
                  >
                    -- Не выбирать (Без сервера) --
                  </button>
                  {servers.map((p: any) => (
                    <div key={p.id}>
                      <div className="px-4 py-1.5 text-xs font-bold text-[var(--color-smoke)] uppercase tracking-wider bg-[var(--color-obsidian)] flex items-center gap-2">
                        {p.iconUrl && <img src={p.iconUrl} className="w-4 h-4 rounded" alt="icon" />}
                        {p.name}
                      </div>
                      <button
                        type="button"
                        onClick={() => { setSelectedProjectId(p.id); setSelectedServerId(""); setIsDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 pl-8 text-sm transition-colors hover:bg-[var(--overlay-soft)] flex items-center gap-2 cursor-pointer ${selectedProjectId === p.id && !selectedServerId ? 'text-[var(--color-pure-white)] font-bold bg-[var(--overlay-soft-strong)]' : 'text-[var(--color-ash)]'}`}
                      >
                        <span>Любой сервер</span>
                      </button>
                      {p.servers?.map((s: any) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => { setSelectedProjectId(p.id); setSelectedServerId(s.id); setIsDropdownOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 pl-8 text-sm transition-colors hover:bg-[var(--overlay-soft)] flex items-center gap-2 cursor-pointer ${selectedServerId === s.id ? 'text-[var(--color-pure-white)] font-bold bg-[var(--overlay-soft-strong)]' : 'text-[var(--color-ash)]'}`}
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

          <div className="flex gap-4 pt-4">
            <Link
              href={`/presets/${preset.id}`}
              className="flex-1 rc-btn-ghost text-center text-sm cursor-pointer"
            >
              Отмена
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rc-btn text-sm cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

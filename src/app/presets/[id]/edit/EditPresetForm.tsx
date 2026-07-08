"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ServerProject {
  id: string;
  name: string;
  iconUrl: string;
}

interface EditPresetFormProps {
  preset: {
    id: string;
    name: string;
    description: string | null;
    serverProjectId: string | null;
  };
  servers: ServerProject[];
}

export default function EditPresetForm({ preset, servers }: EditPresetFormProps) {
  const router = useRouter();
  const [name, setName] = useState(preset.name);
  const [description, setDescription] = useState(preset.description || "");
  const [selectedServerId, setSelectedServerId] = useState(preset.serverProjectId || "");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedServer = servers.find(s => s.id === selectedServerId);

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
      <Link href={`/presets/${preset.id}`} className="text-[#5865F2] hover:underline mb-8 inline-block">
        ← Назад к просмотру
      </Link>

      <form onSubmit={handleSubmit} className="glass-card p-8 w-full border border-white/10 shadow-2xl relative rounded-2xl">
        <h1 className="text-2xl font-bold mb-6 text-white text-center">Редактирование пресета</h1>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 border border-red-500/50 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Название пресета</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#5865F2] transition-colors"
              placeholder="Например: Законы Majestic RP"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Краткое описание (опционально)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#5865F2] h-28 resize-none transition-colors"
              placeholder="Версия, для какого сервера, что внутри..."
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-400 mb-1">Проект / Сервер (опционально)</label>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white flex items-center justify-between text-left focus:outline-none focus:border-[#5865F2] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                {selectedServer ? (
                  <>
                    {selectedServer.iconUrl && (
                      <img src={selectedServer.iconUrl} alt={selectedServer.name} className="w-5 h-5 rounded object-cover" />
                    )}
                    <span className="font-medium">{selectedServer.name}</span>
                  </>
                ) : (
                  <span className="text-gray-500">-- Выберите сервер (если нужно) --</span>
                )}
              </div>
              <svg className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute left-0 right-0 mt-2 bg-[#0d0e12]/95 border border-white/10 rounded-xl overflow-hidden z-20 shadow-2xl animate-scale-up backdrop-blur-xl max-h-60 overflow-y-auto no-scrollbar">
                  <button
                    type="button"
                    onClick={() => { setSelectedServerId(""); setIsDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/5 cursor-pointer ${!selectedServerId ? 'text-[#5865F2] font-bold bg-white/5' : 'text-gray-400'}`}
                  >
                    -- Не выбирать (Без сервера) --
                  </button>
                  {servers.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { setSelectedServerId(s.id); setIsDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/5 flex items-center gap-2 cursor-pointer ${selectedServerId === s.id ? 'text-[#5865F2] font-bold bg-white/5' : 'text-gray-400'}`}
                    >
                      {s.iconUrl && (
                        <img src={s.iconUrl} alt={s.name} className="w-5 h-5 rounded object-cover" />
                      )}
                      <span>{s.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Link 
              href={`/presets/${preset.id}`}
              className="flex-1 btn-secondary text-center text-sm !py-2.5 cursor-pointer"
            >
              Отмена
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 btn-primary text-sm !py-2.5 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

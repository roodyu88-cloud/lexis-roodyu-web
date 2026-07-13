"use client";

import { useState } from "react";
import Link from "next/link";

interface PresetListProps {
  presets: any[];
  servers: any[];
  userMap: Record<string, { role: string; badges: string[] }>;
  badgeFiles: Record<string, string>;
  badgeLabels: Record<string, string>;
}

export default function PresetsList({ presets, servers, userMap, badgeFiles, badgeLabels }: PresetListProps) {
  const [search, setSearch] = useState("");
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);

  const filteredPresets = presets.filter(p => {
    // 1. Server filter
    if (selectedServerId && p.serverProjectId !== selectedServerId) {
      return false;
    }
    // 2. Search filter
    if (search) {
      const q = search.toLowerCase();
      const nameMatch = p.name.toLowerCase().includes(q);
      const authorMatch = p.author.toLowerCase().includes(q);
      if (!nameMatch && !authorMatch) return false;
    }
    return true;
  });

  return (
    <div>
      {/* Filters and Search Area */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Поиск по названию или автору..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 pl-12 text-white focus:outline-none focus:border-[var(--blurple)] transition-all duration-300 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.06)]"
          />
          <div className="absolute left-4 top-3.5 text-gray-500">
            🔍
          </div>
        </div>

        {/* Server Filters */}
        {servers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedServerId(null)}
              className={`px-4 py-2 rounded-lg font-bold transition-all text-sm flex items-center gap-2 cursor-pointer ${
                selectedServerId === null
                  ? "bg-[var(--blurple)] text-[var(--user-msg-text)] shadow-lg shadow-[var(--blurple-alpha-20)] border border-[var(--blurple)]"
                  : "bg-white/5 text-gray-400 border border-white/10 hover:text-white hover:bg-white/10"
              }`}
            >
              Все серверы
            </button>
            {servers.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedServerId(s.id)}
                className={`px-4 py-2 rounded-lg font-bold transition-all text-sm flex items-center gap-2 cursor-pointer ${
                  selectedServerId === s.id
                    ? "bg-[var(--blurple)] text-[var(--user-msg-text)] shadow-lg shadow-[var(--blurple-alpha-20)] border border-[var(--blurple)]"
                    : "bg-white/5 text-gray-400 border border-white/10 hover:text-white hover:bg-white/10"
                }`}
              >
                <img src={s.iconUrl} alt={s.name} className="w-5 h-5 rounded" />
                {s.projectName ? `${s.projectName} — ${s.name}` : s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredPresets.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-400">
          <p className="text-xl">По вашему запросу ничего не найдено.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPresets.map((p) => {
            const authorProfile = p.discordId ? userMap[p.discordId] : null;
            const authorBadges = authorProfile?.badges || [];
            const server = servers.find(s => s.id === p.serverProjectId);

            return (
              <Link href={`/presets/${p.id}`} key={p.id} className="glass-card p-6 block hover:border-[#5865F2] transition-colors relative">
                {p.isVerified && (
                  <div className="absolute top-4 right-4 group/tooltip">
                    <img src="/img/Verified.png" alt="Verified" className="h-6 w-auto" />
                    <span className="absolute bottom-full right-0 mb-1.5 hidden group-hover/tooltip:block bg-[#121318] border border-white/10 text-white text-[10px] font-semibold px-2 py-1 rounded-md shadow-2xl pointer-events-none whitespace-nowrap z-30">
                      Верифицированный пресет
                    </span>
                  </div>
                )}
                
                {server && (
                  <div className="absolute -top-3 -left-3 bg-[#1e1e1e] border border-white/10 p-1.5 rounded-xl shadow-lg group/tooltip cursor-help">
                    <img src={server.iconUrl} alt={server.name} className="w-6 h-6 rounded" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/tooltip:block bg-[#121318] border border-white/10 text-white text-[10px] font-semibold px-2 py-1 rounded-md shadow-2xl pointer-events-none whitespace-nowrap z-30">
                      Проект: {server.name}
                    </span>
                  </div>
                )}

                <h2 className="text-xl font-bold text-white mb-2 truncate pr-8 mt-1">{p.name}</h2>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {p.description || "Нет описания"}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[#5865F2]">●</span> 
                    <span className="text-gray-300 font-medium">{p.author}</span>
                    {authorBadges.map(b => {
                      const file = badgeFiles[b];
                      const label = badgeLabels[b];
                      if (!file) return null;
                      return (
                        <span key={b} className="relative group/tooltip inline-block align-middle ml-1">
                          <img 
                            src={`/img/${file}`} 
                            alt={label} 
                            className="h-4.5 w-auto cursor-help"
                          />
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/tooltip:block bg-[#121318] border border-white/10 text-white text-[10px] font-semibold px-2 py-1 rounded-md shadow-2xl pointer-events-none whitespace-nowrap z-30">
                            {label}
                          </span>
                        </span>
                      );
                    })}
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    📥 {p.downloads}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

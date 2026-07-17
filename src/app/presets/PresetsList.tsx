"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Download, ArrowRight } from "lucide-react";

interface PresetListProps {
  presets: any[];
  servers: any[];
  userMap: Record<string, { role: string; badges: string[] }>;
  badgeFiles: Record<string, string>;
  badgeLabels: Record<string, string>;
}

export default function PresetsList({ presets, servers, userMap, badgeFiles, badgeLabels }: PresetListProps) {
  const [search, setSearch] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [selectedServerId, setSelectedServerId] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredPresets = presets.filter(p => {
    // 1. Server filter
    if (selectedProjectId !== "all") {
      if (p.serverProjectId !== selectedProjectId) return false;
      if (selectedServerId !== "all" && p.serverId !== selectedServerId) return false;
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
            className="rc-input w-full rounded-xl px-4 py-3 pl-12 transition-all duration-300"
            style={{ boxShadow: "var(--shadow-key)" }}
          />
          <div className="absolute left-4 top-3.5 text-[var(--color-smoke)]">
            <Search className="w-5 h-5" />
          </div>
        </div>

        {/* Server Filters */}
        {servers.length > 0 && (
          <div className="flex items-center gap-2 relative">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="bg-[var(--overlay-soft)] border border-[var(--color-hairline)] text-[var(--color-pure-white)] rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--color-pure-white)] min-w-[240px] flex justify-between items-center gap-2 hover:bg-[var(--overlay-soft-strong)] transition-colors cursor-pointer"
                style={{ boxShadow: "var(--shadow-key)" }}
              >
                <span>
                  {selectedProjectId === "all"
                    ? "Все серверы"
                    : selectedServerId === "all"
                      ? `Любой сервер (${servers.find(p => p.id === selectedProjectId)?.name || "Неизвестно"})`
                      : servers.flatMap(p => p.servers || []).find(s => s.id === selectedServerId)?.name || "Неизвестно"
                  }
                </span>
                <svg className={`w-4 h-4 text-[var(--color-smoke)] transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                  <div
                    className="absolute left-0 mt-2 w-[280px] rounded-xl overflow-hidden z-20 animate-scale-up max-h-80 overflow-y-auto no-scrollbar"
                    style={{ background: "var(--color-ink)", border: "1px solid var(--color-hairline)", boxShadow: "var(--shadow-key)" }}
                  >
                    <button
                      type="button"
                      onClick={() => { setSelectedProjectId("all"); setSelectedServerId("all"); setIsFilterOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[var(--overlay-soft)] cursor-pointer ${selectedProjectId === "all" ? 'text-[var(--color-pure-white)] font-bold bg-[var(--overlay-soft-strong)]' : 'text-[var(--color-ash)]'}`}
                    >
                      Все серверы
                    </button>
                    {servers.map(p => (
                      <div key={p.id}>
                        <div className="px-4 py-1.5 text-xs font-bold text-[var(--color-smoke)] uppercase tracking-wider bg-[var(--color-obsidian)] flex items-center gap-2">
                          {p.iconUrl && <img src={p.iconUrl} className="w-4 h-4 rounded" alt="icon" />}
                          {p.name}
                        </div>
                        <button
                          type="button"
                          onClick={() => { setSelectedProjectId(p.id); setSelectedServerId("all"); setIsFilterOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 pl-8 text-sm transition-colors hover:bg-[var(--overlay-soft)] flex items-center gap-2 cursor-pointer ${selectedProjectId === p.id && selectedServerId === "all" ? 'text-[var(--color-pure-white)] font-bold bg-[var(--overlay-soft-strong)]' : 'text-[var(--color-ash)]'}`}
                        >
                          <span>Любой сервер</span>
                        </button>
                        {p.servers?.map((s: any) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => { setSelectedProjectId(p.id); setSelectedServerId(s.id); setIsFilterOpen(false); }}
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
          </div>
        )}
      </div>

      {filteredPresets.length === 0 ? (
        <div className="rc-card-edge !p-12 text-center text-[var(--color-ash)] relative bg-[var(--color-ink)]">
          <Search className="w-10 h-10 mx-auto mb-4 text-[var(--color-smoke)]" />
          <p className="text-xl">По вашему запросу ничего не найдено.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPresets.map((p) => {
              const authorProfile = p.discordId ? userMap[p.discordId] : null;
              const authorBadges = authorProfile?.badges || [];
              const server = servers.find(s => s.id === p.serverProjectId);

              return (
                <Link href={`/presets/${p.id}`} key={p.id} className="rc-card-edge group block relative bg-[var(--color-ink)] !p-0 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-[color:var(--color-slate)]">
                  <div className="relative h-28 flex items-center justify-center overflow-hidden" style={{ background: "color-mix(in srgb, var(--color-obsidian) 100%, transparent)", borderBottom: "1px solid var(--color-hairline)" }}>
                    <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--color-coral-pulse) 10%, transparent), transparent 60%)" }} />
                    {server?.iconUrl ? (
                      <img src={server.iconUrl} alt={server.name} className="w-12 h-12 rounded-xl relative z-10 shadow-lg" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center relative z-10" style={{ background: "var(--color-graphite)", border: "1px solid var(--color-hairline)" }}>
                        <Search className="w-5 h-5" style={{ color: "var(--color-smoke)" }} />
                      </div>
                    )}
                    {p.isVerified && (
                      <img src="/img/Verified.png" alt="Verified" className="h-6 w-auto absolute top-3 right-3 z-10" />
                    )}
                    <div
                      className="absolute bottom-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center z-10 opacity-0 translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
                      style={{ background: "var(--color-graphite)", border: "1px solid var(--color-hairline)" }}
                    >
                      <ArrowRight className="w-3.5 h-3.5" style={{ color: "var(--color-pure-white)" }} />
                    </div>
                  </div>
                  <div className="p-5">
                    <h2 className="text-subheading font-bold text-[var(--color-pure-white)] mb-2 truncate">{p.name}</h2>
                    <p className="text-sm text-[var(--color-ash)] mb-4 line-clamp-2 min-h-[2.5em]">
                      {p.description || "Нет описания"}
                    </p>
                    <div className="flex justify-between items-center text-sm text-[var(--color-smoke)] pt-3" style={{ borderTop: "1px solid var(--color-hairline)" }}>
                      <span className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[var(--color-smoke)]">●</span>
                        <span className="text-[var(--color-ash)] font-medium">{p.author}</span>
                        {authorBadges.map(b => {
                          const file = badgeFiles[b];
                          if (!file) return null;
                          return <img key={b} src={`/img/${file}`} alt="" className="h-4.5 w-auto ml-1" />;
                        })}
                      </span>
                      <span className="flex items-center gap-1 shrink-0 font-data">
                        <Download className="w-3.5 h-3.5" /> {p.downloads}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

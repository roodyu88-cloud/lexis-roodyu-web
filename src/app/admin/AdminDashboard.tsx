"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface User {
  id: string;
  discordId: string;
  username: string;
  avatar: string | null;
  role: string;
  badges: string[];
  canUpload: boolean;
  isBanned?: boolean;
  banReason?: string | null;
  isPremium?: boolean;
  premiumUntil?: Date | string | null;
  createdAt: Date | string;
}

interface Preset {
  id: string;
  name: string;
  description: string | null;
  author: string;
  discordId: string | null;
  downloads: number;
  isVerified: boolean;
  serverProjectId?: string | null;
  serverId?: string | null;
  createdAt: Date | string;
}

interface ServerProject {
  id: string;
  name: string;
  iconUrl: string;
  webhookUrl?: string | null;
  discordRoleId?: string | null;
  servers?: { id: string; name: string; serverProjectId: string; }[];
}

interface Promocode {
  id: string;
  code: string;
  days: number;
  uses: number;
  maxUses: number;
  createdAt: Date | string;
}

interface AdminDashboardProps {
  initialUsers: User[];
  initialPresets: Preset[];
  initialServers?: ServerProject[];
  initialSettings?: Record<string, string>;
  initialPromocodes?: Promocode[];
  initialStats?: any;
}

const AVAILABLE_BADGES = [
  { id: "Creator", label: "Создатель", file: "Creator.png" },
  { id: "Staff", label: "Стафф", file: "Staff.png" },
  { id: "BugHunter", label: "Искатель багов", file: "BugHunter.png" },
  { id: "ActivePresetser", label: "Активный писатель", file: "ActivePresetser.png" },
  { id: "Moderator", label: "Модератор", file: "Moderator.png" },
  { id: "Partnered", label: "Партнер", file: "Partnered.png" },
];

export default function AdminDashboard({ initialUsers, initialPresets, initialServers = [], initialSettings = {}, initialPromocodes = [], initialStats }: AdminDashboardProps) {
  const [presetFilterServer, setPresetFilterServer] = useState<string>("all");
  const [isPresetFilterOpen, setIsPresetFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "presets" | "servers" | "settings" | "promocodes" | "stats">("users");
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [presets, setPresets] = useState<Preset[]>(initialPresets);
  const [servers, setServers] = useState<ServerProject[]>(initialServers);
  const [promocodes, setPromocodes] = useState<Promocode[]>(initialPromocodes);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [verifyingPresetId, setVerifyingPresetId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    // Reset timer
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  };

  // User editing states
  const [editRole, setEditRole] = useState("user");
  const [editBadges, setEditBadges] = useState<string[]>([]);
  const [editCanUpload, setEditCanUpload] = useState(true);
  const [editIsBanned, setEditIsBanned] = useState(false);
  const [editBanReason, setEditBanReason] = useState("");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  // Close role dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditBadges(user.badges);
    setEditCanUpload(user.canUpload);
    setEditIsBanned(user.isBanned || false);
    setEditBanReason(user.banReason || "");
    setIsRoleDropdownOpen(false);
  };

  const handleToggleBadge = (badgeId: string) => {
    if (editBadges.includes(badgeId)) {
      setEditBadges(editBadges.filter(b => b !== badgeId));
    } else {
      setEditBadges([...editBadges, badgeId]);
    }
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    setSavingUserId(selectedUser.id);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discordId: selectedUser.discordId,
          role: editRole,
          badges: editBadges,
          canUpload: editCanUpload,
          isBanned: editIsBanned,
          banReason: editBanReason,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update local state
        setUsers(prev => prev.map(u => u.discordId === selectedUser.discordId ? {
          ...u,
          role: data.user.role,
          badges: JSON.parse(data.user.badges || "[]"),
          canUpload: data.user.canUpload,
        } : u));

        setSelectedUser(null);
        showToast("Пользователь успешно сохранен!", "success");
      } else {
        const error = await res.json();
        showToast(error.error || "Не удалось сохранить", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Произошла системная ошибка", "error");
    } finally {
      setSavingUserId(null);
    }
  };

  const handleRevokePremium = async () => {
    if (!selectedUser) return;
    setSavingUserId(selectedUser.id);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discordId: selectedUser.discordId,
          role: editRole,
          badges: editBadges,
          canUpload: editCanUpload,
          isBanned: editIsBanned,
          banReason: editBanReason,
          revokePremium: true,
        }),
      });

      if (res.ok) {
        setUsers(prev => prev.map(u => u.discordId === selectedUser.discordId ? {
          ...u,
          isPremium: false,
          premiumUntil: null,
        } : u));
        setSelectedUser({ ...selectedUser, isPremium: false, premiumUntil: null });
        showToast("Premium успешно снят", "success");
      } else {
        const error = await res.json();
        showToast(error.error || "Ошибка", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Системная ошибка", "error");
    } finally {
      setSavingUserId(null);
    }
  };

  const handleToggleVerify = async (presetId: string, currentStatus: boolean) => {
    setVerifyingPresetId(presetId);
    try {
      const res = await fetch(`/api/admin/presets/${presetId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: !currentStatus }),
      });

      if (res.ok) {
        const data = await res.json();
        setPresets(prev => prev.map(p => p.id === presetId ? {
          ...p,
          isVerified: data.preset.isVerified,
        } : p));
        showToast(data.preset.isVerified ? "Пресет верифицирован!" : "Верификация пресета снята", "success");
      } else {
        showToast("Не удалось обновить статус верификации", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Произошла ошибка при верификации", "error");
    } finally {
      setVerifyingPresetId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs Menu */}
      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button
          onClick={() => { setActiveTab("users"); setSelectedUser(null); }}
          className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${activeTab === "users"
              ? "bg-[#5865F2] text-white shadow-lg shadow-[#5865F2]/20"
              : "bg-white/5 text-gray-400 hover:text-white"
            }`}
        >
          👤 Пользователи ({users.length})
        </button>
        <button
          onClick={() => { setActiveTab("presets"); setSelectedUser(null); }}
          className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${activeTab === "presets"
              ? "bg-[#5865F2] text-white shadow-lg shadow-[#5865F2]/20"
              : "bg-white/5 text-gray-400 hover:text-white"
            }`}
        >
          📂 Пресеты ({presets.length})
        </button>
        <button
          onClick={() => { setActiveTab("servers"); setSelectedUser(null); }}
          className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${activeTab === "servers"
              ? "bg-[#5865F2] text-white shadow-lg shadow-[#5865F2]/20"
              : "bg-white/5 text-gray-400 hover:text-white"
            }`}
        >
          🎮 Проекты ({servers.length})
        </button>
        <button
          onClick={() => { setActiveTab("promocodes"); setSelectedUser(null); }}
          className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${activeTab === "promocodes"
              ? "bg-[#5865F2] text-white shadow-lg shadow-[#5865F2]/20"
              : "bg-white/5 text-gray-400 hover:text-white"
            }`}
        >
          🏷️ Промокоды ({promocodes.length})
        </button>
        <button
          onClick={() => { setActiveTab("settings"); setSelectedUser(null); }}
          className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${activeTab === "settings"
              ? "bg-[#5865F2] text-white shadow-lg shadow-[#5865F2]/20"
              : "bg-white/5 text-gray-400 hover:text-white"
            }`}
        >
          ⚙️ Настройки
        </button>
        <button
          onClick={() => { setActiveTab("stats"); setSelectedUser(null); }}
          className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${activeTab === "stats"
              ? "bg-[#5865F2] text-white shadow-lg shadow-[#5865F2]/20"
              : "bg-white/5 text-gray-400 hover:text-white"
            }`}
        >
          📊 Статистика
        </button>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Table / List list (Left / Two-thirds width) */}
        <div className={`${selectedUser ? "lg:col-span-2" : "lg:col-span-3"} transition-all`}>
          {activeTab === "users" ? (
            <div className="glass-card overflow-hidden p-6">
              <h2 className="text-xl font-bold text-white mb-4">Список пользователей</h2>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-sm">
                      <th className="py-3 px-3">Пользователь</th>
                      <th className="py-3 px-3">Discord ID</th>
                      <th className="py-3 px-3">Роль</th>
                      <th className="py-3 px-3">Бейджи</th>
                      <th className="py-3 px-3 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-white/20 transition-colors">
                        <td className="py-3 px-3 flex items-center gap-3">
                          <img
                            src={u.avatar || "/img/window.svg"}
                            alt={u.username}
                            className="w-8 h-8 rounded-full border border-white/10"
                          />
                          <span className="font-semibold text-white">{u.username}</span>
                        </td>
                        <td className="py-3 px-3 text-xs font-mono text-gray-400">{u.discordId}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${u.role === "admin"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : u.role === "developer"
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                : u.role === "moderator"
                                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                  : "bg-white/5 text-gray-400"
                            }`}>
                            {u.role === "admin" ? "Администратор" : u.role === "developer" ? "Разработчик" : u.role === "moderator" ? "Модератор" : "Юзер"}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex gap-1.5 items-center">
                            {u.badges.map(b => {
                              const badgeInfo = AVAILABLE_BADGES.find(ab => ab.id === b);
                              if (!badgeInfo) return null;
                              return (
                                <img
                                  key={b}
                                  src={`/img/${badgeInfo.file}`}
                                  alt={badgeInfo.label}
                                  title={badgeInfo.label}
                                  className="h-5 w-auto"
                                />
                              );
                            })}
                            {u.badges.length === 0 && <span className="text-xs text-gray-600">-</span>}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleSelectUser(u)}
                            className="text-sm bg-white/5 hover:bg-[#5865F2] hover:text-white px-2.5 py-1.5 rounded-lg border border-white/10 text-gray-300 font-medium transition-all cursor-pointer"
                          >
                            Редактировать
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === "presets" ? (
            <div className="glass-card overflow-hidden p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <h2 className="text-xl font-bold text-white">Управление пресетами</h2>
                <div className="flex items-center gap-2 relative">
                  <label className="text-sm text-gray-400 font-semibold">Фильтр по серверу:</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsPresetFilterOpen(!isPresetFilterOpen)}
                      className="bg-black/40 border border-white/10 text-white rounded-lg px-4 py-2 text-sm outline-none focus:border-[#5865F2] min-w-[200px] flex justify-between items-center gap-2 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <span>
                        {presetFilterServer === "all" 
                          ? "Все серверы" 
                          : presetFilterServer.startsWith("project_")
                            ? `Любой сервер (${servers.find(p => p.id === presetFilterServer.replace("project_", ""))?.name || "Неизвестно"})`
                            : servers.flatMap(p => p.servers || []).find(s => s.id === presetFilterServer)?.name || "Неизвестно"
                        }
                      </span>
                      <svg className={`w-4 h-4 text-gray-500 transition-transform ${isPresetFilterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isPresetFilterOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsPresetFilterOpen(false)} />
                        <div className="absolute right-0 mt-2 w-[240px] bg-[#0d0e12]/95 border border-white/10 rounded-xl overflow-hidden z-20 shadow-2xl animate-scale-up backdrop-blur-xl max-h-80 overflow-y-auto no-scrollbar">
                          <button
                            type="button"
                            onClick={() => { setPresetFilterServer("all"); setIsPresetFilterOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/5 cursor-pointer ${presetFilterServer === "all" ? 'text-[#5865F2] font-bold bg-white/5' : 'text-gray-400'}`}
                          >
                            Все серверы
                          </button>
                          {servers.map(p => (
                            <div key={p.id}>
                              <div className="px-4 py-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider bg-black/40 flex items-center gap-2">
                                {p.iconUrl && <img src={p.iconUrl} className="w-4 h-4 rounded" alt="icon" />}
                                {p.name}
                              </div>
                              <button
                                type="button"
                                onClick={() => { setPresetFilterServer(`project_${p.id}`); setIsPresetFilterOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 pl-8 text-sm transition-colors hover:bg-white/5 flex items-center gap-2 cursor-pointer ${presetFilterServer === `project_${p.id}` ? 'text-[#5865F2] font-bold bg-white/5' : 'text-gray-400'}`}
                              >
                                <span>Любой сервер</span>
                              </button>
                              {p.servers?.map((s: any) => (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => { setPresetFilterServer(s.id); setIsPresetFilterOpen(false); }}
                                  className={`w-full text-left px-4 py-2.5 pl-8 text-sm transition-colors hover:bg-white/5 flex items-center gap-2 cursor-pointer ${presetFilterServer === s.id ? 'text-[#5865F2] font-bold bg-white/5' : 'text-gray-400'}`}
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
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-sm">
                      <th className="py-3 px-3">Название</th>
                      <th className="py-3 px-3">Автор</th>
                      <th className="py-3 px-3">Загружен</th>
                      <th className="py-3 px-3">Статус</th>
                      <th className="py-3 px-3 text-right">Верификация</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {presets.filter(p => presetFilterServer === "all" || (presetFilterServer.startsWith("project_") ? p.serverProjectId === presetFilterServer.replace("project_", "") : p.serverId === presetFilterServer)).map(p => (
                      <tr key={p.id} className="hover:bg-white/20 transition-colors">
                        <td className="py-3 px-3">
                          <Link href={`/presets/${p.id}`} className="font-semibold text-white hover:text-[#5865F2] transition-colors line-clamp-1">
                            {p.name}
                          </Link>
                        </td>
                        <td className="py-3 px-3 text-gray-300 text-sm">{p.author}</td>
                        <td className="py-3 px-3 text-sm text-gray-400">
                          {new Date(p.createdAt).toLocaleDateString("ru-RU")}
                        </td>
                        <td className="py-3 px-3">
                          {p.isVerified ? (
                            <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                              <img src="/img/Verified.png" alt="Verified" className="h-4 w-auto" />
                              Верифицирован
                            </span>
                          ) : (
                            <span className="text-gray-500 text-xs">Обычный</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleToggleVerify(p.id, p.isVerified)}
                            disabled={verifyingPresetId === p.id}
                            className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${p.isVerified
                                ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white"
                                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                              }`}
                          >
                            {verifyingPresetId === p.id
                              ? "Загрузка..."
                              : p.isVerified
                                ? "Снять галку"
                                : "Верифицировать"
                            }
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === "servers" ? (
            <div className="glass-card overflow-hidden p-6">
              <h2 className="text-xl font-bold text-white mb-4">Управление проектами серверов</h2>
              <ServerAdminTab servers={servers} setServers={setServers} showToast={showToast} />
            </div>
          ) : activeTab === "promocodes" ? (
            <div className="glass-card overflow-hidden p-6">
              <h2 className="text-xl font-bold text-white mb-4">Управление промокодами</h2>
              <PromocodesAdminTab promocodes={promocodes} setPromocodes={setPromocodes} showToast={showToast} />
            </div>
          ) : activeTab === "stats" && initialStats ? (
            <div className="glass-card overflow-hidden p-6">
              <h2 className="text-xl font-bold text-white mb-4">Глобальная статистика</h2>
              <StatsAdminTab stats={initialStats.global} />
            </div>
          ) : (
            <div className="glass-card overflow-hidden p-6">
              <h2 className="text-xl font-bold text-white mb-4">Глобальные настройки</h2>
              <SettingsAdminTab initialSettings={initialSettings} showToast={showToast} />
            </div>
          )}
        </div>

        {/* User edit sidebar pane (Right / One-third width) */}
        {selectedUser && activeTab === "users" && (
          <div className="glass-card p-6 animate-scale-up border-[#5865F2]/20 shadow-2xl self-start">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-lg">Редактор профиля</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-500 hover:text-white font-semibold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Profile Brief */}
            <div className="flex items-center gap-4 mb-6 bg-white/5 p-3 rounded-xl border border-white/5">
              <img
                src={selectedUser.avatar || "/img/window.svg"}
                alt={selectedUser.username}
                className="w-12 h-12 rounded-full border border-white/10"
              />
              <div>
                <h4 className="font-bold text-white">{selectedUser.username}</h4>
                <p className="text-xs text-gray-500 truncate max-w-[180px]">{selectedUser.discordId}</p>
              </div>
            </div>

            {/* Edit Controls */}
            <div className="space-y-5">

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Роль на сайте</label>
                <div className="relative" ref={roleDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedUser.discordId !== "546005790864048140") {
                        setIsRoleDropdownOpen(!isRoleDropdownOpen);
                      }
                    }}
                    disabled={selectedUser.discordId === "546005790864048140"}
                    className="w-full flex items-center justify-between bg-black/40 border border-white/10 text-white rounded-lg p-2.5 outline-none focus:border-[var(--blurple)] transition-all cursor-pointer text-left text-sm"
                  >
                    <span>
                      {editRole === "admin" && "Администратор (Admin)"}
                      {editRole === "developer" && "Разработчик (Developer)"}
                      {editRole === "moderator" && "Модератор (Moderator)"}
                      {editRole === "user" && "Пользователь (User)"}
                    </span>
                    <span className={`transition-transform duration-200 text-gray-400 text-xs ${isRoleDropdownOpen ? "rotate-180" : ""}`}>
                      ▼
                    </span>
                  </button>

                  {isRoleDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1.5 z-[100] glass-card p-1.5 border border-white/10 shadow-2xl backdrop-blur-2xl rounded-xl space-y-1">
                      <button
                        type="button"
                        onClick={() => { setEditRole("user"); setIsRoleDropdownOpen(false); }}
                        className={`w-full text-left p-2.5 rounded-lg text-sm transition-colors cursor-pointer ${editRole === "user"
                            ? "bg-[var(--blurple)] text-[var(--user-msg-text)] font-semibold"
                            : "text-gray-300 hover:bg-white/5 hover:text-white"
                          }`}
                      >
                        Пользователь (User)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditRole("moderator"); setIsRoleDropdownOpen(false); }}
                        className={`w-full text-left p-2.5 rounded-lg text-sm transition-colors cursor-pointer ${editRole === "moderator"
                            ? "bg-[var(--blurple)] text-[var(--user-msg-text)] font-semibold"
                            : "text-gray-300 hover:bg-white/5 hover:text-white"
                          }`}
                      >
                        Модератор (Moderator)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditRole("developer"); setIsRoleDropdownOpen(false); }}
                        className={`w-full text-left p-2.5 rounded-lg text-sm transition-colors cursor-pointer ${editRole === "developer"
                            ? "bg-[var(--blurple)] text-[var(--user-msg-text)] font-semibold"
                            : "text-gray-300 hover:bg-white/5 hover:text-white"
                          }`}
                      >
                        Разработчик (Developer)
                      </button>
                      {(selectedUser.role === "admin" || selectedUser.discordId !== "546005790864048140") && (
                        <button
                          type="button"
                          onClick={() => { setEditRole("admin"); setIsRoleDropdownOpen(false); }}
                          className={`w-full text-left p-2.5 rounded-lg text-sm transition-colors cursor-pointer ${editRole === "admin"
                              ? "bg-[var(--blurple)] text-[var(--user-msg-text)] font-semibold"
                              : "text-gray-300 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                          Администратор (Admin)
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {selectedUser.discordId === "546005790864048140" && (
                  <span className="text-[10px] text-amber-500/80 mt-1 block">Основной владелец не может быть понижен в роли.</span>
                )}
              </div>

              {/* Badges Toggles */}
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2.5">Бейджи пользователя</label>
                <div className="space-y-2">
                  {AVAILABLE_BADGES.map(badge => {
                    const isChecked = editBadges.includes(badge.id);
                    return (
                      <button
                        key={badge.id}
                        onClick={() => handleToggleBadge(badge.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg border text-left text-xs font-semibold transition-all cursor-pointer ${isChecked
                            ? "bg-[#5865F2]/10 border-[#5865F2]/30 text-white"
                            : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <img src={`/img/${badge.file}`} alt={badge.label} className="h-5 w-auto" />
                          <span>{badge.label}</span>
                        </div>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${isChecked
                            ? "bg-[#5865F2] border-[#5865F2] text-white"
                            : "border-gray-600 bg-transparent"
                          }`}>
                          {isChecked && "✓"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload Access Toggle */}
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2.5">Загрузка пресетов</label>
                <button
                  onClick={() => setEditCanUpload(!editCanUpload)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border text-left text-sm font-semibold transition-all cursor-pointer ${editCanUpload
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                      : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{editCanUpload ? "✅" : "❌"}</span>
                    <span>{editCanUpload ? "Разрешено" : "Заблокировано"}</span>
                  </div>
                </button>
              </div>

              {/* Premium Status & Revoke */}
              {selectedUser.isPremium && (
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2.5">Premium Подписка</label>
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                    <p className="text-amber-400 text-sm font-semibold mb-1 flex items-center gap-2">
                      <span>👑 Активна</span>
                    </p>
                    {selectedUser.premiumUntil && (
                      <p className="text-xs text-gray-400 mb-3">
                        До: {new Date(selectedUser.premiumUntil).toLocaleDateString("ru-RU")}
                      </p>
                    )}
                    <button
                      onClick={handleRevokePremium}
                      disabled={savingUserId === selectedUser.id}
                      className="w-full bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-300 rounded-lg py-2 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {savingUserId === selectedUser.id ? "Обработка..." : "Забрать Premium"}
                    </button>
                  </div>
                </div>
              )}

              {/* User Statistics */}
              {initialStats && initialStats.users[selectedUser.discordId] && (
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2.5">📊 Статистика активности</label>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-3">
                    <div>
                      <h5 className="text-xs font-bold text-[#5865F2] mb-1">Запросы к ИИ-ассистенту</h5>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className="bg-black/30 p-1.5 rounded"><span className="block text-gray-500">24ч</span><strong className="text-white">{initialStats.users[selectedUser.discordId].ai.day}</strong></div>
                        <div className="bg-black/30 p-1.5 rounded"><span className="block text-gray-500">30д</span><strong className="text-white">{initialStats.users[selectedUser.discordId].ai.month}</strong></div>
                        <div className="bg-black/30 p-1.5 rounded"><span className="block text-gray-500">Год</span><strong className="text-white">{initialStats.users[selectedUser.discordId].ai.year}</strong></div>
                        <div className="bg-black/30 p-1.5 rounded"><span className="block text-gray-500">Всего</span><strong className="text-emerald-400">{initialStats.users[selectedUser.discordId].ai.total}</strong></div>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-[#5865F2] mb-1">Созданные экзамены</h5>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className="bg-black/30 p-1.5 rounded"><span className="block text-gray-500">24ч</span><strong className="text-white">{initialStats.users[selectedUser.discordId].exams.day}</strong></div>
                        <div className="bg-black/30 p-1.5 rounded"><span className="block text-gray-500">30д</span><strong className="text-white">{initialStats.users[selectedUser.discordId].exams.month}</strong></div>
                        <div className="bg-black/30 p-1.5 rounded"><span className="block text-gray-500">Год</span><strong className="text-white">{initialStats.users[selectedUser.discordId].exams.year}</strong></div>
                        <div className="bg-black/30 p-1.5 rounded"><span className="block text-gray-500">Всего</span><strong className="text-emerald-400">{initialStats.users[selectedUser.discordId].exams.total}</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Ban & Save/Cancel buttons */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2.5">Глобальная блокировка</label>
                  <button
                    onClick={() => setEditIsBanned(!editIsBanned)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border text-left text-sm font-semibold transition-all cursor-pointer ${
                      !editIsBanned
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{!editIsBanned ? "✅" : "⛔"}</span>
                      <span>{!editIsBanned ? "Аккаунт активен" : "Аккаунт заблокирован"}</span>
                    </div>
                  </button>
                </div>
                
                {editIsBanned && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2.5">Причина блокировки</label>
                    <textarea
                      value={editBanReason}
                      onChange={e => setEditBanReason(e.target.value)}
                      placeholder="Например: Нарушение правил сайта, спам пресетами..."
                      className="w-full bg-black/40 border border-white/10 text-white rounded-lg p-3 outline-none focus:border-red-500 text-sm h-20 resize-none"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="flex-1 btn-secondary text-xs !py-2 cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSaveUser}
                    disabled={savingUserId === selectedUser.id}
                    className="flex-1 btn-primary text-xs !py-2 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {savingUserId === selectedUser.id ? "Сохранение..." : "Сохранить"}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Premium Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-scale-up">
          <div className={`glass-card p-4 flex items-center gap-3 border shadow-2xl backdrop-blur-xl ${toast.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-emerald-950/20"
              : "border-red-500/30 bg-red-500/10 text-red-300 shadow-red-950/20"
            }`}>
            <span className="text-xl">{toast.type === "success" ? "✨" : "⚠️"}</span>
            <span className="text-sm font-semibold pr-4">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-gray-400 hover:text-white cursor-pointer font-bold text-xs"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatsAdminTab({ stats }: { stats: any }) {
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* AI Stats */}
        <div className="bg-[#5865F2]/10 border border-[#5865F2]/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#5865F2]/20 text-[#5865F2] rounded-xl flex items-center justify-center text-2xl">🤖</div>
            <h3 className="text-xl font-bold text-white">ИИ-Ассистент</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/40 p-4 rounded-xl text-center">
              <span className="block text-gray-400 text-sm mb-1">За 24 часа</span>
              <strong className="text-3xl text-white font-black">{stats.ai.day}</strong>
            </div>
            <div className="bg-black/40 p-4 rounded-xl text-center">
              <span className="block text-gray-400 text-sm mb-1">За месяц</span>
              <strong className="text-3xl text-white font-black">{stats.ai.month}</strong>
            </div>
            <div className="bg-black/40 p-4 rounded-xl text-center">
              <span className="block text-gray-400 text-sm mb-1">За год</span>
              <strong className="text-3xl text-white font-black">{stats.ai.year}</strong>
            </div>
            <div className="bg-black/40 p-4 rounded-xl text-center border border-emerald-500/30">
              <span className="block text-emerald-400 text-sm mb-1 font-bold">Всё время</span>
              <strong className="text-3xl text-emerald-400 font-black">{stats.ai.total}</strong>
            </div>
          </div>
        </div>

        {/* Exams Stats */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center text-2xl">📝</div>
            <h3 className="text-xl font-bold text-white">Экзамены</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/40 p-4 rounded-xl text-center">
              <span className="block text-gray-400 text-sm mb-1">За 24 часа</span>
              <strong className="text-3xl text-white font-black">{stats.exams.day}</strong>
            </div>
            <div className="bg-black/40 p-4 rounded-xl text-center">
              <span className="block text-gray-400 text-sm mb-1">За месяц</span>
              <strong className="text-3xl text-white font-black">{stats.exams.month}</strong>
            </div>
            <div className="bg-black/40 p-4 rounded-xl text-center">
              <span className="block text-gray-400 text-sm mb-1">За год</span>
              <strong className="text-3xl text-white font-black">{stats.exams.year}</strong>
            </div>
            <div className="bg-black/40 p-4 rounded-xl text-center border border-emerald-500/30">
              <span className="block text-emerald-400 text-sm mb-1 font-bold">Всё время</span>
              <strong className="text-3xl text-emerald-400 font-black">{stats.exams.total}</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function ServerAdminTab({ servers, setServers, showToast }: {
  servers: any[],
  setServers: React.Dispatch<React.SetStateAction<any[]>>,
  showToast: (msg: string, type: "success" | "error") => void
}) {
  const [name, setName] = useState("");
    const [projectName, setProjectName] = useState("");
  const [iconBase64, setIconBase64] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [discordRoleId, setDiscordRoleId] = useState("");
  const [loading, setLoading] = useState(false);

  // Per-server editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWebhook, setEditWebhook] = useState("");
  const [editRoleId, setEditRoleId] = useState("");
    const [editProjectName, setEditProjectName] = useState("");
  const [editIconBase64, setEditIconBase64] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setEditIconBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setIconBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    if (!projectName) return showToast("Укажите название проекта (группы)", "error");
    if (!name && !iconBase64) return showToast("Иконка обязательна при создании нового проекта", "error");
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "create", 
          name: name || projectName, // If no server name, just pass project name to create only project
          projectName: projectName, 
          iconBase64, 
          webhookUrl: webhookUrl || null, 
          discordRoleId: discordRoleId || null 
        })
      });
      if (res.ok) {
        const data = await res.json();
        setServers(data.projects);
        setName("");
          setProjectName("");
        setIconBase64("");
        setWebhookUrl("");
        setDiscordRoleId("");
        showToast("Сервер добавлен", "success");
      } else {
        showToast("Ошибка при создании", "error");
      }
    } catch (e) {
      showToast("Системная ошибка", "error");
    }
    setLoading(false);
  };

  const handleSaveEdit = async (id: string) => {
    setEditLoading(true);
    try {
      const res = await fetch("/api/admin/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id,
          name: servers.find(s => s.id === id)?.name,
          webhookUrl: editWebhook || null,
          projectName: editProjectName || null,
          discordRoleId: editRoleId || null,
          iconBase64: editIconBase64 || undefined,
        })
      });
      if (res.ok) {
        const data = await res.json();
        setServers(data.projects);
        setEditingId(null);
        showToast("Настройки сохранены", "success");
      } else {
        showToast("Ошибка при сохранении", "error");
      }
    } catch (e) {
      showToast("Системная ошибка", "error");
    }
    setEditLoading(false);
  };

    const handleDeleteServer = async (serverId: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_server", id: serverId })
      });
      if (res.ok) {
        const data = await res.json();
        setServers(data.projects);
        showToast("Сервер удален", "success");
      }
    } catch (e) {
      showToast("Системная ошибка", "error");
    }
    setLoading(false);
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const performDelete = async () => {
    if (!deleteConfirmId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id: deleteConfirmId })
      });
      if (res.ok) {
        const data = await res.json();
        setServers(data.projects);
        showToast("Проект удален", "success");
      } else {
        showToast("Ошибка при удалении", "error");
      }
    } catch (e) {
      showToast("Системная ошибка", "error");
    }
    setLoading(false);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Create form */}
      <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
        <h3 className="text-sm font-bold text-gray-300">➕ Добавить проект или сервер</h3>
        <p className="text-xs text-gray-500 mb-2">
          Чтобы создать новый проект (например, Majestic RP), введите его название в поле «Проект» и загрузите иконку. <br/>
          Чтобы добавить сервер в существующий проект (например, Boston), выберите проект из списка и укажите «Название сервера».
        </p>
        <div className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-bold text-[#5865F2] mb-1">1. Проект (выберите или введите)</label>
            <input
              type="text"
              list="project-names-datalist"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              placeholder="Например: Majestic RP"
              className="w-full bg-black/40 border border-[#5865F2]/30 text-white rounded-lg p-2 outline-none focus:border-[#5865F2] text-sm"
            />
            <datalist id="project-names-datalist">
              {servers.map(p => (
                <option key={p.id} value={p.name} />
              ))}
            </datalist>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-bold text-emerald-400 mb-1">2. Название сервера (опционально)</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Например: Boston (оставьте пустым для создания самого проекта)"
              className="w-full bg-black/40 border border-emerald-500/30 text-white rounded-lg p-2 outline-none focus:border-emerald-500 text-sm"
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs text-gray-400 mb-1">Иконка (PNG)</label>
            <input
              type="file"
              accept="image/png"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
            />
          </div>
        </div>
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-400 mb-1">
              🔔 Discord Webhook URL
              <span className="text-gray-600 ml-1">(опционально)</span>
            </label>
            <input
              type="text"
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="w-full bg-black/40 border border-white/10 text-white rounded-lg p-2 outline-none focus:border-[#5865F2] text-sm font-mono"
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs text-gray-400 mb-1">
              🏷️ ID роли для пинга
              <span className="text-gray-600 ml-1">(опционально)</span>
            </label>
            <input
              type="text"
              value={discordRoleId}
              onChange={e => setDiscordRoleId(e.target.value)}
              placeholder="123456789012345678"
              className="w-full bg-black/40 border border-white/10 text-white rounded-lg p-2 outline-none focus:border-[#5865F2] text-sm font-mono"
            />
          </div>
        </div>
        <button
          onClick={handleCreate}
          disabled={loading}
          className="btn-primary py-2 px-6 mt-1"
        >
          {loading ? "Создаётся..." : "Добавить"}
        </button>
      </div>

      {/* Project/Server list */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        {servers.map(p => (
          <div key={p.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden p-4">
            <div className="flex items-start justify-between mb-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                 <img src={p.iconUrl} alt={p.name} className="w-10 h-10 rounded-lg" />
                 <div>
                    <span className="font-bold text-white text-lg block uppercase tracking-wider">{p.name}</span>
                    <span className="text-[10px] text-gray-500 font-mono">Project ID: {p.id.slice(0, 12)}…</span>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (editingId === p.id) setEditingId(null);
                    else {
                      setEditingId(p.id);
                      setEditWebhook(p.webhookUrl || "");
                      setEditRoleId(p.discordRoleId || "");
                      setEditIconBase64(null);
                    }
                  }}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-[#5865F2]/20 hover:text-white hover:border-[#5865F2]/30 transition-all cursor-pointer"
                  title="Настройки проекта"
                >
                  ⚙️ Настройки
                </button>
                <button
                  onClick={() => setDeleteConfirmId(p.id)}
                  disabled={loading}
                  className="text-red-400 hover:text-red-300 text-xl leading-none p-1 cursor-pointer"
                  title="Удалить проект целиком"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Servers inside this project */}
            <div className="bg-black/20 rounded-lg p-4 mb-4">
              <h5 className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-2">
                СЕРВЕРЫ ПРОЕКТА
                <span className="bg-[#5865F2]/20 text-[#5865F2] px-1.5 rounded-full text-[10px]">{p.servers?.length || 0}</span>
              </h5>
              <div className="flex flex-wrap gap-2">
                {p.servers?.map((s: any) => (
                  <div key={s.id} className="flex items-center gap-1.5 bg-[#5865F2]/10 text-[#5865F2] px-3 py-1.5 rounded-lg text-sm font-semibold border border-[#5865F2]/20 hover:bg-[#5865F2]/20 transition-colors">
                    <span>{s.name}</span>
                    <button onClick={() => handleDeleteServer(s.id)} className="text-[#5865F2] hover:text-red-400 ml-1.5 opacity-70 hover:opacity-100 cursor-pointer">×</button>
                  </div>
                ))}
                {(!p.servers || p.servers.length === 0) && (
                  <span className="text-xs text-gray-500 italic">Нет добавленных серверов</span>
                )}
              </div>
            </div>

            {/* Webhook status badges */}
            <div className="flex gap-2 flex-wrap">
              {p.webhookUrl ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ✓ Вебхук настроен
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/10">
                  Вебхук не настроен
                </span>
              )}
              {p.discordRoleId && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#5865F2]/10 text-[#5865F2] border border-[#5865F2]/20">
                  🏷️ Роль: {p.discordRoleId}
                </span>
              )}
            </div>

            {/* Inline edit panel */}
            {editingId === p.id && (
              <div className="mt-4 border-t border-white/10 pt-4 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">⚙️ Настройки проекта</p>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">🖼️ Изменить иконку (PNG)</label>
                  <input
                    type="file"
                    accept="image/png"
                    onChange={handleEditFileChange}
                    className="w-full text-xs text-gray-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">🔔 Webhook URL</label>
                  <input
                    type="text"
                    value={editWebhook}
                    onChange={e => setEditWebhook(e.target.value)}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="w-full bg-black/40 border border-white/10 text-white rounded-lg p-2 outline-none focus:border-[#5865F2] text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">🏷️ ID роли для пинга</label>
                  <input
                    type="text"
                    value={editRoleId}
                    onChange={e => setEditRoleId(e.target.value)}
                    placeholder="123456789012345678"
                    className="w-full bg-black/40 border border-white/10 text-white rounded-lg p-2 outline-none focus:border-[#5865F2] text-xs font-mono"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex-1 text-xs py-2 px-3 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => handleSaveEdit(p.id)}
                    disabled={editLoading}
                    className="flex-1 text-xs py-2 px-3 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold transition-colors cursor-pointer"
                  >
                    {editLoading ? "Сохранение..." : "Сохранить"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Подтвердите действие</h3>
            <p className="text-gray-400 mb-6">Удалить проект? Пресеты могут потерять привязку.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                disabled={loading}
              >
                Отмена
              </button>
              <button
                onClick={performDelete}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 transition-colors"
              >
                {loading ? "Ожидайте..." : "Удалить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsAdminTab({ initialSettings, showToast }: {
  initialSettings: Record<string, string>,
  showToast: (msg: string, type: "success" | "error") => void
}) {
  const [discordUrl, setDiscordUrl] = useState(initialSettings["discordUrl"] || "https://dsc.gg/lexis");
  const [releasesWebhookUrl, setReleasesWebhookUrl] = useState(initialSettings["RELEASES_WEBHOOK_URL"] || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async (key: string, value: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value })
      });
      if (res.ok) {
        showToast("Настройки успешно сохранены", "success");
      } else {
        showToast("Ошибка при сохранении", "error");
      }
    } catch (e) {
      showToast("Системная ошибка", "error");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/5 p-4 rounded-xl border border-white/10 max-w-lg">
        <label className="block text-sm font-bold text-gray-300 mb-2">Ссылка на Discord сервер</label>
        <p className="text-xs text-gray-500 mb-3">Отображается на главной странице и в программе.</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={discordUrl}
            onChange={e => setDiscordUrl(e.target.value)}
            placeholder="https://dsc.gg/lexis"
            className="flex-1 bg-black/40 border border-white/10 text-white rounded-lg p-2 outline-none focus:border-[#5865F2] text-sm"
          />
          <button
            onClick={() => handleSave("discordUrl", discordUrl)}
            disabled={loading}
            className="btn-primary py-2 px-4 whitespace-nowrap cursor-pointer"
          >
            {loading ? "..." : "Сохранить"}
          </button>
        </div>
      </div>

      <div className="bg-white/5 p-4 rounded-xl border border-white/10 max-w-lg">
        <label className="block text-sm font-bold text-gray-300 mb-2">Discord Webhook для новых Релизов</label>
        <p className="text-xs text-gray-500 mb-3">Сюда будут автоматически отправляться уведомления о новых релизах.</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={releasesWebhookUrl}
            onChange={e => setReleasesWebhookUrl(e.target.value)}
            placeholder="https://discord.com/api/webhooks/..."
            className="flex-1 bg-black/40 border border-white/10 text-white rounded-lg p-2 outline-none focus:border-[#5865F2] text-sm font-mono"
          />
          <button
            onClick={() => handleSave("RELEASES_WEBHOOK_URL", releasesWebhookUrl)}
            disabled={loading}
            className="btn-primary py-2 px-4 whitespace-nowrap cursor-pointer"
          >
            {loading ? "..." : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PromocodesAdminTab({ promocodes, setPromocodes, showToast }: {
  promocodes: Promocode[],
  setPromocodes: React.Dispatch<React.SetStateAction<Promocode[]>>,
  showToast: (msg: string, type: "success" | "error") => void
}) {
  const [code, setCode] = useState("");
  const [days, setDays] = useState(30);
  const [maxUses, setMaxUses] = useState(1);
  const [loading, setLoading] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!code) return showToast("Введите код промокода", "error");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/promocodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, days, maxUses })
      });
      if (res.ok) {
        const data = await res.json();
        setPromocodes([data.promocode, ...promocodes]);
        setCode("");
        setDays(30);
        setMaxUses(1);
        showToast("Промокод создан", "success");
      } else {
        const error = await res.json();
        showToast(error.error || "Ошибка при создании", "error");
      }
    } catch (e) {
      showToast("Системная ошибка", "error");
    }
    setLoading(false);
  };

  const executeDelete = async () => {
    if (!deleteConfirmId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/promocodes?id=${deleteConfirmId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setPromocodes(promocodes.filter(p => p.id !== deleteConfirmId));
        showToast("Промокод удален", "success");
      } else {
        showToast("Ошибка при удалении", "error");
      }
    } catch (e) {
      showToast("Системная ошибка", "error");
    }
    setLoading(false);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Create form */}
      <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
        <h3 className="text-sm font-bold text-gray-300 mb-3">➕ Создать промокод</h3>
        <div className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs text-gray-400 mb-1">Код (любые символы)</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="SUMMER2026"
              className="w-full bg-black/40 border border-white/10 text-white rounded-lg p-2 outline-none focus:border-[#5865F2] text-sm font-mono"
            />
          </div>
          <div className="w-[100px]">
            <label className="block text-xs text-gray-400 mb-1">Дней премиума</label>
            <input
              type="number"
              min="1"
              value={days}
              onChange={e => setDays(parseInt(e.target.value) || 1)}
              className="w-full bg-black/40 border border-white/10 text-white rounded-lg p-2 outline-none focus:border-[#5865F2] text-sm"
            />
          </div>
          <div className="w-[120px]">
            <label className="block text-xs text-gray-400 mb-1">Макс. активаций</label>
            <input
              type="number"
              min="1"
              value={maxUses}
              onChange={e => setMaxUses(parseInt(e.target.value) || 1)}
              className="w-full bg-black/40 border border-white/10 text-white rounded-lg p-2 outline-none focus:border-[#5865F2] text-sm"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="btn-primary py-2 px-6 mt-1"
          >
            {loading ? "..." : "Создать"}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="overflow-x-auto no-scrollbar border border-white/10 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-sm">
              <th className="py-3 px-4">Промокод</th>
              <th className="py-3 px-4">Длительность</th>
              <th className="py-3 px-4">Активации</th>
              <th className="py-3 px-4">Создан</th>
              <th className="py-3 px-4 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-black/20">
            {promocodes.map(p => (
              <tr key={p.id} className="hover:bg-white/10 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-white tracking-widest">{p.code}</td>
                <td className="py-3 px-4 text-sm text-[#5865F2] font-semibold">{p.days} дней</td>
                <td className="py-3 px-4 text-sm text-gray-300">
                  <span className={p.uses >= p.maxUses ? "text-red-400 font-bold" : "text-emerald-400"}>
                    {p.uses}
                  </span> / {p.maxUses}
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">
                  {new Date(p.createdAt).toLocaleDateString("ru-RU")}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => setDeleteConfirmId(p.id)}
                    disabled={loading}
                    className="text-red-400 hover:text-white hover:bg-red-500/20 px-2 py-1 rounded transition-colors text-xs"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
            {promocodes.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-500 text-sm">Нет активных промокодов</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card p-6 max-w-sm w-full mx-4 border border-white/10 shadow-2xl relative rounded-xl animate-scale-up">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-4 text-xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]">
              🗑️
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Удаление промокода</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Вы уверены, что хотите удалить этот промокод? Это действие нельзя отменить.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-lg py-2 text-sm font-semibold transition-colors cursor-pointer border border-white/10"
              >
                Отмена
              </button>
              <button
                onClick={executeDelete}
                disabled={loading}
                className="flex-1 bg-red-600/80 hover:bg-red-500 text-white border border-red-500/50 rounded-lg py-2 text-sm font-semibold transition-colors cursor-pointer shadow-lg shadow-red-900/20"
              >
                {loading ? "Удаление..." : "Удалить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

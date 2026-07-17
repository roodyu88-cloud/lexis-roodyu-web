"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  User,
  FolderOpen,
  Gamepad2,
  Tag,
  Settings,
  BarChart3,
  ChevronDown,
  Check,
  CheckCircle2,
  XCircle,
  Crown,
  Ban,
  Sparkles,
  AlertTriangle,
  Bot,
  FileText,
  Plus,
  Bell,
  Image as ImageIcon,
  Trash2,
  X,
  Globe,
  MapPin,
  Eye,
  Activity,
} from "lucide-react";

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

  const TABS: { id: typeof activeTab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: "users", label: "Пользователи", icon: User, count: users.length },
    { id: "presets", label: "Пресеты", icon: FolderOpen, count: presets.length },
    { id: "servers", label: "Проекты", icon: Gamepad2, count: servers.length },
    { id: "promocodes", label: "Промокоды", icon: Tag, count: promocodes.length },
    { id: "settings", label: "Настройки", icon: Settings },
    { id: "stats", label: "Статистика", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs Menu — glassmorphism rail, sliding pill highlight on the active item */}
      <div className="rc-admin-nav p-2">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSelectedUser(null); }}
                className={`rc-admin-nav-item shrink-0 px-4 py-2.5 rounded-[var(--radius-lg)] cursor-pointer ${isActive
                    ? "is-active bg-[var(--color-mist)] shadow-[var(--shadow-button-lift)]"
                    : "text-[var(--color-ash)] hover:text-[var(--color-pure-white)] hover:bg-[var(--overlay-soft)]"
                  }`}
              >
                <Icon className="w-4 h-4" strokeWidth={2.25} />
                <span>{tab.label}</span>
                {typeof tab.count === "number" && (
                  <span className={`font-data text-xs px-1.5 py-0.5 rounded-full ${isActive ? "bg-black/15" : "bg-[var(--overlay-soft)] text-[var(--color-smoke)]"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Table / List list (Left / Two-thirds width) */}
        <div className={`${selectedUser ? "lg:col-span-2" : "lg:col-span-3"} transition-all`}>
          {activeTab === "users" ? (
            <div className="rc-card-edge bg-[var(--color-ink)] overflow-hidden p-6">
              <h2 className="text-xl font-bold text-[var(--color-pure-white)] mb-4">Список пользователей</h2>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b text-sm" style={{ borderColor: "var(--color-hairline)", color: "var(--color-ash)" }}>
                      <th className="py-3 px-3">Пользователь</th>
                      <th className="py-3 px-3">Discord ID</th>
                      <th className="py-3 px-3">Роль</th>
                      <th className="py-3 px-3">Бейджи</th>
                      <th className="py-3 px-3 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-hairline)]">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-[var(--overlay-soft)] transition-colors">
                        <td className="py-3 px-3 flex items-center gap-3">
                          <img
                            src={u.avatar || "/img/window.svg"}
                            alt={u.username}
                            className="w-8 h-8 rounded-full border"
                            style={{ borderColor: "var(--color-hairline)" }}
                          />
                          <span className="font-semibold text-[var(--color-pure-white)]">{u.username}</span>
                        </td>
                        <td className="py-3 px-3 text-xs font-data text-[var(--color-ash)]">{u.discordId}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${u.role === "admin"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : u.role === "developer"
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                : u.role === "moderator"
                                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                  : "bg-[var(--overlay-soft)] text-[var(--color-ash)]"
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
                            {u.badges.length === 0 && <span className="text-xs text-[var(--color-smoke)]">-</span>}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleSelectUser(u)}
                            className="rc-btn-ghost text-sm px-2.5 py-1.5"
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
            <div className="rc-card-edge bg-[var(--color-ink)] overflow-hidden p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <h2 className="text-xl font-bold text-[var(--color-pure-white)]">Управление пресетами</h2>
                <div className="flex items-center gap-2 relative">
                  <label className="text-sm text-[var(--color-ash)] font-semibold">Фильтр по серверу:</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsPresetFilterOpen(!isPresetFilterOpen)}
                      className="rc-input rounded-lg px-4 py-2 text-sm min-w-[200px] flex justify-between items-center gap-2 hover:bg-[var(--overlay-soft-strong)] transition-colors cursor-pointer"
                    >
                      <span>
                        {presetFilterServer === "all"
                          ? "Все серверы"
                          : presetFilterServer.startsWith("project_")
                            ? `Любой сервер (${servers.find(p => p.id === presetFilterServer.replace("project_", ""))?.name || "Неизвестно"})`
                            : servers.flatMap(p => p.servers || []).find(s => s.id === presetFilterServer)?.name || "Неизвестно"
                        }
                      </span>
                      <svg className={`w-4 h-4 text-[var(--color-smoke)] transition-transform ${isPresetFilterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isPresetFilterOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsPresetFilterOpen(false)} />
                        <div
                          className="absolute right-0 mt-2 w-[240px] rounded-xl overflow-hidden z-20 shadow-2xl animate-scale-up max-h-80 overflow-y-auto no-scrollbar"
                          style={{ background: "color-mix(in srgb, var(--color-ink) 95%, transparent)", border: "1px solid var(--color-hairline)", backdropFilter: "blur(24px)" }}
                        >
                          <button
                            type="button"
                            onClick={() => { setPresetFilterServer("all"); setIsPresetFilterOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[var(--overlay-soft)] cursor-pointer ${presetFilterServer === "all" ? 'font-bold bg-[var(--overlay-soft)]' : 'text-[var(--color-ash)]'}`}
                            style={presetFilterServer === "all" ? { color: "var(--color-pure-white)" } : undefined}
                          >
                            Все серверы
                          </button>
                          {servers.map(p => (
                            <div key={p.id}>
                              <div className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: "var(--color-smoke)", background: "var(--color-obsidian)" }}>
                                {p.iconUrl && <img src={p.iconUrl} className="w-4 h-4 rounded" alt="icon" />}
                                {p.name}
                              </div>
                              <button
                                type="button"
                                onClick={() => { setPresetFilterServer(`project_${p.id}`); setIsPresetFilterOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 pl-8 text-sm transition-colors hover:bg-[var(--overlay-soft)] flex items-center gap-2 cursor-pointer ${presetFilterServer === `project_${p.id}` ? 'font-bold bg-[var(--overlay-soft)]' : 'text-[var(--color-ash)]'}`}
                                style={presetFilterServer === `project_${p.id}` ? { color: "var(--color-pure-white)" } : undefined}
                              >
                                <span>Любой сервер</span>
                              </button>
                              {p.servers?.map((s: any) => (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => { setPresetFilterServer(s.id); setIsPresetFilterOpen(false); }}
                                  className={`w-full text-left px-4 py-2.5 pl-8 text-sm transition-colors hover:bg-[var(--overlay-soft)] flex items-center gap-2 cursor-pointer ${presetFilterServer === s.id ? 'font-bold bg-[var(--overlay-soft)]' : 'text-[var(--color-ash)]'}`}
                                  style={presetFilterServer === s.id ? { color: "var(--color-pure-white)" } : undefined}
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
                    <tr className="border-b text-sm" style={{ borderColor: "var(--color-hairline)", color: "var(--color-ash)" }}>
                      <th className="py-3 px-3">Название</th>
                      <th className="py-3 px-3">Автор</th>
                      <th className="py-3 px-3">Загружен</th>
                      <th className="py-3 px-3">Статус</th>
                      <th className="py-3 px-3 text-right">Верификация</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-hairline)]">
                    {presets.filter(p => presetFilterServer === "all" || (presetFilterServer.startsWith("project_") ? p.serverProjectId === presetFilterServer.replace("project_", "") : p.serverId === presetFilterServer)).map(p => (
                      <tr key={p.id} className="hover:bg-[var(--overlay-soft)] transition-colors">
                        <td className="py-3 px-3">
                          <Link href={`/presets/${p.id}`} className="font-semibold text-[var(--color-pure-white)] hover:text-[var(--color-coral-text)] transition-colors line-clamp-1">
                            {p.name}
                          </Link>
                        </td>
                        <td className="py-3 px-3 text-[var(--color-ash)] text-sm">{p.author}</td>
                        <td className="py-3 px-3 text-sm text-[var(--color-ash)] font-data">
                          {new Date(p.createdAt).toLocaleDateString("ru-RU")}
                        </td>
                        <td className="py-3 px-3">
                          {p.isVerified ? (
                            <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                              <img src="/img/Verified.png" alt="Verified" className="h-4 w-auto" />
                              Верифицирован
                            </span>
                          ) : (
                            <span className="text-[var(--color-smoke)] text-xs">Обычный</span>
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
            <div className="rc-card-edge bg-[var(--color-ink)] overflow-hidden p-6">
              <h2 className="text-xl font-bold text-[var(--color-pure-white)] mb-4">Управление проектами серверов</h2>
              <ServerAdminTab servers={servers} setServers={setServers} showToast={showToast} />
            </div>
          ) : activeTab === "promocodes" ? (
            <div className="rc-card-edge bg-[var(--color-ink)] overflow-hidden p-6">
              <h2 className="text-xl font-bold text-[var(--color-pure-white)] mb-4">Управление промокодами</h2>
              <PromocodesAdminTab promocodes={promocodes} setPromocodes={setPromocodes} showToast={showToast} />
            </div>
          ) : activeTab === "stats" && initialStats ? (
            <div className="rc-card-edge bg-[var(--color-ink)] overflow-hidden p-6">
              <h2 className="text-xl font-bold text-[var(--color-pure-white)] mb-4">Глобальная статистика</h2>
              <StatsAdminTab stats={initialStats.global} />
            </div>
          ) : (
            <div className="rc-card-edge bg-[var(--color-ink)] overflow-hidden p-6">
              <h2 className="text-xl font-bold text-[var(--color-pure-white)] mb-4">Глобальные настройки</h2>
              <SettingsAdminTab initialSettings={initialSettings} showToast={showToast} />
            </div>
          )}
        </div>

        {/* User edit sidebar pane (Right / One-third width) */}
        {selectedUser && activeTab === "users" && (
          <div className="rc-card-edge bg-[var(--color-ink)] p-6 animate-scale-up shadow-2xl self-start" style={{ borderColor: "var(--color-hairline)" }}>
            <div className="flex justify-between items-center mb-5 pb-3 border-b" style={{ borderColor: "var(--color-hairline)" }}>
              <h3 className="font-bold text-[var(--color-pure-white)] text-lg">Редактор профиля</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-[var(--color-smoke)] hover:text-[var(--color-pure-white)] cursor-pointer p-1 rounded-lg hover:bg-[var(--overlay-soft)] transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>

            {/* Profile Brief */}
            <div className="flex items-center gap-4 mb-6 p-3 rounded-xl border" style={{ background: "var(--overlay-soft)", borderColor: "var(--color-hairline)" }}>
              <img
                src={selectedUser.avatar || "/img/window.svg"}
                alt={selectedUser.username}
                className="w-12 h-12 rounded-full border"
                style={{ borderColor: "var(--color-hairline)" }}
              />
              <div>
                <h4 className="font-bold text-[var(--color-pure-white)]">{selectedUser.username}</h4>
                <p className="text-xs text-[var(--color-smoke)] truncate max-w-[180px] font-data">{selectedUser.discordId}</p>
              </div>
            </div>

            {/* Edit Controls */}
            <div className="space-y-5">

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-semibold text-[var(--color-ash)] mb-2">Роль на сайте</label>
                <div className="relative" ref={roleDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedUser.discordId !== "546005790864048140") {
                        setIsRoleDropdownOpen(!isRoleDropdownOpen);
                      }
                    }}
                    disabled={selectedUser.discordId === "546005790864048140"}
                    className="rc-input w-full flex items-center justify-between rounded-lg p-2.5 transition-all cursor-pointer text-left text-sm"
                  >
                    <span>
                      {editRole === "admin" && "Администратор (Admin)"}
                      {editRole === "developer" && "Разработчик (Developer)"}
                      {editRole === "moderator" && "Модератор (Moderator)"}
                      {editRole === "user" && "Пользователь (User)"}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-[var(--color-ash)] transition-transform duration-200 ${isRoleDropdownOpen ? "rotate-180" : ""}`} strokeWidth={2.25} />
                  </button>

                  {isRoleDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1.5 z-[100] rc-card-edge bg-[var(--color-ink)] p-1.5 shadow-2xl rounded-xl space-y-1" style={{ backdropFilter: "blur(24px)" }}>
                      <button
                        type="button"
                        onClick={() => { setEditRole("user"); setIsRoleDropdownOpen(false); }}
                        className={`w-full text-left p-2.5 rounded-lg text-sm transition-colors cursor-pointer ${editRole === "user"
                            ? "bg-[var(--color-mist)] text-[var(--color-iron)] font-semibold"
                            : "text-[var(--color-ash)] hover:bg-[var(--overlay-soft)] hover:text-[var(--color-pure-white)]"
                          }`}
                      >
                        Пользователь (User)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditRole("moderator"); setIsRoleDropdownOpen(false); }}
                        className={`w-full text-left p-2.5 rounded-lg text-sm transition-colors cursor-pointer ${editRole === "moderator"
                            ? "bg-[var(--color-mist)] text-[var(--color-iron)] font-semibold"
                            : "text-[var(--color-ash)] hover:bg-[var(--overlay-soft)] hover:text-[var(--color-pure-white)]"
                          }`}
                      >
                        Модератор (Moderator)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditRole("developer"); setIsRoleDropdownOpen(false); }}
                        className={`w-full text-left p-2.5 rounded-lg text-sm transition-colors cursor-pointer ${editRole === "developer"
                            ? "bg-[var(--color-mist)] text-[var(--color-iron)] font-semibold"
                            : "text-[var(--color-ash)] hover:bg-[var(--overlay-soft)] hover:text-[var(--color-pure-white)]"
                          }`}
                      >
                        Разработчик (Developer)
                      </button>
                      {(selectedUser.role === "admin" || selectedUser.discordId !== "546005790864048140") && (
                        <button
                          type="button"
                          onClick={() => { setEditRole("admin"); setIsRoleDropdownOpen(false); }}
                          className={`w-full text-left p-2.5 rounded-lg text-sm transition-colors cursor-pointer ${editRole === "admin"
                              ? "bg-[var(--color-mist)] text-[var(--color-iron)] font-semibold"
                              : "text-[var(--color-ash)] hover:bg-[var(--overlay-soft)] hover:text-[var(--color-pure-white)]"
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
                <label className="block text-sm font-semibold text-[var(--color-ash)] mb-2.5">Бейджи пользователя</label>
                <div className="space-y-2">
                  {AVAILABLE_BADGES.map(badge => {
                    const isChecked = editBadges.includes(badge.id);
                    return (
                      <button
                        key={badge.id}
                        onClick={() => handleToggleBadge(badge.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg border text-left text-xs font-semibold transition-all cursor-pointer ${isChecked
                            ? "text-[var(--color-pure-white)]"
                            : "bg-[var(--overlay-soft)] border-[var(--overlay-soft)] text-[var(--color-ash)] hover:bg-[var(--overlay-soft-strong)] hover:text-[var(--color-pure-white)]"
                          }`}
                        style={isChecked ? { background: "var(--overlay-soft-strong)", borderColor: "var(--color-pure-white)" } : undefined}
                      >
                        <div className="flex items-center gap-2">
                          <img src={`/img/${badge.file}`} alt={badge.label} className="h-5 w-auto" />
                          <span>{badge.label}</span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${isChecked ? "text-[var(--color-mist)]" : "bg-transparent"}`}
                          style={isChecked ? { background: "var(--color-pure-white)", borderColor: "var(--color-pure-white)" } : { borderColor: "var(--color-hairline)" }}
                        >
                          {isChecked && <Check className="w-3 h-3" strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload Access Toggle */}
              <div>
                <label className="block text-sm font-semibold text-[var(--color-ash)] mb-2.5">Загрузка пресетов</label>
                <button
                  onClick={() => setEditCanUpload(!editCanUpload)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border text-left text-sm font-semibold transition-all cursor-pointer ${editCanUpload
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                      : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    {editCanUpload ? <CheckCircle2 className="w-5 h-5" strokeWidth={2} /> : <XCircle className="w-5 h-5" strokeWidth={2} />}
                    <span>{editCanUpload ? "Разрешено" : "Заблокировано"}</span>
                  </div>
                </button>
              </div>

              {/* Premium Status & Revoke */}
              {selectedUser.isPremium && (
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-ash)] mb-2.5">Premium Подписка</label>
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                    <p className="text-amber-400 text-sm font-semibold mb-1 flex items-center gap-2">
                      <Crown className="w-4 h-4" strokeWidth={2.25} />
                      <span>Активна</span>
                    </p>
                    {selectedUser.premiumUntil && (
                      <p className="text-xs text-[var(--color-ash)] mb-3 font-data">
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
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-ash)] mb-2.5">
                    <BarChart3 className="w-3.5 h-3.5" strokeWidth={2.25} />
                    Статистика активности
                  </label>
                  <div className="rounded-lg p-3 space-y-3" style={{ background: "var(--overlay-soft)", border: "1px solid var(--color-hairline)" }}>
                    <div>
                      <h5 className="text-xs font-bold mb-1" style={{ color: "var(--color-coral-text)" }}>Запросы к ИИ-ассистенту</h5>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs font-data">
                        <div className="bg-[var(--color-obsidian)] p-1.5 rounded"><span className="block text-[var(--color-smoke)]">24ч</span><strong className="text-[var(--color-pure-white)]">{initialStats.users[selectedUser.discordId].ai.day}</strong></div>
                        <div className="bg-[var(--color-obsidian)] p-1.5 rounded"><span className="block text-[var(--color-smoke)]">30д</span><strong className="text-[var(--color-pure-white)]">{initialStats.users[selectedUser.discordId].ai.month}</strong></div>
                        <div className="bg-[var(--color-obsidian)] p-1.5 rounded"><span className="block text-[var(--color-smoke)]">Год</span><strong className="text-[var(--color-pure-white)]">{initialStats.users[selectedUser.discordId].ai.year}</strong></div>
                        <div className="bg-[var(--color-obsidian)] p-1.5 rounded"><span className="block text-[var(--color-smoke)]">Всего</span><strong className="text-emerald-400">{initialStats.users[selectedUser.discordId].ai.total}</strong></div>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold mb-1" style={{ color: "var(--color-coral-text)" }}>Созданные экзамены</h5>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs font-data">
                        <div className="bg-[var(--color-obsidian)] p-1.5 rounded"><span className="block text-[var(--color-smoke)]">24ч</span><strong className="text-[var(--color-pure-white)]">{initialStats.users[selectedUser.discordId].exams.day}</strong></div>
                        <div className="bg-[var(--color-obsidian)] p-1.5 rounded"><span className="block text-[var(--color-smoke)]">30д</span><strong className="text-[var(--color-pure-white)]">{initialStats.users[selectedUser.discordId].exams.month}</strong></div>
                        <div className="bg-[var(--color-obsidian)] p-1.5 rounded"><span className="block text-[var(--color-smoke)]">Год</span><strong className="text-[var(--color-pure-white)]">{initialStats.users[selectedUser.discordId].exams.year}</strong></div>
                        <div className="bg-[var(--color-obsidian)] p-1.5 rounded"><span className="block text-[var(--color-smoke)]">Всего</span><strong className="text-emerald-400">{initialStats.users[selectedUser.discordId].exams.total}</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Ban & Save/Cancel buttons */}
              <div className="space-y-4 pt-4 border-t" style={{ borderColor: "var(--color-hairline)" }}>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-ash)] mb-2.5">Глобальная блокировка</label>
                  <button
                    onClick={() => setEditIsBanned(!editIsBanned)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border text-left text-sm font-semibold transition-all cursor-pointer ${
                      !editIsBanned
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {!editIsBanned ? <CheckCircle2 className="w-5 h-5" strokeWidth={2} /> : <Ban className="w-5 h-5" strokeWidth={2} />}
                      <span>{!editIsBanned ? "Аккаунт активен" : "Аккаунт заблокирован"}</span>
                    </div>
                  </button>
                </div>

                {editIsBanned && (
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-ash)] mb-2.5">Причина блокировки</label>
                    <textarea
                      value={editBanReason}
                      onChange={e => setEditBanReason(e.target.value)}
                      placeholder="Например: Нарушение правил сайта, спам пресетами..."
                      className="rc-input w-full rounded-lg p-3 outline-none focus:border-red-500 text-sm h-20 resize-none"
                      style={{ border: "1px solid var(--color-hairline)" }}
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="rc-btn-ghost flex-1 text-xs !py-2"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSaveUser}
                    disabled={savingUserId === selectedUser.id}
                    className="rc-btn flex-1 text-xs !py-2 flex items-center justify-center gap-2"
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
          <div
            className={`rc-card-edge bg-[var(--color-ink)] p-4 flex items-center gap-3 shadow-2xl ${toast.type === "success"
                ? "text-emerald-300 shadow-emerald-950/20"
                : "text-red-300 shadow-red-950/20"
              }`}
            style={{
              backdropFilter: "blur(24px)",
              borderColor: toast.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)",
              background: toast.type === "success" ? "color-mix(in srgb, var(--color-ink) 90%, rgb(16 185 129))" : "color-mix(in srgb, var(--color-ink) 90%, rgb(239 68 68))",
            }}
          >
            {toast.type === "success" ? <Sparkles className="w-5 h-5 shrink-0" strokeWidth={2} /> : <AlertTriangle className="w-5 h-5 shrink-0" strokeWidth={2} />}
            <span className="text-sm font-semibold pr-4">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-[var(--color-ash)] hover:text-[var(--color-pure-white)] cursor-pointer p-0.5 rounded hover:bg-[var(--overlay-soft)] transition-colors"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2.5} />
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
        <div className="rc-admin-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--color-obsidian)", color: "var(--color-coral-text)" }}>
              <Bot className="w-6 h-6" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-pure-white)]">ИИ-Ассистент</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 font-data">
            <div className="bg-[var(--color-obsidian)] p-4 rounded-xl text-center transition-transform duration-200 hover:-translate-y-0.5">
              <span className="block text-[var(--color-ash)] text-sm mb-1">За 24 часа</span>
              <strong className="text-3xl text-[var(--color-pure-white)] font-black">{stats.ai.day}</strong>
            </div>
            <div className="bg-[var(--color-obsidian)] p-4 rounded-xl text-center">
              <span className="block text-[var(--color-ash)] text-sm mb-1">За месяц</span>
              <strong className="text-3xl text-[var(--color-pure-white)] font-black">{stats.ai.month}</strong>
            </div>
            <div className="bg-[var(--color-obsidian)] p-4 rounded-xl text-center">
              <span className="block text-[var(--color-ash)] text-sm mb-1">За год</span>
              <strong className="text-3xl text-[var(--color-pure-white)] font-black">{stats.ai.year}</strong>
            </div>
            <div className="bg-[var(--color-obsidian)] p-4 rounded-xl text-center border border-emerald-500/30">
              <span className="block text-emerald-400 text-sm mb-1 font-bold">Всё время</span>
              <strong className="text-3xl text-emerald-400 font-black">{stats.ai.total}</strong>
            </div>
          </div>
        </div>

        {/* Exams Stats */}
        <div className="rc-admin-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--color-obsidian)", color: "var(--color-coral-text)" }}>
              <FileText className="w-6 h-6" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-pure-white)]">Экзамены</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 font-data">
            <div className="bg-[var(--color-obsidian)] p-4 rounded-xl text-center transition-transform duration-200 hover:-translate-y-0.5">
              <span className="block text-[var(--color-ash)] text-sm mb-1">За 24 часа</span>
              <strong className="text-3xl text-[var(--color-pure-white)] font-black">{stats.exams.day}</strong>
            </div>
            <div className="bg-[var(--color-obsidian)] p-4 rounded-xl text-center">
              <span className="block text-[var(--color-ash)] text-sm mb-1">За месяц</span>
              <strong className="text-3xl text-[var(--color-pure-white)] font-black">{stats.exams.month}</strong>
            </div>
            <div className="bg-[var(--color-obsidian)] p-4 rounded-xl text-center">
              <span className="block text-[var(--color-ash)] text-sm mb-1">За год</span>
              <strong className="text-3xl text-[var(--color-pure-white)] font-black">{stats.exams.year}</strong>
            </div>
            <div className="bg-[var(--color-obsidian)] p-4 rounded-xl text-center border border-emerald-500/30">
              <span className="block text-emerald-400 text-sm mb-1 font-bold">Всё время</span>
              <strong className="text-3xl text-emerald-400 font-black">{stats.exams.total}</strong>
            </div>
          </div>
        </div>

      </div>

      {stats.visits && (
        <>
          {/* Visits Stats */}
          <div className="rc-admin-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--color-obsidian)", color: "var(--color-coral-text)" }}>
                <Activity className="w-6 h-6" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-pure-white)]">Посещаемость сайта</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-data">
              <div className="bg-[var(--color-obsidian)] p-4 rounded-xl text-center">
                <span className="block text-[var(--color-ash)] text-sm mb-1">За 24 часа</span>
                <strong className="text-3xl text-[var(--color-pure-white)] font-black">{stats.visits.day}</strong>
              </div>
              <div className="bg-[var(--color-obsidian)] p-4 rounded-xl text-center">
                <span className="block text-[var(--color-ash)] text-sm mb-1">За месяц</span>
                <strong className="text-3xl text-[var(--color-pure-white)] font-black">{stats.visits.month}</strong>
              </div>
              <div className="bg-[var(--color-obsidian)] p-4 rounded-xl text-center">
                <span className="block text-[var(--color-ash)] text-sm mb-1">За год</span>
                <strong className="text-3xl text-[var(--color-pure-white)] font-black">{stats.visits.year}</strong>
              </div>
              <div className="bg-[var(--color-obsidian)] p-4 rounded-xl text-center border border-emerald-500/30">
                <span className="block text-emerald-400 text-sm mb-1 font-bold">Всё время</span>
                <strong className="text-3xl text-emerald-400 font-black">{stats.visits.total}</strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Pages */}
            <div className="rc-admin-card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--color-obsidian)", color: "var(--color-coral-text)" }}>
                  <Eye className="w-5 h-5" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold text-[var(--color-pure-white)]">Страницы</h3>
              </div>
              <div className="space-y-2 font-data">
                {stats.topPages.map((p: { path: string; views: number }) => (
                  <div key={p.path} className="flex items-center justify-between bg-[var(--color-obsidian)] px-4 py-2.5 rounded-lg">
                    <span className="text-sm text-[var(--color-ash)]">{p.path}</span>
                    <strong className="text-sm text-[var(--color-pure-white)]">{p.views}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Locations */}
            <div className="rc-admin-card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--color-obsidian)", color: "var(--color-coral-text)" }}>
                  <MapPin className="w-5 h-5" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold text-[var(--color-pure-white)]">География</h3>
              </div>
              <div className="space-y-2 font-data">
                {stats.topLocations.map((l: { country: string; city: string; count: number }) => (
                  <div key={`${l.country}-${l.city}`} className="flex items-center justify-between bg-[var(--color-obsidian)] px-4 py-2.5 rounded-lg">
                    <span className="text-sm text-[var(--color-ash)]">{l.city}, {l.country}</span>
                    <strong className="text-sm text-[var(--color-pure-white)]">{l.count}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent IPs */}
          <div className="rounded-2xl p-6 overflow-x-auto" style={{ background: "var(--overlay-soft)", border: "1px solid var(--color-hairline)" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--color-obsidian)", color: "var(--color-coral-text)" }}>
                <Globe className="w-5 h-5" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-pure-white)]">Последние посещения</h3>
            </div>
            <table className="w-full text-sm font-data min-w-[500px]">
              <thead>
                <tr className="text-left text-[var(--color-smoke)] border-b" style={{ borderColor: "var(--color-hairline)" }}>
                  <th className="pb-2 pr-4 font-medium">IP</th>
                  <th className="pb-2 pr-4 font-medium">Местоположение</th>
                  <th className="pb-2 pr-4 font-medium">Страница</th>
                  <th className="pb-2 font-medium">Время</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentVisits.map((v: { ip: string; location: string; page: string; time: string }, i: number) => (
                  <tr key={i} className="border-b last:border-0" style={{ borderColor: "var(--color-hairline)" }}>
                    <td className="py-2.5 pr-4 text-[var(--color-pure-white)]">{v.ip}</td>
                    <td className="py-2.5 pr-4 text-[var(--color-ash)]">{v.location}</td>
                    <td className="py-2.5 pr-4 text-[var(--color-ash)]">{v.page}</td>
                    <td className="py-2.5 text-[var(--color-smoke)]">{v.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
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
      <div className="space-y-4 p-4 rounded-xl" style={{ background: "var(--overlay-soft)", border: "1px solid var(--color-hairline)" }}>
        <h3 className="text-sm font-bold text-[var(--color-mist)] flex items-center gap-1.5">
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Добавить проект или сервер
        </h3>
        <p className="text-xs text-[var(--color-smoke)] mb-2">
          Чтобы создать новый проект (например, Majestic RP), введите его название в поле «Проект» и загрузите иконку. <br/>
          Чтобы добавить сервер в существующий проект (например, Boston), выберите проект из списка и укажите «Название сервера».
        </p>
        <div className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-bold mb-1" style={{ color: "var(--color-coral-text)" }}>1. Проект (выберите или введите)</label>
            <input
              type="text"
              list="project-names-datalist"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              placeholder="Например: Majestic RP"
              className="rc-input w-full rounded-lg p-2 text-sm"
              style={{ border: "1px solid color-mix(in srgb, var(--color-coral-text) 30%, transparent)" }}
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
              className="rc-input w-full rounded-lg p-2 text-sm border border-emerald-500/30 focus:border-emerald-500"
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs text-[var(--color-ash)] mb-1">Иконка (PNG)</label>
            <input
              type="file"
              accept="image/png"
              onChange={handleFileChange}
              className="w-full text-sm text-[var(--color-ash)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-graphite)] file:text-[var(--color-pure-white)] hover:file:opacity-80"
            />
          </div>
        </div>
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="flex items-center gap-1.5 text-xs text-[var(--color-ash)] mb-1">
              <Bell className="w-3.5 h-3.5" strokeWidth={2.25} />
              Discord Webhook URL
              <span className="text-[var(--color-smoke)] ml-1">(опционально)</span>
            </label>
            <input
              type="text"
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="rc-input w-full rounded-lg p-2 text-sm font-data"
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="flex items-center gap-1.5 text-xs text-[var(--color-ash)] mb-1">
              <Tag className="w-3.5 h-3.5" strokeWidth={2.25} />
              ID роли для пинга
              <span className="text-[var(--color-smoke)] ml-1">(опционально)</span>
            </label>
            <input
              type="text"
              value={discordRoleId}
              onChange={e => setDiscordRoleId(e.target.value)}
              placeholder="123456789012345678"
              className="rc-input w-full rounded-lg p-2 text-sm font-data"
            />
          </div>
        </div>
        <button
          onClick={handleCreate}
          disabled={loading}
          className="rc-btn py-2 px-6 mt-1"
        >
          {loading ? "Создаётся..." : "Добавить"}
        </button>
      </div>

      {/* Project/Server list — icon-hero tile pattern: bordered card with a distinct
          top zone (project icon over a subtle coral radial glow, hairline separator)
          above the management content. These are management panels rather than pure
          navigation links, so the hover arrow badge + lift from the presets/home
          reference is intentionally omitted — actions here are inline buttons that
          are always visible, not a click-through destination. */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        {servers.map(p => (
          <div key={p.id} className="rc-card-edge bg-[var(--color-ink)] !p-0 overflow-hidden">
            <div className="relative flex items-start justify-between gap-3 px-5 py-4 overflow-hidden" style={{ background: "var(--color-obsidian)", borderBottom: "1px solid var(--color-hairline)" }}>
              <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(circle at 22% 20%, color-mix(in srgb, var(--color-coral-pulse) 10%, transparent), transparent 60%)" }} />
              <div className="flex items-center gap-3 relative z-10">
                 <img src={p.iconUrl} alt={p.name} className="w-11 h-11 rounded-xl" style={{ border: "1px solid var(--color-hairline)", boxShadow: "var(--shadow-key)" }} />
                 <div>
                    <span className="font-bold text-[var(--color-pure-white)] text-lg block uppercase tracking-wider">{p.name}</span>
                    <span className="text-[10px] text-[var(--color-smoke)] font-data">Project ID: {p.id.slice(0, 12)}…</span>
                 </div>
              </div>
              <div className="flex items-center gap-2 relative z-10">
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
                  className="rc-btn-ghost flex items-center gap-1.5 text-xs px-2.5 py-1.5"
                  title="Настройки проекта"
                >
                  <Settings className="w-3.5 h-3.5" strokeWidth={2.25} />
                  Настройки
                </button>
                <button
                  onClick={() => setDeleteConfirmId(p.id)}
                  disabled={loading}
                  className="text-red-400 hover:text-red-300 leading-none p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Удалить проект целиком"
                >
                  <X className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            <div className="p-5">
            {/* Servers inside this project */}
            <div className="rounded-lg p-4 mb-4" style={{ background: "var(--color-obsidian)", border: "1px solid var(--color-hairline)" }}>
              <h5 className="text-xs font-bold text-[var(--color-ash)] mb-3 flex items-center gap-2">
                СЕРВЕРЫ ПРОЕКТА
                <span className="px-1.5 rounded-full text-[10px]" style={{ background: "var(--overlay-soft-strong)", color: "var(--color-pure-white)" }}>{p.servers?.length || 0}</span>
              </h5>
              <div className="flex flex-wrap gap-2">
                {p.servers?.map((s: any) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                    style={{ background: "var(--overlay-soft)", color: "var(--color-pure-white)", border: "1px solid var(--color-hairline)" }}
                  >
                    <span>{s.name}</span>
                    <button onClick={() => handleDeleteServer(s.id)} className="text-[var(--color-ash)] hover:text-red-400 ml-1.5 opacity-70 hover:opacity-100 cursor-pointer">×</button>
                  </div>
                ))}
                {(!p.servers || p.servers.length === 0) && (
                  <span className="text-xs text-[var(--color-smoke)] italic">Нет добавленных серверов</span>
                )}
              </div>
            </div>

            {/* Webhook status badges */}
            <div className="flex gap-2 flex-wrap">
              {p.webhookUrl ? (
                <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Check className="w-3 h-3" strokeWidth={3} />
                  Вебхук настроен
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "var(--overlay-soft)", color: "var(--color-smoke)", border: "1px solid var(--color-hairline)" }}>
                  Вебхук не настроен
                </span>
              )}
              {p.discordRoleId && (
                <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full font-data" style={{ background: "var(--overlay-soft)", color: "var(--color-pure-white)", border: "1px solid var(--color-hairline)" }}>
                  <Tag className="w-3 h-3" strokeWidth={2.5} />
                  Роль: {p.discordRoleId}
                </span>
              )}
            </div>

            {/* Inline edit panel */}
            {editingId === p.id && (
              <div className="mt-4 border-t pt-4 space-y-3" style={{ borderColor: "var(--color-hairline)" }}>
                <p className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider mb-2">
                  <Settings className="w-3.5 h-3.5" strokeWidth={2.25} />
                  Настройки проекта
                </p>
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-[var(--color-ash)] mb-1">
                    <ImageIcon className="w-3.5 h-3.5" strokeWidth={2.25} />
                    Изменить иконку (PNG)
                  </label>
                  <input
                    type="file"
                    accept="image/png"
                    onChange={handleEditFileChange}
                    className="w-full text-xs text-[var(--color-ash)] file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[var(--color-graphite)] file:text-[var(--color-pure-white)] hover:file:opacity-80"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-[var(--color-ash)] mb-1">
                    <Bell className="w-3.5 h-3.5" strokeWidth={2.25} />
                    Webhook URL
                  </label>
                  <input
                    type="text"
                    value={editWebhook}
                    onChange={e => setEditWebhook(e.target.value)}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="rc-input w-full rounded-lg p-2 text-xs font-data"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-[var(--color-ash)] mb-1">
                    <Tag className="w-3.5 h-3.5" strokeWidth={2.25} />
                    ID роли для пинга
                  </label>
                  <input
                    type="text"
                    value={editRoleId}
                    onChange={e => setEditRoleId(e.target.value)}
                    placeholder="123456789012345678"
                    className="rc-input w-full rounded-lg p-2 text-xs font-data"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setEditingId(null)}
                    className="rc-btn-ghost flex-1 text-xs py-2 px-3"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => handleSaveEdit(p.id)}
                    disabled={editLoading}
                    className="rc-btn flex-1 text-xs py-2 px-3"
                  >
                    {editLoading ? "Сохранение..." : "Сохранить"}
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>
        ))}
      </div>

      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: "color-mix(in srgb, var(--color-void-black) 70%, transparent)", backdropFilter: "blur(8px)" }}
        >
          <div className="rc-card-edge bg-[var(--color-ink)] p-6 max-w-md w-full animate-scale-up">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-pure-white)] mb-2">Подтвердите действие</h3>
            <p className="text-[var(--color-ash)] mb-6">Удалить проект? Пресеты могут потерять привязку.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rc-btn-ghost px-4 py-2"
                disabled={loading}
              >
                Отмена
              </button>
              <button
                onClick={performDelete}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 transition-colors cursor-pointer"
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
      <div className="p-4 rounded-xl max-w-lg" style={{ background: "var(--overlay-soft)", border: "1px solid var(--color-hairline)" }}>
        <label className="block text-sm font-bold text-[var(--color-mist)] mb-2">Ссылка на Discord сервер</label>
        <p className="text-xs text-[var(--color-smoke)] mb-3">Отображается на главной странице и в программе.</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={discordUrl}
            onChange={e => setDiscordUrl(e.target.value)}
            placeholder="https://dsc.gg/lexis"
            className="rc-input flex-1 rounded-lg p-2 text-sm"
          />
          <button
            onClick={() => handleSave("discordUrl", discordUrl)}
            disabled={loading}
            className="rc-btn py-2 px-4 whitespace-nowrap"
          >
            {loading ? "..." : "Сохранить"}
          </button>
        </div>
      </div>

      <div className="p-4 rounded-xl max-w-lg" style={{ background: "var(--overlay-soft)", border: "1px solid var(--color-hairline)" }}>
        <label className="block text-sm font-bold text-[var(--color-mist)] mb-2">Discord Webhook для новых Релизов</label>
        <p className="text-xs text-[var(--color-smoke)] mb-3">Сюда будут автоматически отправляться уведомления о новых релизах.</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={releasesWebhookUrl}
            onChange={e => setReleasesWebhookUrl(e.target.value)}
            placeholder="https://discord.com/api/webhooks/..."
            className="rc-input flex-1 rounded-lg p-2 text-sm font-mono"
          />
          <button
            onClick={() => handleSave("RELEASES_WEBHOOK_URL", releasesWebhookUrl)}
            disabled={loading}
            className="rc-btn py-2 px-4 whitespace-nowrap"
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
      <div className="space-y-3 p-4 rounded-xl" style={{ background: "var(--overlay-soft)", border: "1px solid var(--color-hairline)" }}>
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-[var(--color-mist)] mb-3">
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Создать промокод
        </h3>
        <div className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs text-[var(--color-ash)] mb-1">Код (любые символы)</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="SUMMER2026"
              className="rc-input w-full rounded-lg p-2 text-sm font-data"
            />
          </div>
          <div className="w-[100px]">
            <label className="block text-xs text-[var(--color-ash)] mb-1">Дней премиума</label>
            <input
              type="number"
              min="1"
              value={days}
              onChange={e => setDays(parseInt(e.target.value) || 1)}
              className="rc-input w-full rounded-lg p-2 text-sm"
            />
          </div>
          <div className="w-[120px]">
            <label className="block text-xs text-[var(--color-ash)] mb-1">Макс. активаций</label>
            <input
              type="number"
              min="1"
              value={maxUses}
              onChange={e => setMaxUses(parseInt(e.target.value) || 1)}
              className="rc-input w-full rounded-lg p-2 text-sm"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="rc-btn py-2 px-6 mt-1"
          >
            {loading ? "..." : "Создать"}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="overflow-x-auto no-scrollbar rounded-xl" style={{ border: "1px solid var(--color-hairline)" }}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-sm" style={{ background: "var(--overlay-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ash)" }}>
              <th className="py-3 px-4">Промокод</th>
              <th className="py-3 px-4">Длительность</th>
              <th className="py-3 px-4">Активации</th>
              <th className="py-3 px-4">Создан</th>
              <th className="py-3 px-4 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-hairline)] bg-[var(--color-obsidian)]">
            {promocodes.map(p => (
              <tr key={p.id} className="hover:bg-[var(--overlay-soft)] transition-colors">
                <td className="py-3 px-4 font-data font-bold text-[var(--color-pure-white)] tracking-widest">{p.code}</td>
                <td className="py-3 px-4 text-sm font-semibold font-data" style={{ color: "var(--color-pure-white)" }}>{p.days} дней</td>
                <td className="py-3 px-4 text-sm text-[var(--color-ash)] font-data">
                  <span className={p.uses >= p.maxUses ? "text-red-400 font-bold" : "text-emerald-400"}>
                    {p.uses}
                  </span> / {p.maxUses}
                </td>
                <td className="py-3 px-4 text-sm text-[var(--color-smoke)] font-data">
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
                <td colSpan={5} className="py-10 text-center">
                  <span className="text-[var(--color-smoke)] text-sm">Нет активных промокодов</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in"
          style={{ background: "color-mix(in srgb, var(--color-void-black) 70%, transparent)", backdropFilter: "blur(8px)" }}
        >
          <div className="rc-card-edge bg-[var(--color-ink)] p-6 max-w-sm w-full mx-4 shadow-2xl relative animate-scale-up">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-pure-white)] mb-2">Удаление промокода</h3>
            <p className="text-[var(--color-ash)] text-sm mb-6 leading-relaxed">
              Вы уверены, что хотите удалить этот промокод? Это действие нельзя отменить.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rc-btn-ghost flex-1 py-2 text-sm"
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

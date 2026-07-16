"use client";

import Link from "next/link";
import { useDevSession, useDevAuth } from "./DevAuthProvider";
import { useState, useEffect, useRef } from "react";
import { Brain, GraduationCap, DownloadCloud, BookOpen, ScrollText, Gem, Crown, LogOut, Bell, Upload, Menu, X } from "lucide-react";

export default function Navbar() {
  const { data: session } = useDevSession();
  const { setRole } = useDevAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Fetch notifications if logged in
  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
      // Poll every 30 seconds for new notifications
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  // Close notifications dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.notifications?.filter((n: any) => !n.read).length || 0);
      }
    } catch (e) {
      console.error("Error fetching notifications:", e);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", { method: "POST" });
      if (res.ok) {
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (e) {
      console.error("Error marking notifications as read:", e);
    }
  };

  const handleLogin = () => {
    // Dev build: no real Discord OAuth — logging in just switches the mock role.
    setRole("user");
  };

  return (
    <>
      <nav className="rc-nav fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-6xl z-50 px-4 sm:px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-medium tracking-tight text-[var(--color-pure-white)] hover:text-[var(--color-ash)] transition-colors">
            Lex<span className="relative inline-block">
              i
              <span className="absolute top-[0.18em] left-[51%] -translate-x-[50%] w-[0.22em] h-[0.22em] bg-[var(--color-coral-pulse)] rounded-full shadow-[0_0_10px_2px_rgba(124,108,240,0.8)] pointer-events-none"></span>
            </span>s
          </Link>
        </div>
        <div className="hidden md:flex gap-6 items-center">
          <Link href="/presets" className="rc-link">
            Пресеты
          </Link>
          <Link href="/assistant" className="rc-link flex items-center gap-1.5">
            <Brain className="w-4 h-4" strokeWidth={2} /> Ассистент
          </Link>
          <Link href="/exam" className="rc-link flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4" strokeWidth={2} /> Тренажер <span className="rc-badge">PRO</span>
          </Link>

          <div className="flex items-center gap-1 ml-2 pl-4 border-l border-[var(--color-hairline)]">
            <Link href="/releases" title="Релизы" className="w-8 h-8 rounded-[var(--radius-lg)] flex items-center justify-center text-[var(--color-ash)] hover:text-[var(--color-pure-white)] hover:bg-[var(--overlay-soft)] transition-all">
              <DownloadCloud className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </Link>
            <Link href="/guide" title="Инструкция" className="w-8 h-8 rounded-[var(--radius-lg)] flex items-center justify-center text-[var(--color-ash)] hover:text-[var(--color-pure-white)] hover:bg-[var(--overlay-soft)] transition-all">
              <BookOpen className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </Link>
            <Link href="/premium" title="Premium" className="w-8 h-8 rounded-[var(--radius-lg)] flex items-center justify-center text-[var(--color-ash)] hover:text-[var(--color-pure-white)] hover:bg-[var(--overlay-soft)] transition-all">
              <Gem className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </Link>
          </div>

          {(session?.user?.role === "admin" || session?.user?.role === "developer") && (
            <Link href="/admin" className="rc-link flex items-center gap-1.5">
              <Crown className="w-4 h-4" strokeWidth={2} /> Панель
            </Link>
          )}


          {session?.user ? (
            <div className="flex items-center gap-4">
              {/* Upload Preset */}
              <Link
                href="/upload"
                title="Загрузить пресет"
                className="p-1.5 rounded-full hover:bg-[var(--overlay-soft)] text-[var(--color-ash)] hover:text-[var(--color-pure-white)] transition-colors group"
              >
                <Upload className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" strokeWidth={1.75} />
              </Link>

              {/* Notifications Bell */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-1.5 rounded-full hover:bg-[var(--overlay-soft)] text-[var(--color-ash)] hover:text-[var(--color-pure-white)] transition-colors focus:outline-none"
                  aria-label="Уведомления"
                >
                  <Bell className="w-5 h-5" strokeWidth={1.75} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-coral-pulse)] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--color-coral-pulse)]"></span>
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="rc-card-edge absolute right-0 mt-3 w-80 !p-4 bg-[var(--color-ink)] z-50 text-left max-h-96 overflow-y-auto animate-fade-in">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-[var(--color-hairline)]">
                      <h4 className="font-medium text-[var(--color-pure-white)] text-sm">Уведомления</h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-[var(--color-ash)] hover:text-[var(--color-pure-white)] hover:underline"
                        >
                          Прочитать все
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-sm text-[var(--color-smoke)] text-center py-4">Нет уведомлений</p>
                    ) : (
                      <div className="space-y-3">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3 rounded-[var(--radius-lg)] border text-xs transition-colors ${
                              n.read
                                ? "bg-[var(--overlay-soft)] border-[var(--color-hairline)] text-[var(--color-smoke)]"
                                : "bg-[var(--overlay-soft-strong)] border-[var(--color-hairline)] text-[var(--color-pure-white)]"
                            }`}
                          >
                            <p className="leading-relaxed">{n.message}</p>
                            <span className="block text-[10px] text-[var(--color-smoke)] mt-1.5">
                              {new Date(n.createdAt).toLocaleString("ru-RU")}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Profile Info */}
              <div className="flex items-center gap-3">
                <img src={session.user.image || ""} alt="Avatar" className="w-8 h-8 rounded-full border border-[var(--color-hairline)]" />
                <span className="text-sm font-medium text-[var(--color-pure-white)]">{session.user.name}</span>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="text-xs text-[var(--color-ash)] hover:text-[var(--color-pure-white)] font-medium cursor-pointer ml-1.5"
                >
                  Выйти
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="rc-btn cursor-pointer"
            >
              Войти (Discord)
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle & Notifications */}
        <div className="flex md:hidden items-center gap-3">
          {session?.user && (
            <Link
              href="/upload"
              title="Загрузить пресет"
              className="p-1.5 rounded-full hover:bg-[var(--overlay-soft)] text-[var(--color-ash)] hover:text-[var(--color-pure-white)] transition-colors"
            >
              <Upload className="w-5 h-5" strokeWidth={1.75} />
            </Link>
          )}
          {session?.user && (
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 rounded-full hover:bg-[var(--overlay-soft)] text-[var(--color-ash)] hover:text-[var(--color-pure-white)] transition-colors focus:outline-none"
              >
                <Bell className="w-5 h-5" strokeWidth={1.75} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-coral-pulse)] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--color-coral-pulse)]"></span>
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="rc-card-edge absolute right-0 mt-3 w-72 !p-4 bg-[var(--color-ink)] z-50 text-left max-h-80 overflow-y-auto animate-fade-in">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-[var(--color-hairline)]">
                    <h4 className="font-medium text-[var(--color-pure-white)] text-sm">Уведомления</h4>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs text-[var(--color-ash)] hover:text-[var(--color-pure-white)]">Прочитать</button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-sm text-[var(--color-smoke)] text-center py-4">Нет уведомлений</p>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((n) => (
                        <div key={n.id} className={`p-3 rounded-[var(--radius-lg)] border text-xs transition-colors ${n.read ? "bg-[var(--overlay-soft)] border-[var(--color-hairline)] text-[var(--color-smoke)]" : "bg-[var(--overlay-soft-strong)] border-[var(--color-hairline)] text-[var(--color-pure-white)]"}`}>
                          <p>{n.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-[var(--color-ash)] hover:text-[var(--color-pure-white)] p-1 focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" strokeWidth={1.75} /> : <Menu className="w-6 h-6" strokeWidth={1.75} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="rc-card-edge fixed top-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] z-40 !p-5 bg-[var(--color-ink)] md:hidden animate-fade-in flex flex-col gap-4">
          <Link href="/presets" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-[var(--color-ash)] hover:text-[var(--color-pure-white)] transition-colors p-2 rounded-[var(--radius-lg)] hover:bg-[var(--overlay-soft)] flex items-center gap-2">
            <ScrollText className="w-4 h-4" strokeWidth={1.75} /> Пресеты
          </Link>
          <Link href="/guide" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-[var(--color-ash)] hover:text-[var(--color-pure-white)] transition-colors p-2 rounded-[var(--radius-lg)] hover:bg-[var(--overlay-soft)] flex items-center gap-2">
            <BookOpen className="w-4 h-4" strokeWidth={1.75} /> Инструкция
          </Link>
          <Link href="/assistant" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-[var(--color-ash)] hover:text-[var(--color-pure-white)] transition-colors p-2 rounded-[var(--radius-lg)] hover:bg-[var(--overlay-soft)] flex items-center gap-2">
            <Brain className="w-4 h-4" strokeWidth={1.75} /> Ассистент
          </Link>
          <Link href="/exam" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-[var(--color-ash)] hover:text-[var(--color-pure-white)] transition-colors p-2 rounded-[var(--radius-lg)] hover:bg-[var(--overlay-soft)] flex items-center gap-2">
            <GraduationCap className="w-4 h-4" strokeWidth={1.75} /> Тренажер <span className="rc-badge">PRO</span>
          </Link>
          <Link href="/premium" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-[var(--color-ash)] hover:text-[var(--color-pure-white)] transition-colors p-2 rounded-[var(--radius-lg)] hover:bg-[var(--overlay-soft)] flex items-center gap-2">
            <Gem className="w-4 h-4" strokeWidth={1.75} /> Premium
          </Link>
          {session?.user && (
            <Link href="/upload" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-[var(--color-ash)] hover:text-[var(--color-pure-white)] transition-colors p-2 rounded-[var(--radius-lg)] hover:bg-[var(--overlay-soft)] flex items-center gap-2">
              <Upload className="w-4 h-4" strokeWidth={1.75} /> Загрузить пресет
            </Link>
          )}
          {(session?.user?.role === "admin" || session?.user?.role === "developer") && (
            <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-[var(--color-ash)] hover:text-[var(--color-pure-white)] transition-colors p-2 rounded-[var(--radius-lg)] hover:bg-[var(--overlay-soft)] flex items-center gap-2">
              <Crown className="w-4 h-4" strokeWidth={1.75} /> Панель управления
            </Link>
          )}

          <div className="h-px w-full bg-[var(--color-hairline)] my-2"></div>

          {session?.user ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 px-2">
                <img src={session.user.image || ""} alt="Avatar" className="w-10 h-10 rounded-full border border-[var(--color-hairline)]" />
                <span className="text-sm font-medium text-[var(--color-pure-white)]">{session.user.name}</span>
              </div>
              <button
                onClick={() => { setIsMobileMenuOpen(false); setShowLogoutModal(true); }}
                className="text-sm font-medium p-2 rounded-[var(--radius-lg)] hover:bg-red-500/10 text-left flex items-center gap-2 cursor-pointer transition-colors"
                style={{ color: "rgba(239, 68, 68, 0.75)" }}
              >
                <LogOut className="w-4 h-4" strokeWidth={1.75} /> Выйти из аккаунта
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="rc-btn w-full"
            >
              Войти через Discord
            </button>
          )}
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="rc-card-edge !p-8 max-w-sm w-full mx-4 text-center bg-[var(--color-ink)] relative overflow-hidden animate-scale-up">
            <div className="w-16 h-16 bg-[var(--overlay-soft)] border border-[var(--color-hairline)] text-[var(--color-ash)] rounded-full flex items-center justify-center mx-auto mb-5">
              <LogOut className="w-7 h-7" strokeWidth={1.75} />
            </div>

            <h3 className="text-xl font-medium text-[var(--color-pure-white)] mb-2">Выход из аккаунта</h3>
            <p className="text-[var(--color-ash)] text-sm mb-6">
              Вы уверены, что хотите выйти из своего профиля Lexis?
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="rc-btn-ghost flex-1 !py-2.5 cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={() => { setRole("guest"); setShowLogoutModal(false); }}
                className="flex-1 bg-[var(--color-coral-pulse)] hover:opacity-90 text-white rounded-[var(--radius-lg)] font-medium text-sm py-2.5 transition-opacity cursor-pointer"
              >
                Да, выйти
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

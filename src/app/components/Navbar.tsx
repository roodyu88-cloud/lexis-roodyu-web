"use client";

import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";

interface NavbarProps {
  session: any;
}

export default function Navbar({ session }: NavbarProps) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const [theme, setTheme] = useState<"classic" | "glass">("classic");

  useEffect(() => {
    const savedTheme = localStorage.getItem("lexis-theme") as "classic" | "glass";
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "glass") {
        document.documentElement.classList.add("theme-glass");
      } else {
        document.documentElement.classList.remove("theme-glass");
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "glass" ? "classic" : "glass";
    setTheme(newTheme);
    localStorage.setItem("lexis-theme", newTheme);
    if (newTheme === "glass") {
      document.documentElement.classList.add("theme-glass");
    } else {
      document.documentElement.classList.remove("theme-glass");
    }
  };

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
    // Instant redirect to discord auth
    signIn("discord");
  };

  return (
    <>
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl z-50 glass-card rounded-2xl border border-white/10 px-6 py-3 flex justify-between items-center backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-white hover:text-gray-300 transition-colors">
            Lex<span className="relative inline-block">
              i
              <span className="absolute top-[0.18em] left-[51%] -translate-x-[50%] w-[0.22em] h-[0.22em] bg-[#00F0FF] rounded-full shadow-[0_0_12px_3px_rgba(0,240,255,0.9)] mix-blend-screen pointer-events-none"></span>
            </span>s
          </Link>
          {session?.user && (
            <Link href="/upload" title="Загрузить пресет" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#5865F2]/20 border border-white/10 hover:border-[#5865F2]/30 flex items-center justify-center text-gray-400 hover:text-[#5865F2] transition-all group">
              <svg className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            </Link>
          )}
        </div>
        <div className="hidden md:flex gap-6 items-center">
          <Link href="/presets" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors">
            Пресеты
          </Link>
          <Link href="/assistant" className="text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
            🧠 Ассистент
          </Link>
          <Link href="/exam" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors flex items-center gap-1">
            🎓 Тренажер <span className="text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded font-bold ml-1">PRO</span>
          </Link>
          
          <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/10">
            <Link href="/releases" title="Релизы" className="text-xl transition-all hover:scale-125 hover:rotate-12 opacity-90 hover:opacity-100 flex items-center justify-center">
              💾
            </Link>
            <Link href="/guide" title="Инструкция" className="text-xl transition-all hover:scale-125 hover:rotate-12 opacity-90 hover:opacity-100 flex items-center justify-center">
              📖
            </Link>
            <Link href="/premium" title="Premium" className="text-xl transition-all hover:scale-125 hover:rotate-12 opacity-90 hover:opacity-100 flex items-center justify-center">
              💎
            </Link>
          </div>
          
          {(session?.user?.role === "admin" || session?.user?.role === "developer") && (
            <Link href="/admin" className="text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">
              👑 Панель
            </Link>
          )}


          {session?.user ? (
            <div className="flex items-center gap-4">
              {/* Notifications Bell */}
              <div className="relative" ref={notificationsRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-1.5 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors focus:outline-none"
                  aria-label="Уведомления"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-[#1e1f22]/95 p-4 rounded-xl border border-white/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] backdrop-blur-3xl z-50 text-left max-h-96 overflow-y-auto animate-fade-in">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
                      <h4 className="font-bold text-white text-sm">Уведомления</h4>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead} 
                          className="text-xs text-[#5865F2] hover:underline"
                        >
                          Прочитать все
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">Нет уведомлений</p>
                    ) : (
                      <div className="space-y-3">
                        {notifications.map((n) => (
                          <div 
                            key={n.id} 
                            className={`p-3 rounded-lg border text-xs transition-colors ${
                              n.read 
                                ? "bg-white/5 border-white/5 text-gray-400" 
                                : "bg-[#5865F2]/10 border-[#5865F2]/20 text-white"
                            }`}
                          >
                            <p className="leading-relaxed">{n.message}</p>
                            <span className="block text-[10px] text-gray-500 mt-1.5">
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
                <img src={session.user.image || ""} alt="Avatar" className="w-8 h-8 rounded-full border border-white/20" />
                <span className="text-sm font-medium text-white">{session.user.name}</span>
                <button 
                  onClick={() => setShowLogoutModal(true)} 
                  className="text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer ml-1.5"
                >
                  Выйти
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={handleLogin} 
              className="btn-secondary text-sm !py-2 !px-4 cursor-pointer"
            >
              Войти (Discord)
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle & Notifications */}
        <div className="flex md:hidden items-center gap-3">
          {session?.user && (
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors focus:outline-none"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-72 bg-[#1e1f22]/95 p-4 rounded-xl border border-white/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] backdrop-blur-3xl z-50 text-left max-h-80 overflow-y-auto animate-fade-in">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
                    <h4 className="font-bold text-white text-sm">Уведомления</h4>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs text-[#5865F2]">Прочитать</button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Нет уведомлений</p>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((n) => (
                        <div key={n.id} className={`p-3 rounded-lg border text-xs transition-colors ${n.read ? "bg-white/5 border-white/5 text-gray-400" : "bg-[#5865F2]/10 border-[#5865F2]/20 text-white"}`}>
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
            className="text-gray-300 hover:text-white p-1 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] z-40 glass-card p-5 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl md:hidden animate-fade-in flex flex-col gap-4">
          <Link href="/presets" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-semibold text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
            Пресеты
          </Link>
          <Link href="/guide" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-semibold text-[#00F0FF] hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 flex items-center gap-2">
            📖 Инструкция
          </Link>
          <Link href="/assistant" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors p-2 rounded-lg hover:bg-white/5 flex items-center gap-2">
            🧠 Ассистент
          </Link>
          <Link href="/exam" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-semibold text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 flex items-center gap-2">
            🎓 Тренажер <span className="text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded font-bold ml-1">PRO</span>
          </Link>
          <Link href="/premium" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-semibold text-amber-500 hover:text-amber-400 transition-colors p-2 rounded-lg hover:bg-white/5 flex items-center gap-2">
            💎 Premium
          </Link>
          {session?.user && (
            <Link href="/upload" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-semibold text-[#5865F2] hover:text-[#4752C4] transition-colors p-2 rounded-lg hover:bg-white/5">
              Загрузить пресет
            </Link>
          )}
          {(session?.user?.role === "admin" || session?.user?.role === "developer") && (
            <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors p-2 rounded-lg hover:bg-white/5 flex items-center gap-2">
              👑 Панель управления
            </Link>
          )}

          <div className="h-px w-full bg-white/10 my-2"></div>

          {session?.user ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 px-2">
                <img src={session.user.image || ""} alt="Avatar" className="w-10 h-10 rounded-full border border-white/20" />
                <span className="text-sm font-medium text-white">{session.user.name}</span>
              </div>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); setShowLogoutModal(true); }}
                className="text-sm text-red-400 hover:text-red-300 font-semibold p-2 rounded-lg hover:bg-white/5 text-left"
              >
                Выйти из аккаунта
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin} 
              className="btn-secondary text-sm w-full"
            >
              Войти через Discord
            </button>
          )}
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card p-8 max-w-sm w-full mx-4 text-center border border-white/10 shadow-2xl relative overflow-hidden rounded-2xl animate-scale-up">
            {/* Background glowing gradients */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#5865F2]/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#00F0FF]/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl">
              🚪
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">Выход из аккаунта</h3>
            <p className="text-gray-400 text-sm mb-6">
              Вы уверены, что хотите выйти из своего профиля Lexis?
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 btn-secondary text-sm !py-2.5 cursor-pointer"
              >
                Отмена
              </button>
              <button 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm py-2.5 transition-colors cursor-pointer"
              >
                Да, выйти
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Theme Switcher FAB (glowing glass dot) */}
      <button 
        onClick={toggleTheme}
        className="fixed bottom-6 right-6 w-10 h-10 rounded-full z-[9999] flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 border border-white/5 group shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
        style={{
          background: "rgba(25, 25, 30, 0.45)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: "inset 0 1px 1.5px rgba(255, 255, 255, 0.15), 0 10px 30px rgba(0, 0, 0, 0.5)",
        }}
        title={theme === "glass" ? "Включить классическую тему" : "Включить тему серого стекла"}
        aria-label="Сменить тему оформления"
      >
        <span className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
          theme === "glass" 
            ? "bg-[#FFFFFF] shadow-[0_0_12px_rgba(255,255,255,0.95)]" 
            : "bg-[#5865F2] shadow-[0_0_12px_rgba(88,101,242,0.95)]"
        }`} />
      </button>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function GlobalBanCheck() {
  const { data: session } = useSession();
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState<string | null>(null);

  useEffect(() => {
    // Only poll if user is logged in
    if (!session?.user) return;

    const checkBanStatus = async () => {
      try {
        const res = await fetch("/api/ban-status");
        if (res.ok) {
          const data = await res.json();
          if (data.isBanned) {
            setIsBanned(true);
            setBanReason(data.banReason || "Причина не указана");
          } else {
            setIsBanned(false);
            setBanReason(null);
          }
        }
      } catch (err) {
        console.error("Failed to check ban status", err);
      }
    };

    // Initial check
    checkBanStatus();

    // Poll every 10 seconds
    const intervalId = setInterval(checkBanStatus, 10000);

    return () => clearInterval(intervalId);
  }, [session]);

  if (!isBanned) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-[#09090b]/95 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="bg-black/40 border border-red-500/30 rounded-2xl p-8 max-w-lg w-full text-center shadow-2xl shadow-red-500/20 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            ⛔
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">Аккаунт заблокирован</h1>
          <p className="text-gray-400 mb-6 leading-relaxed">
            Доступ к сайту ограничен. Вы больше не можете использовать функционал базы пресетов Lexis.
          </p>
          
          <div className="bg-black/50 border border-white/10 rounded-xl p-5 mb-8 text-left">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Причина блокировки:</h3>
            <p className="text-red-400 font-medium whitespace-pre-wrap">{banReason}</p>
          </div>

          <p className="text-sm text-gray-500">
            Если вы считаете, что блокировка выдана по ошибке, свяжитесь с администрацией в нашем Discord канале.
          </p>
        </div>
      </div>
    </div>
  );
}

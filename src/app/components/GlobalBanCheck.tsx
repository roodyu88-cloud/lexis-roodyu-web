"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Ban } from "lucide-react";

export default function GlobalBanCheck() {
  const { data: session } = useSession();
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState<string | null>(null);
  const [discordUrl, setDiscordUrl] = useState<string>("https://dsc.gg/lexis");

  useEffect(() => {
    // Only poll if user is logged in
    if (!session?.user) return;

    const checkBanStatus = async () => {
      try {
        const res = await fetch("/api/ban-status");
        if (res.ok) {
          const data = await res.json();
          if (data.discordUrl) {
            setDiscordUrl(data.discordUrl);
          }
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
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-6"
      style={{
        background: "color-mix(in srgb, var(--color-void-black) 95%, transparent)",
        backdropFilter: "blur(24px)",
      }}
    >
      <div
        className="rc-card-edge max-w-lg w-full text-center relative overflow-hidden"
        style={{ borderColor: "rgba(239, 68, 68, 0.3)", background: "var(--color-ink)", padding: "32px" }}
      >
        {/* Glow effect */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Ban className="w-9 h-9 text-red-400" strokeWidth={1.75} />
          </div>
          <h1 className="text-heading-sm font-semibold mb-3 tracking-tight" style={{ color: "var(--color-pure-white)" }}>
            Аккаунт заблокирован
          </h1>
          <p className="text-body mb-6 leading-relaxed" style={{ color: "var(--color-ash)" }}>
            Доступ к сайту ограничен. Вы больше не можете использовать функционал базы пресетов Lexis.
          </p>

          <div className="rounded-lg border border-red-500/20 p-5 mb-8 text-left" style={{ background: "var(--color-obsidian)" }}>
            <h3 className="rc-eyebrow mb-2">Причина блокировки:</h3>
            <p className="text-red-400 font-medium whitespace-pre-wrap text-body">{banReason}</p>
          </div>

          <p className="text-body" style={{ color: "var(--color-smoke)" }}>
            Если вы считаете, что блокировка выдана по ошибке, свяжитесь с администрацией в нашем{" "}
            <a
              href={discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:underline"
              style={{ color: "var(--color-pure-white)" }}
            >
              Discord канале
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

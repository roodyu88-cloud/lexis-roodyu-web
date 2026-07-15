"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Scale, Briefcase, Siren, Crown, Lock } from "lucide-react";

export default function PremiumPage() {
  const { data: session, update } = useSession();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const isPremium = (session?.user as any)?.isPremium;
  const premiumUntil = (session?.user as any)?.premiumUntil;
  const hasPremiumBadge = (session?.user as any)?.badges?.includes("Premium");

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setMessage({ text: "Необходимо войти в аккаунт", type: "error" });
      return;
    }
    if (!code) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/premium/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });

      if (res.ok) {
        const data = await res.json();
        setMessage({ text: `Успешно! Активировано ${data.days} дней Premium.`, type: "success" });
        setCode("");
        // Опционально: можно зафорсить обновление сессии
        await update();
      } else {
        const errorData = await res.json();
        setMessage({ text: errorData.error || "Ошибка при активации", type: "error" });
      }
    } catch (e) {
      setMessage({ text: "Системная ошибка", type: "error" });
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen p-6 md:p-8 max-w-5xl mx-auto flex flex-col items-center justify-center relative overflow-hidden">
      <div className="fixed top-10 left-[5%] w-[450px] h-[450px] rounded-full blur-[130px] pointer-events-none -z-10" style={{ background: "rgba(245, 158, 11, 0.08)" }} aria-hidden="true" />
      <div className="fixed bottom-10 right-[5%] w-[450px] h-[450px] rounded-full blur-[140px] pointer-events-none -z-10" style={{ background: "rgba(245, 158, 11, 0.05)" }} aria-hidden="true" />

      <div className="text-center mb-12 relative">
        <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400 uppercase tracking-widest mb-4 font-data">
          Premium доступ
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4" style={{ color: "var(--color-pure-white)" }}>
          Lexis <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Premium</span>
        </h1>
        <p className="text-xl max-w-2xl mx-auto" style={{ color: "var(--color-ash)" }}>
          Расширьте возможности вашего ИИ-Ассистента с продвинутыми ролями и аналитикой.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* Features Column */}
        <div className="space-y-6">
          <div className="rc-card-edge p-6 relative overflow-hidden group" style={{ background: "var(--color-ink)" }}>
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.15)] backdrop-blur-md">
              <Scale className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "var(--color-pure-white)" }}>Роль: Судья</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-ash)" }}>ИИ анализирует вашу ситуацию беспристрастно, опираясь исключительно на судебный кодекс и прецеденты, помогая выносить строгие вердикты.</p>
          </div>

          <div className="rc-card-edge p-6 relative overflow-hidden group" style={{ background: "var(--color-ink)" }}>
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.15)] backdrop-blur-md">
              <Briefcase className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "var(--color-pure-white)" }}>Роль: Адвокат</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-ash)" }}>ИИ сфокусирован на поиске лазеек в законе, процессуальных нарушениях при задержании и максимальной защите прав вашего клиента.</p>
          </div>

          <div className="rc-card-edge p-6 relative overflow-hidden group" style={{ background: "var(--color-ink)" }}>
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.15)] backdrop-blur-md">
              <Siren className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "var(--color-pure-white)" }}>Роль: Прокурор</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-ash)" }}>ИИ выявляет все возможные составы преступлений, ищет доказательства вины и подбирает самые строгие статьи УК для обвинения.</p>
          </div>
        </div>

        {/* Subscription / Promocode Column */}
        <div className="space-y-6 flex flex-col">

          <div className="rc-card-edge p-8 flex-1 flex flex-col justify-center relative overflow-hidden" style={{ background: "var(--color-ink)", borderColor: "rgba(245, 158, 11, 0.2)" }}>
            {isPremium ? (
              <div className="text-center space-y-4">
                <div className="inline-block p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-2">
                  <Crown className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: "var(--color-pure-white)" }}>У вас активен Premium!</h2>
                <p className="text-sm" style={{ color: "var(--color-ash)" }}>
                  {hasPremiumBadge
                    ? "У вас вечная подписка за особые заслуги."
                    : premiumUntil
                      ? `Подписка действительна до ${new Date(premiumUntil).toLocaleDateString("ru-RU")}`
                      : "Вы являетесь премиум-пользователем."
                  }
                </p>
                <Link href="/assistant" className="rc-btn !bg-amber-500 hover:!bg-amber-600 !text-white block w-full mt-6 py-3 text-center">
                  Перейти в Ассистент
                </Link>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="inline-block p-4 rounded-full mb-2 opacity-50" style={{ background: "var(--overlay-soft)", border: "1px solid var(--color-hairline)" }}>
                  <Lock className="w-8 h-8" style={{ color: "var(--color-ash)" }} />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: "var(--color-pure-white)" }}>Premium не активен</h2>
                <p className="text-sm" style={{ color: "var(--color-ash)" }}>
                  На данный момент премиум-функции активируются промокодом.
                  <br /><br />
                  <span className="font-medium" style={{ color: "var(--color-pure-white)" }}>Для приобретения подписки необходимо создать тикет в нашем официальном Discord-сервере.</span>
                </p>
              </div>
            )}
          </div>

          <div className="rc-card-edge p-6" style={{ background: "var(--color-ink)" }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: "var(--color-pure-white)" }}>Активация промокода</h3>
            <form onSubmit={handleRedeem} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ВВЕДИТЕ ПРОМОКОД"
                  className="rc-input w-full p-4 text-center font-mono font-bold text-lg outline-none focus:border-amber-500 transition-colors"
                  style={{ border: "1px solid var(--color-hairline)" }}
                />
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm font-semibold border ${message.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
                  {message.text}
                </div>
              )}

              <div className="relative">
                {!loading && code && (
                  <div className="absolute inset-0 bg-amber-500/30 rounded-xl blur-xl animate-pulse pointer-events-none" aria-hidden="true" />
                )}
                <button
                  type="submit"
                  disabled={loading || !code}
                  className={`relative w-full py-3 px-6 rounded-lg font-bold transition-all ${loading || !code
                      ? "cursor-not-allowed"
                      : "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20 cursor-pointer"
                    }`}
                  style={loading || !code ? { background: "var(--overlay-soft)", color: "var(--color-smoke)" } : undefined}
                >
                  {loading ? "Проверка..." : "Активировать"}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </main>
  );
}

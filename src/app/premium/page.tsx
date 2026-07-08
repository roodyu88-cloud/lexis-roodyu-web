"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

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
    <main className="min-h-screen p-8 max-w-5xl mx-auto flex flex-col items-center justify-center">
      
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
          Lexis <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 glow-text-amber">Premium</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Расширьте возможности вашего ИИ-Ассистента с продвинутыми ролями и аналитикой.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* Features Column */}
        <div className="space-y-6">
          <div className="glass-card p-6 relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-2xl shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.15)] backdrop-blur-md">
              ⚖️
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Роль: Судья</h3>
            <p className="text-gray-400 text-sm leading-relaxed">ИИ анализирует вашу ситуацию беспристрастно, опираясь исключительно на судебный кодекс и прецеденты, помогая выносить строгие вердикты.</p>
          </div>

          <div className="glass-card p-6 relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-2xl shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.15)] backdrop-blur-md">
              💼
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Роль: Адвокат</h3>
            <p className="text-gray-400 text-sm leading-relaxed">ИИ сфокусирован на поиске лазеек в законе, процессуальных нарушениях при задержании и максимальной защите прав вашего клиента.</p>
          </div>

          <div className="glass-card p-6 relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-2xl shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.15)] backdrop-blur-md">
              🚔
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Роль: Прокурор</h3>
            <p className="text-gray-400 text-sm leading-relaxed">ИИ выявляет все возможные составы преступлений, ищет доказательства вины и подбирает самые строгие статьи УК для обвинения.</p>
          </div>
        </div>

        {/* Subscription / Promocode Column */}
        <div className="space-y-6 flex flex-col">
          
          <div className="glass-card p-8 flex-1 flex flex-col justify-center relative overflow-hidden border-amber-500/20 shadow-2xl shadow-amber-900/10">
            {isPremium ? (
              <div className="text-center space-y-4">
                <div className="inline-block p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-2">
                  <span className="text-4xl">👑</span>
                </div>
                <h2 className="text-2xl font-bold text-white">У вас активен Premium!</h2>
                <p className="text-gray-400 text-sm">
                  {hasPremiumBadge 
                    ? "У вас вечная подписка за особые заслуги."
                    : premiumUntil 
                      ? `Подписка действительна до ${new Date(premiumUntil).toLocaleDateString("ru-RU")}`
                      : "Вы являетесь премиум-пользователем."
                  }
                </p>
                <Link href="/assistant" className="btn-primary block w-full mt-6 py-3 text-center !bg-amber-500 hover:!bg-amber-600 !border-amber-400">
                  Перейти в Ассистент
                </Link>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="inline-block p-4 rounded-full bg-white/5 border border-white/10 mb-2 opacity-50">
                  <span className="text-4xl">🔒</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Premium не активен</h2>
                <p className="text-gray-400 text-sm">
                  На данный момент премиум-функции можно получить только с помощью специального промокода.
                </p>
              </div>
            )}
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4">Активация промокода</h3>
            <form onSubmit={handleRedeem} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ВВЕДИТЕ ПРОМОКОД"
                  className="w-full bg-black/40 border border-white/10 text-white rounded-xl p-4 text-center font-mono font-bold text-lg outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              
              {message && (
                <div className={`p-3 rounded-lg text-sm font-semibold border ${message.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !code}
                className={`w-full py-3 px-6 rounded-xl font-bold transition-all ${
                  loading || !code 
                    ? "bg-white/5 text-gray-500 cursor-not-allowed" 
                    : "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20 cursor-pointer"
                }`}
              >
                {loading ? "Проверка..." : "Активировать"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </main>
  );
}

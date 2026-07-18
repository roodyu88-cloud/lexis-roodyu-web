"use client";

import { useState } from "react";
import { useDevSession } from "@/app/components/DevAuthProvider";
import Link from "next/link";
import { Scale, Briefcase, Siren, Crown, Lock, ChevronDown } from "lucide-react";

interface RoleItem {
  icon: React.ElementType;
  title: string;
  desc: string;
}

const ROLES: RoleItem[] = [
  {
    icon: Scale,
    title: "Роль: Судья",
    desc: "ИИ анализирует вашу ситуацию беспристрастно, опираясь исключительно на судебный кодекс и прецеденты, помогая выносить строгие вердикты.",
  },
  {
    icon: Briefcase,
    title: "Роль: Адвокат",
    desc: "ИИ сфокусирован на поиске лазеек в законе, процессуальных нарушениях при задержании и максимальной защите прав вашего клиента.",
  },
  {
    icon: Siren,
    title: "Роль: Прокурор",
    desc: "ИИ выявляет все возможные составы преступлений, ищет доказательства вины и подбирает самые строгие статьи УК для обвинения.",
  },
];

export default function PremiumPage() {
  const { data: session, update } = useDevSession();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [openRole, setOpenRole] = useState<number | null>(0);

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
    <main className="min-h-screen p-6 md:p-8 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <span className="rc-eyebrow" style={{ color: "var(--color-coral-text)" }}>Premium доступ</span>
        <h1 className="text-heading-lg font-normal mt-3 mb-4 text-[var(--color-pure-white)]">
          Lexis Premium
        </h1>
        <p className="text-body-lg max-w-2xl mx-auto text-[var(--color-ash)]">
          Расширьте возможности вашего ИИ-Ассистента с продвинутыми ролями и аналитикой.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-start">
        {/* Roles accordion */}
        <div className="rc-accordion">
          {ROLES.map((role, i) => {
            const Icon = role.icon;
            const isOpen = openRole === i;
            const num = String(i + 1).padStart(2, "0");
            return (
              <div key={role.title} className={`rc-accordion-item ${isOpen ? "is-open" : ""}`}>
                <button
                  type="button"
                  className="rc-accordion-trigger"
                  onClick={() => setOpenRole(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="rc-accordion-num">{num}</span>
                  <span className="rc-accordion-icon">
                    <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
                  </span>
                  <span className="rc-accordion-title">{role.title}</span>
                  <ChevronDown className="rc-accordion-chevron w-5 h-5" />
                </button>
                <div className="rc-accordion-panel">
                  <div className="rc-accordion-panel-inner">
                    <div className="rc-accordion-panel-content">
                      <p>{role.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Subscription / Promocode Column */}
        <div className="space-y-6 flex flex-col">

          <div className="rc-card-edge !p-8 flex-1 flex flex-col justify-center bg-[var(--color-ink)]">
            {isPremium ? (
              <div className="text-center space-y-4">
                <div className="inline-block p-4 rounded-full mb-2" style={{ background: "var(--overlay-soft)", border: "1px solid var(--color-hairline)" }}>
                  <Crown className="w-8 h-8" style={{ color: "var(--color-coral-text)" }} />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-pure-white)]">У вас активен Premium!</h2>
                <p className="text-sm text-[var(--color-ash)]">
                  {hasPremiumBadge
                    ? "У вас вечная подписка за особые заслуги."
                    : premiumUntil
                      ? `Подписка действительна до ${new Date(premiumUntil).toLocaleDateString("ru-RU")}`
                      : "Вы являетесь премиум-пользователем."
                  }
                </p>
                <Link href="/assistant" className="rc-btn w-full mt-6">
                  Перейти в Ассистент
                </Link>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="inline-block p-4 rounded-full mb-2 opacity-50" style={{ background: "var(--overlay-soft)", border: "1px solid var(--color-hairline)" }}>
                  <Lock className="w-8 h-8" style={{ color: "var(--color-ash)" }} />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-pure-white)]">Premium не активен</h2>
                <p className="text-sm text-[var(--color-ash)]">
                  На данный момент премиум-функции активируются промокодом.
                  <br /><br />
                  <span className="font-medium text-[var(--color-pure-white)]">Для приобретения подписки необходимо создать тикет в нашем официальном Discord-сервере.</span>
                </p>
              </div>
            )}
          </div>

          <div className="rc-card-edge !p-6 bg-[var(--color-ink)]">
            <h3 className="text-lg font-bold mb-4 text-[var(--color-pure-white)]">Активация промокода</h3>
            <form onSubmit={handleRedeem} className="space-y-4">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ВВЕДИТЕ ПРОМОКОД"
                className="rc-input w-full text-center font-mono font-bold text-lg"
              />

              {message && (
                <div
                  className="p-3 rounded-lg text-sm font-semibold border"
                  style={message.type === "success"
                    ? { background: "rgba(16, 185, 129, 0.1)", borderColor: "rgba(16, 185, 129, 0.3)", color: "#34d399" }
                    : { background: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.3)", color: "#f87171" }}
                >
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !code}
                className="rc-btn w-full disabled:cursor-not-allowed disabled:opacity-50"
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

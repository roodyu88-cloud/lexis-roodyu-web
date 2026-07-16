"use client";

import { Lock } from "lucide-react";

export default function LoginRequiredCard({
  message = "Эта страница доступна только авторизованным пользователям.",
}: {
  message?: string;
}) {
  return (
    <main className="min-h-screen p-6 md:p-8 flex items-center justify-center relative overflow-hidden">
      <div className="fixed top-20 left-[10%] w-[350px] h-[350px] rounded-full blur-[120px] pointer-events-none -z-10" style={{ background: "rgba(124, 108, 240, 0.08)" }} aria-hidden="true" />
      <div className="fixed bottom-20 right-[10%] w-[350px] h-[350px] rounded-full blur-[130px] pointer-events-none -z-10" style={{ background: "rgba(124, 108, 240, 0.05)" }} aria-hidden="true" />

      <div className="rc-card-edge p-8 md:p-10 w-full max-w-md text-center relative overflow-hidden" style={{ background: "var(--color-ink)" }}>
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(124, 108, 240, 0.08)" }} />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(124, 108, 240, 0.05)" }} />

        <div className="relative">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "var(--color-obsidian)", border: "1px solid var(--color-hairline)" }}>
            <Lock className="w-7 h-7" style={{ color: "var(--color-coral-text)" }} />
          </div>
          <h1 className="text-heading-sm font-bold mb-2" style={{ color: "var(--color-pure-white)" }}>Требуется авторизация</h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-ash)" }}>
            {message} Это dev-версия сайта без реальной базы — переключите тестовую роль кнопкой{" "}
            <span className="font-semibold" style={{ color: "var(--color-pure-white)" }}>«Гость» / «Пользователь» / «Админ»</span> в правом нижнем углу экрана.
          </p>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <Link href="/" className="rc-link inline-flex items-center gap-2 mb-4 group">
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" strokeWidth={2.5} />
        На главную
      </Link>

      <div className="rc-card-edge p-8 md:p-12 relative overflow-hidden" style={{ background: "var(--color-ink)" }}>
        {/* Background glow */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl pointer-events-none" style={{ background: "color-mix(in srgb, var(--color-coral-pulse) 6%, transparent)" }}></div>

        <header className="relative z-10 mb-8 pb-8 border-b" style={{ borderColor: "var(--color-hairline)" }}>
          <h1 className="text-heading-sm md:text-heading font-extrabold text-[var(--color-pure-white)] mb-4 tracking-tight break-words">
            Пользовательское соглашение
          </h1>
          <p className="text-[var(--color-ash)] leading-relaxed max-w-[70ch]">
            Настоящее Пользовательское соглашение регулирует использование веб-сайта Lexis Web и базы пресетов. Заходя на сайт или авторизуясь через Discord, вы подтверждаете свое полное согласие с данными условиями.
          </p>
        </header>

        <div className="space-y-8 text-[var(--color-ash)] max-w-[70ch] relative z-10">
          <section className="space-y-3 border-l-2 pl-6 transition-colors duration-300" style={{ borderColor: "var(--color-hairline)" }}>
            <h2 className="text-xl font-bold text-[var(--color-pure-white)] flex items-center gap-2">
              <span className="text-[var(--color-coral-text)] font-data">1.</span> Авторизация и Данные
            </h2>
            <p className="text-sm text-[var(--color-ash)] leading-relaxed">
              Авторизация на сайте осуществляется исключительно с помощью стороннего сервиса Discord OAuth2. Мы собираем и храним только общедоступные данные вашего профиля Discord: уникальный Discord ID, имя пользователя (username) и ссылку на аватар. Эти данные необходимы для вашей идентификации как автора пресетов, отображения выданных вам бейджей, а также для работы системы внутренних уведомлений.
            </p>
          </section>

          <section className="space-y-3 border-l-2 pl-6 transition-colors duration-300" style={{ borderColor: "var(--color-hairline)" }}>
            <h2 className="text-xl font-bold text-[var(--color-pure-white)] flex items-center gap-2">
              <span className="text-[var(--color-coral-text)] font-data">2.</span> Права на интеллектуальную собственность
            </h2>
            <p className="text-sm text-[var(--color-ash)] leading-relaxed">
              Загружая пресеты на сайт, вы предоставляете Lexis Web неисключительное право на бесплатное хранение, распространение и показ вашего контента другим пользователям платформы. При этом вы остаетесь полноценным автором своего пресета. Запрещается загружать контент, нарушающий авторские права сторонних лиц.
            </p>
          </section>

          <section className="space-y-3 border-l-2 pl-6 transition-colors duration-300" style={{ borderColor: "var(--color-hairline)" }}>
            <h2 className="text-xl font-bold text-[var(--color-pure-white)] flex items-center gap-2">
              <span className="text-[var(--color-coral-text)] font-data">3.</span> Отказ от ответственности
            </h2>
            <p className="text-sm text-[var(--color-ash)] leading-relaxed">
              Lexis Web предоставляет базу пресетов по принципу "как есть" (as is). Администрация не несет ответственности за возможные сбои в работе программного обеспечения, потерю данных или качество загруженных пользователями пресетов. Вы используете скачанные пресеты на свой собственный страх и риск.
            </p>
          </section>

          <section className="space-y-3 border-l-2 pl-6 transition-colors duration-300" style={{ borderColor: "var(--color-hairline)" }}>
            <h2 className="text-xl font-bold text-[var(--color-pure-white)] flex items-center gap-2">
              <span className="text-[var(--color-coral-text)] font-data">4.</span> Изменение условий
            </h2>
            <p className="text-sm text-[var(--color-ash)] leading-relaxed">
              Администрация Lexis оставляет за собой право изменять настоящее Пользовательское соглашение в любое время. Изменения вступают в силу с момента их публикации на этой странице. Продолжение использования сайта после внесения изменений означает ваше автоматическое согласие с новыми условиями.
            </p>
          </section>
        </div>

        <div
          className="mt-10 p-4 rounded-xl text-xs text-center relative z-10 border"
          style={{ background: "var(--overlay-soft)", borderColor: "var(--color-hairline)", color: "var(--color-smoke)" }}
        >
          Последнее обновление: <span className="font-data">26 мая 2026 г.</span> Если вы не согласны с какими-либо пунктами соглашения, пожалуйста, воздержитесь от использования сайта.
        </div>
      </div>
    </main>
  );
}

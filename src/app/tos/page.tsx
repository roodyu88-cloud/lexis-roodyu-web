import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <Link href="/" className="text-[#5865F2] hover:underline mb-4 inline-block">
        ← На главную
      </Link>

      <div className="glass-card p-8 md:p-12 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none"></div>

        <h1 className="text-4xl font-extrabold text-white mb-6 glow-text tracking-tight">
          Пользовательское соглашение
        </h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Настоящее Пользовательское соглашение регулирует использование веб-сайта Lexis Web и базы пресетов. Заходя на сайт или авторизуясь через Discord, вы подтверждаете свое полное согласие с данными условиями.
        </p>

        <div className="space-y-6 text-gray-300">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#00F0FF]">1.</span> Авторизация и Данные
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Авторизация на сайте осуществляется исключительно с помощью стороннего сервиса Discord OAuth2. Мы собираем и храним только общедоступные данные вашего профиля Discord: уникальный Discord ID, имя пользователя (username) и ссылку на аватар. Эти данные необходимы для вашей идентификации как автора пресетов, отображения выданных вам бейджей, а также для работы системы внутренних уведомлений.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#00F0FF]">2.</span> Права на интеллектуальную собственность
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Загружая пресеты на сайт, вы предоставляете Lexis Web неисключительное право на бесплатное хранение, распространение и показ вашего контента другим пользователям платформы. При этом вы остаетесь полноценным автором своего пресета. Запрещается загружать контент, нарушающий авторские права сторонних лиц.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#00F0FF]">3.</span> Отказ от ответственности
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Lexis Web предоставляет базу пресетов по принципу "как есть" (as is). Администрация не несет ответственности за возможные сбои в работе программного обеспечения, потерю данных или качество загруженных пользователями пресетов. Вы используете скачанные пресеты на свой собственный страх и риск.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#00F0FF]">4.</span> Изменение условий
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Администрация Lexis оставляет за собой право изменять настоящее Пользовательское соглашение в любое время. Изменения вступают в силу с момента их публикации на этой странице. Продолжение использования сайта после внесения изменений означает ваше автоматическое согласие с новыми условиями.
            </p>
          </section>
        </div>

        <div className="mt-10 p-4 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-500 text-center">
          Последнее обновление: 26 мая 2026 г. Если вы не согласны с какими-либо пунктами соглашения, пожалуйста, воздержитесь от использования сайта.
        </div>
      </div>
    </main>
  );
}

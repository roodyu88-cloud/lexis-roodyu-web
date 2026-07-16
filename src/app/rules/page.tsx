import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RulesPage() {
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
          <h1 className="text-heading-sm md:text-heading font-extrabold text-[var(--color-pure-white)] mb-4 tracking-tight">
            Правила публикации пресетов
          </h1>
          <p className="text-[var(--color-ash)] leading-relaxed max-w-[70ch]">
            Добро пожаловать в базу пресетов Lexis! Для поддержания порядка, безопасности и высокого качества контента на платформе действуют следующие обязательные правила. Пожалуйста, внимательно ознакомьтесь с ними перед публикацией.
          </p>
        </header>

        <div className="space-y-8 text-[var(--color-ash)] max-w-[70ch] relative z-10">
          <section className="space-y-3 border-l-2 pl-6 transition-colors duration-300" style={{ borderColor: "var(--color-hairline)" }}>
            <h2 className="text-xl font-bold text-[var(--color-pure-white)] flex items-center gap-2">
              <span className="text-[var(--color-coral-text)] font-data">1.</span> Содержимое пресета
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-sm text-[var(--color-ash)] marker:text-[var(--color-smoke)]">
              <li>Файлы пресетов должны иметь корректный формат JSON и быть полностью совместимы со справочником Lexis.</li>
              <li>Все разделы, статьи и заголовки должны соответствовать тематике GTA 5 RP серверов (законы, уставы, кодексы, шпаргалки).</li>
              <li>Запрещено публиковать пустые или сломанные пресеты.</li>
            </ul>
          </section>

          <section className="space-y-3 border-l-2 pl-6 transition-colors duration-300" style={{ borderColor: "var(--color-hairline)" }}>
            <h2 className="text-xl font-bold text-[var(--color-pure-white)] flex items-center gap-2">
              <span className="text-[var(--color-coral-text)] font-data">2.</span> Запрещенный контент
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-sm text-[var(--color-ash)] marker:text-[var(--color-smoke)]">
              <li>Строго запрещен любой вредоносный код, спам, ссылки на фишинговые сайты или вирусы.</li>
              <li>Запрещено публиковать оскорбительный контент, нецензурную брань в названиях или описаниях пресетов, а также призывы к ненависти и дискриминации.</li>
              <li>Запрещена реклама сторонних услуг, не относящихся к функционалу Lexis или игровым серверам.</li>
            </ul>
          </section>

          <section className="space-y-3 border-l-2 pl-6 transition-colors duration-300" style={{ borderColor: "var(--color-hairline)" }}>
            <h2 className="text-xl font-bold text-[var(--color-pure-white)] flex items-center gap-2">
              <span className="text-[var(--color-coral-text)] font-data">3.</span> Названия и Описания
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-sm text-[var(--color-ash)] marker:text-[var(--color-smoke)]">
              <li>Название пресета должно четко отражать его суть (например, "LSPD | GTA5RP Rainbow").</li>
              <li>Описание должно содержать информацию о версии пресета, сервере и фракции, для которых он предназначен.</li>
              <li>Запрещен кликбейт, обман пользователей в описании или выдача чужих работ за свои.</li>
            </ul>
          </section>

          <section className="space-y-3 border-l-2 pl-6 transition-colors duration-300" style={{ borderColor: "var(--color-hairline)" }}>
            <h2 className="text-xl font-bold text-[var(--color-pure-white)] flex items-center gap-2">
              <span className="text-[var(--color-coral-text)] font-data">4.</span> Модерация
            </h2>
            <p className="text-sm text-[var(--color-ash)] leading-relaxed">
              Администрация и модераторы Lexis оставляют за собой право редактировать, верифицировать или удалять любые публикации, нарушающие настоящие правила, без предварительного уведомления. При удалении пресета модератор указывает официальную причину, которая будет отправлена автору в систему уведомлений на сайте.
            </p>
          </section>
        </div>

        <div
          className="mt-10 p-4 rounded-xl text-xs text-center relative z-10 border"
          style={{ background: "var(--overlay-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ash)" }}
        >
          Несоблюдение правил может привести к временной или постоянной блокировке возможности загружать пресеты на сайт.
        </div>
      </div>
    </main>
  );
}

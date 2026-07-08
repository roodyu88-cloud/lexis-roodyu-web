import Link from "next/link";

export default function RulesPage() {
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <Link href="/" className="text-[#5865F2] hover:underline mb-4 inline-block">
        ← На главную
      </Link>

      <div className="glass-card p-8 md:p-12 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#5865F2]/10 rounded-full blur-3xl pointer-events-none"></div>

        <h1 className="text-4xl font-extrabold text-white mb-6 glow-text tracking-tight">
          Правила публикации пресетов
        </h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Добро пожаловать в базу пресетов Lexis! Для поддержания порядка, безопасности и высокого качества контента на платформе действуют следующие обязательные правила. Пожалуйста, внимательно ознакомьтесь с ними перед публикацией.
        </p>

        <div className="space-y-6 text-gray-300">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#5865F2]">1.</span> Содержимое пресета
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-sm text-gray-400">
              <li>Файлы пресетов должны иметь корректный формат JSON и быть полностью совместимы со справочником Lexis.</li>
              <li>Все разделы, статьи и заголовки должны соответствовать тематике GTA 5 RP серверов (законы, уставы, кодексы, шпаргалки).</li>
              <li>Запрещено публиковать пустые или сломанные пресеты.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#5865F2]">2.</span> Запрещенный контент
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-sm text-gray-400">
              <li>Строго запрещен любой вредоносный код, спам, ссылки на фишинговые сайты или вирусы.</li>
              <li>Запрещено публиковать оскорбительный контент, нецензурную брань в названиях или описаниях пресетов, а также призывы к ненависти и дискриминации.</li>
              <li>Запрещена реклама сторонних услуг, не относящихся к функционалу Lexis или игровым серверам.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#5865F2]">3.</span> Названия и Описания
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-sm text-gray-400">
              <li>Название пресета должно четко отражать его суть (например, "LSPD | GTA5RP Rainbow").</li>
              <li>Описание должно содержать информацию о версии пресета, сервере и фракции, для которых он предназначен.</li>
              <li>Запрещен кликбейт, обман пользователей в описании или выдача чужих работ за свои.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#5865F2]">4.</span> Модерация
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Администрация и модераторы Lexis оставляют за собой право редактировать, верифицировать или удалять любые публикации, нарушающие настоящие правила, без предварительного уведомления. При удалении пресета модератор указывает официальную причину, которая будет отправлена автору в систему уведомлений на сайте.
            </p>
          </section>
        </div>

        <div className="mt-10 p-4 bg-[#5865F2]/10 border border-[#5865F2]/20 rounded-xl text-xs text-gray-400 text-center">
          Несоблюдение правил может привести к временной или постоянной блокировке возможности загружать пресеты на сайт.
        </div>
      </div>
    </main>
  );
}

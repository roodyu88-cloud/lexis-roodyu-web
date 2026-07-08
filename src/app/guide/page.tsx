"use client";

import Link from "next/link";

export default function GuidePage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center justify-start relative overflow-hidden">
      {/* Background gradients */}
      <div className="fixed top-20 left-[10%] w-[500px] h-[500px] bg-[#5865F2]/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen opacity-50"></div>
      <div className="fixed bottom-20 right-[10%] w-[600px] h-[600px] bg-[#00F0FF]/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen opacity-50"></div>

      <div className="max-w-4xl w-full z-10 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-6 animate-fade-in">
          <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-4 text-xs font-bold text-gray-300 uppercase tracking-widest shadow-xl">
            Официальное руководство
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight drop-shadow-2xl">
            Как использовать <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#5865F2]">Lexis</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
            Полный гайд по функционалу, интеграции с игрой и правильной настройке приложения без лишних мучений.
          </p>
        </div>

        {/* Section 1: IMPORT - CRITICAL */}
        <div className="glass-card p-8 md:p-10 rounded-3xl border border-amber-500/30 relative overflow-hidden group shadow-[0_0_50px_-10px_rgba(245,158,11,0.2)] animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="absolute top-0 right-0 p-6 text-6xl opacity-10 transform rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-6">📥</div>
          <h2 className="text-3xl font-bold text-amber-400 mb-6 flex items-center gap-3">
            <span className="bg-amber-500/20 text-amber-400 w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]">1</span>
            Импорт законов (ВАЖНО!)
          </h2>
          <div className="prose prose-invert max-w-none space-y-4 text-gray-300">
            <p className="text-lg">
              Многие новые пользователи начинают <strong>вручную переписывать или копировать</strong> законы по одной статье в приложение. <strong className="text-white">Пожалуйста, не делайте этого!</strong>
            </p>
            <div className="bg-black/30 p-6 rounded-xl border border-white/5 space-y-4 relative">
              <h3 className="text-xl font-bold text-white mb-2">Как правильно получить законы своего сервера:</h3>
              <ol className="list-decimal list-inside space-y-3 marker:text-[#5865F2] marker:font-bold">
                <li>Откройте вкладку <Link href="/presets" className="text-[#5865F2] hover:underline font-bold">Пресеты</Link> в верхнем меню сайта.</li>
                <li>Найдите свой проект/сервер в списке (например, Majestic, GTA 5 RP и т.д.).</li>
                <li>Выберите нужный закон (например, Уголовный Кодекс) из готового списка.</li>
                <li>Нажмите синюю кнопку <strong>«Импортировать в Lexis»</strong>.</li>
                <li>В браузере появится всплывающее окно — разрешите открыть приложение <strong>Lexis</strong>.</li>
                <li>Закон <strong>моментально</strong> появится в вашей программе со всеми статьями, сроками и статьями розыска!</li>
              </ol>
            </div>
            <p className="text-sm text-gray-400 pt-2">
              <em>Если нужного закона для вашего сервера еще нет, вы можете создать его вручную, а затем нажать "Поделиться" в программе, чтобы другие игроки тоже могли его скачать!</em>
            </p>
          </div>
        </div>

        {/* Section 2: AI Assistant */}
        <div className="glass-card p-8 md:p-10 rounded-3xl border border-white/10 relative overflow-hidden group shadow-2xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="absolute top-0 right-0 p-6 text-6xl opacity-10 transform -rotate-12 transition-transform group-hover:scale-110 group-hover:-rotate-6">🧠</div>
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="bg-[#5865F2]/20 text-[#5865F2] w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]">2</span>
            ИИ-Ассистент (Юрист)
          </h2>
          <div className="prose prose-invert max-w-none space-y-4 text-gray-300">
            <p>
              Наш ИИ-Ассистент — это революционная функция. Он работает не как обычный ChatGPT, а опирается <strong>исключительно на законодательную базу выбранного вами сервера</strong>.
            </p>
            <ul className="list-disc list-inside space-y-2 marker:text-[#00F0FF]">
              <li><strong>Мгновенный ответ:</strong> Специальный ИИ-роутер сначала анализирует ваш вопрос и выбирает нужные кодексы (отсекая лишние), поэтому генерация ответа занимает секунды.</li>
              <li><strong>Стили общения:</strong> Вы можете выбрать стиль бота в настройках (Краткий, Подробный, Судья, Адвокат).</li>
              <li><strong>Галлюцинации:</strong> Бот не придумывает законы из реальной жизни. Если чего-то нет в законах вашего сервера — он так и скажет.</li>
            </ul>
          </div>
        </div>

        {/* Section 3: Overlay */}
        <div className="glass-card p-8 md:p-10 rounded-3xl border border-white/10 relative overflow-hidden group shadow-2xl animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="absolute top-0 right-0 p-6 text-6xl opacity-10 transform rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-6">🎯</div>
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="bg-[#00F0FF]/20 text-[#00F0FF] w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]">3</span>
            Игровой Оверлей
          </h2>
          <div className="prose prose-invert max-w-none space-y-4 text-gray-300">
            <p>
              Вам не нужно сворачивать игру, чтобы посмотреть нужную статью! Оверлей работает поверх всех окон.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <h4 className="text-white font-bold mb-2">⌨️ Настройка хоткея</h4>
                <p className="text-sm">По умолчанию оверлей открывается на <strong>F9</strong>. Вы можете изменить эту кнопку в настройках десктопного приложения. Перезапуск приложения после смены кнопки больше не требуется!</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <h4 className="text-white font-bold mb-2">📌 Закрепление (Pin)</h4>
                <p className="text-sm">Нажмите на иконку булавки рядом с любой статьей, чтобы она всегда отображалась на главном экране оверлея. Идеально подходит для статей, которые вы часто забываете.</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <h4 className="text-white font-bold mb-2">👻 Режим призрака</h4>
                <p className="text-sm">В настройках оверлея можно включить затемнение фона. Это позволит видеть игру сквозь текст законов.</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <h4 className="text-white font-bold mb-2">🎨 Кастомизация</h4>
                <p className="text-sm">В десктоп приложении (вкладка Настройки) вы можете изменить размер текста, подсказки и даже установить собственные обои (GIF/PNG).</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

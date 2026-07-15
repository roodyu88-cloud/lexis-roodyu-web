"use client";

import Link from "next/link";
import { Download, Brain, Target, Pin, Ghost, Palette, Keyboard } from "lucide-react";

export default function GuidePage() {
  return (
    <div className="min-h-screen pt-12 pb-20 px-6 flex flex-col items-center justify-start relative overflow-hidden">
      {/* Background gradients */}
      <div className="fixed top-20 left-[10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none mix-blend-screen opacity-50" style={{ background: "rgba(124, 108, 240, 0.12)" }}></div>
      <div className="fixed bottom-20 right-[10%] w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none mix-blend-screen opacity-50" style={{ background: "rgba(124, 108, 240, 0.06)" }}></div>

      <div className="max-w-4xl w-full z-10 space-y-12">

        {/* Header */}
        <div className="text-center space-y-6 animate-fade-in">
          <div className="rc-eyebrow inline-block px-4 py-1.5 rounded-full mb-4 shadow-xl" style={{ border: "1px solid var(--color-hairline)", background: "var(--overlay-soft)" }}>
            Официальное руководство
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight" style={{ color: "var(--color-pure-white)" }}>
            Как использовать Lexis
          </h1>
          <p className="text-xl max-w-2xl mx-auto font-medium" style={{ color: "var(--color-ash)" }}>
            Полный гайд по функционалу, интеграции с игрой и правильной настройке приложения без лишних мучений.
          </p>
        </div>

        {/* Section 1: IMPORT - CRITICAL */}
        <div className="rc-card-edge p-8 md:p-10 rounded-3xl relative overflow-hidden group shadow-2xl animate-fade-in" style={{ animationDelay: "0.1s", background: "var(--color-ink)" }}>
          <div className="absolute top-0 right-0 p-6 opacity-10 transform rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-6">
            <Download className="w-16 h-16 md:w-20 md:h-20" style={{ color: "var(--color-coral-text)" }} strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3" style={{ color: "var(--color-pure-white)" }}>
            <span className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]" style={{ background: "var(--color-coral-pulse)", color: "var(--color-on-coral)" }}>1</span>
            Импорт законов (ВАЖНО!)
          </h2>
          <div className="max-w-none space-y-4" style={{ color: "var(--color-ash)" }}>
            <p className="text-lg">
              Многие новые пользователи начинают <strong>вручную переписывать или копировать</strong> законы по одной статье в приложение. <strong style={{ color: "var(--color-pure-white)" }}>Пожалуйста, не делайте этого!</strong>
            </p>
            <div className="p-6 rounded-xl space-y-4 relative" style={{ background: "var(--color-obsidian)", border: "1px solid var(--color-hairline)" }}>
              <h3 className="text-xl font-bold mb-2" style={{ color: "var(--color-pure-white)" }}>Как правильно получить законы своего сервера:</h3>
              <ol className="list-decimal list-inside space-y-3 marker:font-bold" style={{ color: "var(--color-ash)" }}>
                <li>Откройте вкладку <Link href="/presets" className="hover:underline font-bold" style={{ color: "var(--color-pure-white)" }}>Пресеты</Link> в верхнем меню сайта.</li>
                <li>Найдите свой проект/сервер в списке (например, Majestic, GTA 5 RP и т.д.).</li>
                <li>Выберите нужный закон (например, Уголовный Кодекс) из готового списка.</li>
                <li>Нажмите кнопку <strong>«Импортировать в Lexis»</strong>.</li>
                <li>В браузере появится всплывающее окно — разрешите открыть приложение <strong>Lexis</strong>.</li>
                <li>Закон <strong>моментально</strong> появится в вашей программе со всеми статьями, сроками и статьями розыска!</li>
              </ol>
            </div>
            <p className="text-sm pt-2" style={{ color: "var(--color-smoke)" }}>
              <em>Если нужного закона для вашего сервера еще нет, вы можете создать его вручную, а затем нажать "Поделиться" в программе, чтобы другие игроки тоже могли его скачать!</em>
            </p>
          </div>
        </div>

        {/* Section 2: AI Assistant */}
        <div className="rc-card-edge p-8 md:p-10 rounded-3xl relative overflow-hidden group shadow-2xl animate-fade-in" style={{ animationDelay: "0.2s", background: "var(--color-ink)" }}>
          <div className="absolute top-0 right-0 p-6 opacity-10 transform -rotate-12 transition-transform group-hover:scale-110 group-hover:-rotate-6">
            <Brain className="w-16 h-16 md:w-20 md:h-20" style={{ color: "var(--color-coral-text)" }} strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3" style={{ color: "var(--color-pure-white)" }}>
            <span className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]" style={{ background: "var(--color-coral-pulse)", color: "var(--color-on-coral)" }}>2</span>
            ИИ-Ассистент (Юрист)
          </h2>
          <div className="max-w-none space-y-4" style={{ color: "var(--color-ash)" }}>
            <p>
              Наш ИИ-Ассистент — это революционная функция. Он работает не как обычный ChatGPT, а опирается <strong>исключительно на законодательную базу выбранного вами сервера</strong>.
            </p>
            <ul className="list-disc list-inside space-y-2" style={{ color: "var(--color-ash)" }}>
              <li><strong>Мгновенный ответ:</strong> Специальный ИИ-роутер сначала анализирует ваш вопрос и выбирает нужные кодексы (отсекая лишние), поэтому генерация ответа занимает секунды.</li>
              <li><strong>Стили общения:</strong> Вы можете выбрать стиль бота в настройках (Краткий, Подробный, Судья, Адвокат).</li>
              <li><strong>Галлюцинации:</strong> Бот не придумывает законы из реальной жизни. Если чего-то нет в законах вашего сервера — он так и скажет.</li>
            </ul>
          </div>
        </div>

        {/* Section 3: Overlay */}
        <div className="rc-card-edge p-8 md:p-10 rounded-3xl relative overflow-hidden group shadow-2xl animate-fade-in" style={{ animationDelay: "0.3s", background: "var(--color-ink)" }}>
          <div className="absolute top-0 right-0 p-6 opacity-10 transform rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-6">
            <Target className="w-16 h-16 md:w-20 md:h-20" style={{ color: "var(--color-coral-text)" }} strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3" style={{ color: "var(--color-pure-white)" }}>
            <span className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]" style={{ background: "var(--color-coral-pulse)", color: "var(--color-on-coral)" }}>3</span>
            Игровой Оверлей
          </h2>
          <div className="max-w-none space-y-4" style={{ color: "var(--color-ash)" }}>
            <p>
              Вам не нужно сворачивать игру, чтобы посмотреть нужную статью! Оверлей работает поверх всех окон.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-xl" style={{ background: "var(--overlay-soft)", border: "1px solid var(--color-hairline)" }}>
                <h4 className="font-bold mb-2 flex items-center gap-2" style={{ color: "var(--color-pure-white)" }}>
                  <Keyboard className="w-4 h-4" style={{ color: "var(--color-smoke)" }} /> Настройка хоткея
                </h4>
                <p className="text-sm">По умолчанию оверлей открывается на <strong>F9</strong>. Вы можете изменить эту кнопку в настройках десктопного приложения. Перезапуск приложения после смены кнопки больше не требуется!</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: "var(--overlay-soft)", border: "1px solid var(--color-hairline)" }}>
                <h4 className="font-bold mb-2 flex items-center gap-2" style={{ color: "var(--color-pure-white)" }}>
                  <Pin className="w-4 h-4" style={{ color: "var(--color-smoke)" }} /> Закрепление (Pin)
                </h4>
                <p className="text-sm">Нажмите на иконку булавки рядом с любой статьей, чтобы она всегда отображалась на главном экране оверлея. Идеально подходит для статей, которые вы часто забываете.</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: "var(--overlay-soft)", border: "1px solid var(--color-hairline)" }}>
                <h4 className="font-bold mb-2 flex items-center gap-2" style={{ color: "var(--color-pure-white)" }}>
                  <Ghost className="w-4 h-4" style={{ color: "var(--color-smoke)" }} /> Режим призрака
                </h4>
                <p className="text-sm">В настройках оверлея можно включить затемнение фона. Это позволит видеть игру сквозь текст законов.</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: "var(--overlay-soft)", border: "1px solid var(--color-hairline)" }}>
                <h4 className="font-bold mb-2 flex items-center gap-2" style={{ color: "var(--color-pure-white)" }}>
                  <Palette className="w-4 h-4" style={{ color: "var(--color-smoke)" }} /> Кастомизация
                </h4>
                <p className="text-sm">В десктоп приложении (вкладка Настройки) вы можете изменить размер текста, подсказки и даже установить собственные обои (GIF/PNG).</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

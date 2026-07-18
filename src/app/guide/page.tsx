"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Brain, Target, Pin, Ghost, Palette, Keyboard, ChevronDown } from "lucide-react";

const SECTIONS = [
  { icon: Download, title: "Импорт законов (ВАЖНО!)" },
  { icon: Brain, title: "ИИ-Ассистент (Юрист)" },
  { icon: Target, title: "Игровой Оверлей" },
];

export default function GuidePage() {
  const [openSection, setOpenSection] = useState<number | null>(0);

  return (
    <main className="min-h-screen p-6 md:p-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <span className="rc-eyebrow" style={{ color: "var(--color-coral-text)" }}>Официальное руководство</span>
        <h1 className="text-heading-lg font-normal mt-3 mb-4 leading-[var(--leading-heading-lg)] tracking-[var(--tracking-heading-lg)] text-[var(--color-pure-white)]">
          Как использовать Lexis
        </h1>
        <p className="text-body-lg max-w-2xl mx-auto text-[var(--color-ash)]">
          Полный гайд по функционалу, интеграции с игрой и правильной настройке приложения без лишних мучений.
        </p>
      </div>

      <div className="rc-accordion">
        {SECTIONS.map((section, i) => {
          const Icon = section.icon;
          const isOpen = openSection === i;
          const num = String(i + 1).padStart(2, "0");
          return (
            <div key={section.title} className={`rc-accordion-item ${isOpen ? "is-open" : ""}`}>
              <button
                type="button"
                className="rc-accordion-trigger"
                onClick={() => setOpenSection(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                <span className="rc-accordion-num">{num}</span>
                <span className="rc-accordion-icon">
                  <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
                </span>
                <span className="rc-accordion-title">{section.title}</span>
                <ChevronDown className="rc-accordion-chevron w-5 h-5" />
              </button>
              <div className="rc-accordion-panel">
                <div className="rc-accordion-panel-inner">
                  <div className="rc-accordion-panel-content">
                    {i === 0 && (
                      <div className="space-y-4">
                        <p>
                          Многие новые пользователи начинают <strong>вручную переписывать или копировать</strong> законы по одной статье в приложение. <strong style={{ color: "var(--color-pure-white)" }}>Пожалуйста, не делайте этого!</strong>
                        </p>
                        <div className="p-5 rounded-[var(--radius-lg)]" style={{ background: "var(--overlay-soft)", border: "1px solid var(--color-hairline)" }}>
                          <h3 className="font-bold mb-3" style={{ color: "var(--color-pure-white)" }}>Как правильно получить законы своего сервера:</h3>
                          <ol className="list-decimal list-inside space-y-2 marker:font-bold">
                            <li>Откройте вкладку <Link href="/presets" className="rc-link font-medium">Пресеты</Link> в верхнем меню сайта.</li>
                            <li>Найдите свой проект/сервер в списке (например, Majestic, GTA 5 RP и т.д.).</li>
                            <li>Выберите нужный закон (например, Уголовный Кодекс) из готового списка.</li>
                            <li>Нажмите кнопку <strong>«Импортировать в Lexis»</strong>.</li>
                            <li>В браузере появится всплывающее окно — разрешите открыть приложение <strong>Lexis</strong>.</li>
                            <li>Закон <strong>моментально</strong> появится в вашей программе со всеми статьями, сроками и статьями розыска!</li>
                          </ol>
                        </div>
                        <p className="text-sm" style={{ color: "var(--color-smoke)" }}>
                          <em>Если нужного закона для вашего сервера еще нет, вы можете создать его вручную, а затем нажать «Поделиться» в программе, чтобы другие игроки тоже могли его скачать!</em>
                        </p>
                      </div>
                    )}
                    {i === 1 && (
                      <div className="space-y-4">
                        <p>
                          Наш ИИ-Ассистент — это революционная функция. Он работает не как обычный ChatGPT, а опирается <strong>исключительно на законодательную базу выбранного вами сервера</strong>.
                        </p>
                        <ul className="list-disc list-inside space-y-2">
                          <li><strong>Мгновенный ответ:</strong> Специальный ИИ-роутер сначала анализирует ваш вопрос и выбирает нужные кодексы (отсекая лишние), поэтому генерация ответа занимает секунды.</li>
                          <li><strong>Стили общения:</strong> Вы можете выбрать стиль бота в настройках (Краткий, Подробный, Судья, Адвокат).</li>
                          <li><strong>Галлюцинации:</strong> Бот не придумывает законы из реальной жизни. Если чего-то нет в законах вашего сервера — он так и скажет.</li>
                        </ul>
                      </div>
                    )}
                    {i === 2 && (
                      <div className="space-y-4">
                        <p>Вам не нужно сворачивать игру, чтобы посмотреть нужную статью! Оверлей работает поверх всех окон.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-[var(--radius-lg)]" style={{ background: "var(--overlay-soft)", border: "1px solid var(--color-hairline)" }}>
                            <h4 className="font-bold mb-2 flex items-center gap-2" style={{ color: "var(--color-pure-white)" }}>
                              <Keyboard className="w-4 h-4" style={{ color: "var(--color-smoke)" }} /> Настройка хоткея
                            </h4>
                            <p className="text-sm">По умолчанию оверлей открывается на <strong>F9</strong>. Вы можете изменить эту кнопку в настройках десктопного приложения. Перезапуск приложения после смены кнопки больше не требуется!</p>
                          </div>
                          <div className="p-4 rounded-[var(--radius-lg)]" style={{ background: "var(--overlay-soft)", border: "1px solid var(--color-hairline)" }}>
                            <h4 className="font-bold mb-2 flex items-center gap-2" style={{ color: "var(--color-pure-white)" }}>
                              <Pin className="w-4 h-4" style={{ color: "var(--color-smoke)" }} /> Закрепление (Pin)
                            </h4>
                            <p className="text-sm">Нажмите на иконку булавки рядом с любой статьей, чтобы она всегда отображалась на главном экране оверлея. Идеально подходит для статей, которые вы часто забываете.</p>
                          </div>
                          <div className="p-4 rounded-[var(--radius-lg)]" style={{ background: "var(--overlay-soft)", border: "1px solid var(--color-hairline)" }}>
                            <h4 className="font-bold mb-2 flex items-center gap-2" style={{ color: "var(--color-pure-white)" }}>
                              <Ghost className="w-4 h-4" style={{ color: "var(--color-smoke)" }} /> Режим призрака
                            </h4>
                            <p className="text-sm">В настройках оверлея можно включить затемнение фона. Это позволит видеть игру сквозь текст законов.</p>
                          </div>
                          <div className="p-4 rounded-[var(--radius-lg)]" style={{ background: "var(--overlay-soft)", border: "1px solid var(--color-hairline)" }}>
                            <h4 className="font-bold mb-2 flex items-center gap-2" style={{ color: "var(--color-pure-white)" }}>
                              <Palette className="w-4 h-4" style={{ color: "var(--color-smoke)" }} /> Кастомизация
                            </h4>
                            <p className="text-sm">В десктоп приложении (вкладка Настройки) вы можете изменить размер текста, подсказки и даже установить собственные обои (GIF/PNG).</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

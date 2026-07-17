"use client";

import { useState } from "react";
import { ChevronDown, Wrench, Download, Gamepad2, Sparkles, Lightbulb } from "lucide-react";

interface Item {
  icon: React.ElementType;
  title: string;
  body: React.ReactNode;
}

const ITEMS: Item[] = [
  {
    icon: Wrench,
    title: "Как установить Lexis?",
    body: (
      <>
        <p className="text-body text-[var(--color-ash)] leading-relaxed">
          1. Нажмите кнопку <b className="text-[var(--color-pure-white)]">«Скачать Lexis»</b> на главной странице.<br />
          2. Распакуйте скачанный архив в любую удобную папку (<b className="text-[var(--color-pure-white)]">важно:</b> не запускайте программу прямо внутри архива!).<br />
          3. Запустите файл <b className="text-[var(--color-pure-white)]">Lexis.exe</b>. Приложение откроется и свернется в системный трей (возле часов).
        </p>
        <div className="rounded-lg border p-3 mt-3" style={{ borderColor: "var(--color-hairline)", background: "var(--color-obsidian)" }}>
          <span className="inline-flex items-center gap-1.5 font-medium text-body" style={{ color: "var(--color-coral-text)" }}>
            <Lightbulb className="w-4 h-4" /> Заметка:
          </span>{" "}
          <span className="text-body text-[var(--color-ash)]">Если Windows SmartScreen заблокирует запуск, нажмите «Подробнее» → «Выполнить в любом случае». Это нормально для новых программ без платной цифровой подписи.</span>
        </div>
      </>
    ),
  },
  {
    icon: Download,
    title: "Как загрузить закон (пресет) с сайта?",
    body: (
      <>
        <p className="text-body text-[var(--color-ash)] leading-relaxed mb-3">
          Перейдите в раздел <b className="text-[var(--color-pure-white)]">«База Пресетов»</b>. Найдите нужный вам сервер и закон. У вас есть два пути:
        </p>
        <ul className="text-body text-[var(--color-ash)] leading-relaxed list-disc list-inside space-y-1">
          <li><b className="text-[var(--color-pure-white)]">Автоматически (Рекомендуется):</b> Просто нажмите кнопку «Импортировать в приложение» на сайте. Откроется Lexis, и пресет установится сам!</li>
          <li><b className="text-[var(--color-pure-white)]">Вручную:</b> Скачайте `.json` файл пресета с сайта. Затем в приложении Lexis зайдите во вкладку «Профили», нажмите «Импорт» и выберите скачанный файл.</li>
        </ul>
      </>
    ),
  },
  {
    icon: Gamepad2,
    title: "Почему оверлей не открывается в игре по кнопке F9?",
    body: (
      <p className="text-body text-[var(--color-ash)] leading-relaxed">
        Для корректной работы оверлея поверх игры, ваша GTA 5 (или любая другая игра) должна быть запущена в режиме <span className="text-[var(--color-pure-white)] font-medium">«В окне без рамок» (Windowed Borderless)</span> или <span className="text-[var(--color-pure-white)] font-medium">«Оконный» (Windowed)</span>.
        В полноэкранном (Fullscreen) режиме операционная система Windows жестко блокирует отрисовку сторонних окон поверх игры.
      </p>
    ),
  },
  {
    icon: Sparkles,
    title: "Как добавить свои собственные статьи?",
    body: (
      <p className="text-body text-[var(--color-ash)] leading-relaxed">
        Вы можете добавлять статьи вручную по одной во вкладке <b className="text-[var(--color-pure-white)]">«Редактор»</b>, либо использовать наш <b className="text-[var(--color-pure-white)]">Умный Парсер</b>. Просто скопируйте весь текст законодательной базы прямо с форума проекта, вставьте его в парсер, и приложение само разобьет текст на статьи, вытащит названия, определит наказания и расставит звездочки приоритета розыска!
      </p>
    ),
  },
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="rc-accordion">
      {ITEMS.map((item, i) => {
        const Icon = item.icon;
        const isOpen = openIndex === i;
        const num = String(i + 1).padStart(2, "0");

        return (
          <div key={item.title} className={`rc-accordion-item ${isOpen ? "is-open" : ""}`}>
            <button
              type="button"
              className="rc-accordion-trigger"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span className="rc-accordion-num">{num}</span>
              <span className="rc-accordion-icon">
                <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
              </span>
              <span className="rc-accordion-title">{item.title}</span>
              <ChevronDown className="rc-accordion-chevron w-5 h-5" />
            </button>
            <div className="rc-accordion-panel">
              <div className="rc-accordion-panel-inner">
                <div className="rc-accordion-panel-content">{item.body}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

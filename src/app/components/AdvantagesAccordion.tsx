"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, BookOpen, Brain, GraduationCap, Gamepad2, Zap, Globe, Palette } from "lucide-react";

interface Item {
  href?: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  tags: string[];
}

const ITEMS: Item[] = [
  {
    href: "/presets",
    icon: BookOpen,
    title: "База Пресетов",
    desc: "Готовые своды законов популярных серверов — импорт в один клик, без ручного набора текста.",
    tags: ["Импорт", "Сообщество"],
  },
  {
    href: "/assistant",
    icon: Brain,
    title: "ИИ-Ассистент",
    desc: "Отвечает строго по законам вашего сервера, без выдумок и общих формулировок из реального УК.",
    tags: ["ИИ", "Юрист"],
  },
  {
    href: "/exam",
    icon: GraduationCap,
    title: "Тренажер экзаменов",
    desc: "Автогенерация тестов на знание кодекса перед приемом на фракцию, с историей попыток.",
    tags: ["Экзамены", "PRO"],
  },
  {
    href: "/guide",
    icon: Gamepad2,
    title: "Игровой оверлей",
    desc: "Открывается по F9 поверх игры, не сворачивая GTA и не мешая ролплею.",
    tags: ["F9", "Оверлей"],
  },
  {
    icon: Zap,
    title: "Моментально",
    desc: "Мгновенный вызов по кнопке F9. Никаких сворачиваний игры во время ареста или допроса.",
    tags: ["Скорость"],
  },
  {
    icon: Globe,
    title: "Облако Пресетов",
    desc: "Делитесь своими законами и скачивайте пресеты других серверов в один клик.",
    tags: ["Облако", "Шеринг"],
  },
  {
    icon: Palette,
    title: "Умный Дизайн",
    desc: "Темная тема, подсветка синтаксиса и никаких артефактов поверх вашего геймплея.",
    tags: ["Тема", "UI"],
  },
];

export default function AdvantagesAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="rc-accordion">
      {ITEMS.map((item, i) => {
        const Icon = item.icon;
        const isOpen = openIndex === i;
        const num = String(i + 1).padStart(2, "0");

        const body = (
          <>
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
                <div className="rc-accordion-panel-content">
                  <p className="mb-3">{item.desc}</p>
                  <div className="flex flex-wrap gap-2 items-center">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: "var(--overlay-soft)", color: "var(--color-ash)", border: "1px solid var(--color-hairline)" }}
                      >
                        {tag}
                      </span>
                    ))}
                    {item.href && (
                      <Link
                        href={item.href}
                        className="text-xs font-semibold ml-auto"
                        style={{ color: "var(--color-coral-text)" }}
                      >
                        Открыть →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        );

        return (
          <div key={item.title} className={`rc-accordion-item ${isOpen ? "is-open" : ""}`}>
            {body}
          </div>
        );
      })}
    </div>
  );
}

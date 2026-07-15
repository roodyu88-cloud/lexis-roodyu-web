import Link from "next/link";
// PLACEHOLDER-DB (2026-07-15): unused while DB call below is placeholdered — restore with the query.
// import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { GraduationCap, Zap, Globe, Palette, Wrench, Download, Gamepad2, Sparkles, Lightbulb, BookOpen, Brain, ArrowRight, ShieldCheck } from "lucide-react";

export const revalidate = 0;

export default async function Home() {
  // PLACEHOLDER-DB (2026-07-15): DATABASE_URL absent in this dev env, real query crashes SSR.
  // Original: const discordSetting = await prisma.appSetting.findUnique({ where: { key: "discordUrl" } });
  // const discordUrl = discordSetting?.value || "https://dsc.gg/lexis";
  const discordUrl = "https://dsc.gg/lexis";

  const session = await getServerSession(authOptions);
  const isPremium = (session?.user as any)?.isPremium || false;

  return (
    <main className="min-h-screen w-full bg-[var(--color-void-black)]">

      {/* Hero Section — the one place the system breaks its own achromatic rule */}
      <section className="rc-hero w-full flex flex-col items-center text-center px-8 py-24 md:py-36">
        <div className="rc-hero-wash" aria-hidden="true" />
        <div className="rc-hero-beams" aria-hidden="true" />

        <div className="rc-hero-content max-w-3xl w-full flex flex-col items-center space-y-6">
          <div
            className="rc-eyebrow inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
            style={{ borderColor: "var(--color-hairline)", color: "var(--color-coral-text)" }}
          >
            v2.1.0 — Теперь с биндером!
          </div>
          <h1 className="text-heading-lg font-normal text-[var(--color-pure-white)] leading-[var(--leading-heading-lg)] tracking-[var(--tracking-heading-lg)]">
            Твой идеальный <br />
            RP Справочник
          </h1>
          <p className="text-body-lg text-[var(--color-ash)] max-w-2xl mx-auto">
            Lexis — это стильный оверлей для GTA 5 RP, который позволяет мгновенно находить нужные статьи и законы прямо поверх игры по кнопке F9.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 flex-wrap justify-center">
            <Link href="/releases/latest" className="rc-btn">
              <Download className="w-4 h-4" />
              Скачать Lexis
            </Link>
            <Link href="/presets" className="rc-btn-ghost">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              База Пресетов
            </Link>
            <a href={discordUrl} target="_blank" rel="noreferrer" className="rc-btn-ghost">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" /></svg>
              Discord
            </a>
            <Link href="/exam" className="rc-btn-ghost">
              <GraduationCap className="w-4 h-4" />
              Тренажер
              <span className="rc-badge" style={{ background: "var(--color-coral-pulse)", color: "var(--color-on-coral)" }}>PRO</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Capability tiles — adapted from the extension-grid pattern: each tile is a real
          section of the product, not a marketplace item, so icons are Lexis's own features
          rather than per-item brand colors. */}
      <section className="max-w-6xl w-full mx-auto px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-heading font-bold text-[var(--color-pure-white)] mb-3">Всё необходимое — в одном оверлее.</h2>
          <p className="text-body-lg text-[var(--color-ash)] max-w-xl mx-auto">Пресеты, ИИ-юрист и тренажер экзаменов работают вместе, чтобы вы не открывали браузер во время ролплея.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { href: "/presets", icon: BookOpen, title: "База Пресетов", desc: "Готовые своды законов популярных серверов — импорт в один клик." },
            { href: "/assistant", icon: Brain, title: "ИИ-Ассистент", desc: "Отвечает строго по законам вашего сервера, без выдумок." },
            { href: "/exam", icon: GraduationCap, title: "Тренажер экзаменов", desc: "Автогенерация тестов на знание кодекса перед приемом на фракцию." },
            { href: "/guide", icon: Gamepad2, title: "Игровой оверлей", desc: "Открывается по F9 поверх игры, не сворачивая GTA." },
          ].map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="rc-card-edge group relative bg-[var(--color-ink)] !p-0 overflow-hidden block transition-all duration-200 hover:-translate-y-1 hover:border-[color:var(--color-slate)]"
            >
              <div className="relative h-24 flex items-center justify-center overflow-hidden" style={{ background: "var(--color-obsidian)", borderBottom: "1px solid var(--color-hairline)" }}>
                <div className="absolute inset-0 opacity-50" style={{ background: "radial-gradient(circle at 30% 20%, rgba(124,108,240,0.10), transparent 60%)" }} />
                <div className="w-11 h-11 rounded-xl flex items-center justify-center relative z-10" style={{ background: "var(--color-graphite)", border: "1px solid var(--color-hairline)", boxShadow: "var(--shadow-key)" }}>
                  <tile.icon className="w-5 h-5" style={{ color: "var(--color-coral-text)" }} />
                </div>
                <div
                  className="absolute bottom-3 right-3 w-6 h-6 rounded-lg flex items-center justify-center z-10 opacity-0 translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
                  style={{ background: "var(--color-graphite)", border: "1px solid var(--color-hairline)" }}
                >
                  <ArrowRight className="w-3 h-3" style={{ color: "var(--color-pure-white)" }} />
                </div>
              </div>
              <div className="p-5 text-left">
                <h3 className="font-bold text-[var(--color-pure-white)] mb-1.5">{tile.title}</h3>
                <p className="text-sm text-[var(--color-ash)] leading-relaxed">{tile.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* AI showcase — contained echo of the hero's diagonal-beam signature, framing a
          mockup of an actual assistant answer instead of a generic screenshot. */}
      <section className="max-w-5xl w-full mx-auto px-8 py-12">
        <div className="flex items-center gap-4 justify-center mb-10">
          <div className="h-px w-16" style={{ background: "var(--color-hairline)" }} />
          <span className="rc-eyebrow" style={{ color: "var(--color-coral-text)" }}>ИИ-Ассистент</span>
          <div className="h-px w-16" style={{ background: "var(--color-hairline)" }} />
        </div>
        <h2 className="text-heading font-bold text-[var(--color-pure-white)] text-center mb-3">Юрист, который знает только ваш сервер.</h2>
        <p className="text-body-lg text-[var(--color-ash)] text-center max-w-xl mx-auto mb-12">Никаких выдуманных статей из реального УК — только то, что загружено в базу вашего сервера.</p>

        <div className="relative overflow-hidden rounded-3xl" style={{ isolation: "isolate", border: "1px solid var(--color-hairline)", boxShadow: "var(--shadow-key)" }}>
          <div className="rc-hero-wash" aria-hidden="true" style={{ opacity: 0.6 }} />
          <div className="rc-hero-beams" aria-hidden="true" style={{ opacity: 0.7 }} />
          <div className="relative z-10 p-3 sm:p-6">
            <div className="rounded-2xl overflow-hidden" style={{ background: "color-mix(in srgb, var(--color-ink) 92%, transparent)", border: "1px solid var(--color-hairline)", backdropFilter: "blur(20px)" }}>
              <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--color-hairline)" }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--color-graphite)" }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--color-graphite)" }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--color-graphite)" }} />
                <span className="ml-2 text-xs font-medium" style={{ color: "var(--color-smoke)" }}>Lexis — ИИ-Ассистент</span>
              </div>
              <div className="p-6 text-left space-y-4">
                <div className="font-semibold text-[var(--color-pure-white)]">Можно ли оспорить штраф за превышение скорости?</div>
                <div className="text-sm text-[var(--color-ash)] leading-relaxed space-y-2">
                  <p>Да, если нарушение зафиксировано без радара офицера — по УК сервера Majestic (ст. 14.3) штраф можно оспорить в течение 24 часов:</p>
                  <p>1. Подайте жалобу через тикет-систему на форуме сервера.<br />2. Приложите пруф (видео/скриншот) момента фиксации.<br />3. Дождитесь ответа модератора фракции.</p>
                  <p>Если радар не был включен официально — штраф аннулируется автоматически.</p>
                </div>
                <div className="flex items-center gap-2 pt-2" style={{ borderTop: "1px solid var(--color-hairline)" }}>
                  <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "var(--overlay-soft)", color: "var(--color-ash)", border: "1px solid var(--color-hairline)" }}>
                    <ShieldCheck className="w-3 h-3" /> УК Majestic, ст. 14.3
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl w-full mx-auto flex flex-col items-center text-center space-y-8 px-8 pb-16">

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="rc-card bg-[var(--color-ink)]">
            <div
              className="w-12 h-12 rounded-full bg-[var(--color-obsidian)] flex items-center justify-center mb-6"
              style={{ boxShadow: "var(--shadow-key)" }}
            >
              <Zap className="w-5 h-5 text-[var(--color-mist)]" />
            </div>
            <h3 className="text-subheading font-semibold text-[var(--color-pure-white)] mb-3">Моментально</h3>
            <p className="text-body text-[var(--color-ash)] leading-relaxed">Мгновенный вызов по кнопке F9. Никаких сворачиваний игры во время ареста.</p>
          </div>
          <div className="rc-card bg-[var(--color-ink)]">
            <div
              className="w-12 h-12 rounded-full bg-[var(--color-obsidian)] flex items-center justify-center mb-6"
              style={{ boxShadow: "var(--shadow-key)" }}
            >
              <Globe className="w-5 h-5 text-[var(--color-mist)]" />
            </div>
            <h3 className="text-subheading font-semibold text-[var(--color-pure-white)] mb-3">Облако Пресетов</h3>
            <p className="text-body text-[var(--color-ash)] leading-relaxed">Делитесь своими законами и скачивайте пресеты других серверов в один клик.</p>
          </div>
          <div className="rc-card bg-[var(--color-ink)]">
            <div
              className="w-12 h-12 rounded-full bg-[var(--color-obsidian)] flex items-center justify-center mb-6"
              style={{ boxShadow: "var(--shadow-key)" }}
            >
              <Palette className="w-5 h-5 text-[var(--color-mist)]" />
            </div>
            <h3 className="text-subheading font-semibold text-[var(--color-pure-white)] mb-3">Умный Дизайн</h3>
            <p className="text-body text-[var(--color-ash)] leading-relaxed">Темная тема, подсветка синтаксиса и никаких артефактов поверх вашего геймплея.</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="w-full mt-24 mb-16 text-left">
          <h2 className="text-heading font-bold mb-8 text-center text-[var(--color-pure-white)]">Частые вопросы (FAQ)</h2>

          <div className="space-y-4">
            <div className="rc-card-edge bg-[var(--color-ink)]">
              <h3 className="text-body-lg font-semibold text-[var(--color-pure-white)] mb-2 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[var(--color-ash)]" /> Как установить Lexis?
              </h3>
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
            </div>

            <div className="rc-card-edge bg-[var(--color-ink)]">
              <h3 className="text-body-lg font-semibold text-[var(--color-pure-white)] mb-2 flex items-center gap-2">
                <Download className="w-4 h-4 text-[var(--color-ash)]" /> Как загрузить закон (пресет) с сайта?
              </h3>
              <p className="text-body text-[var(--color-ash)] leading-relaxed mb-3">
                Перейдите в раздел <b className="text-[var(--color-pure-white)]">«База Пресетов»</b>. Найдите нужный вам сервер и закон. У вас есть два пути:
              </p>
              <ul className="text-body text-[var(--color-ash)] leading-relaxed list-disc list-inside space-y-1">
                <li><b className="text-[var(--color-pure-white)]">Автоматически (Рекомендуется):</b> Просто нажмите кнопку «Импортировать в приложение» на сайте. Откроется Lexis, и пресет установится сам!</li>
                <li><b className="text-[var(--color-pure-white)]">Вручную:</b> Скачайте `.json` файл пресета с сайта. Затем в приложении Lexis зайдите во вкладку «Профили», нажмите «Импорт» и выберите скачанный файл.</li>
              </ul>
            </div>

            <div className="rc-card-edge bg-[var(--color-ink)]">
              <h3 className="text-body-lg font-semibold text-[var(--color-pure-white)] mb-2 flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-[var(--color-ash)]" /> Почему оверлей не открывается в игре по кнопке F9?
              </h3>
              <p className="text-body text-[var(--color-ash)] leading-relaxed">
                Для корректной работы оверлея поверх игры, ваша GTA 5 (или любая другая игра) должна быть запущена в режиме <span className="text-[var(--color-pure-white)] font-medium">«В окне без рамок» (Windowed Borderless)</span> или <span className="text-[var(--color-pure-white)] font-medium">«Оконный» (Windowed)</span>.
                В полноэкранном (Fullscreen) режиме операционная система Windows жестко блокирует отрисовку сторонних окон поверх игры.
              </p>
            </div>

            <div className="rc-card-edge bg-[var(--color-ink)]">
              <h3 className="text-body-lg font-semibold text-[var(--color-pure-white)] mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--color-ash)]" /> Как добавить свои собственные статьи?
              </h3>
              <p className="text-body text-[var(--color-ash)] leading-relaxed">
                Вы можете добавлять статьи вручную по одной во вкладке <b className="text-[var(--color-pure-white)]">«Редактор»</b>, либо использовать наш <b className="text-[var(--color-pure-white)]">Умный Парсер</b>. Просто скопируйте весь текст законодательной базы прямо с форума проекта, вставьте его в парсер, и приложение само разобьет текст на статьи, вытащит названия, определит наказания и расставит звездочки приоритета розыска!
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

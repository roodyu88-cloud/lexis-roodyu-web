"use client";

// PLACEHOLDER-DB (2026-07-15): unused while DB calls below are placeholdered — restore with the query.
// import { prisma } from "@/lib/prisma";
import Link from "next/link";
// import { notFound } from "next/navigation";
import { useDevSession } from "@/app/components/DevAuthProvider";
import { useEffect, useState } from "react";
import { ArrowLeft, Rocket, Pencil, BookOpen, ChevronDown } from "lucide-react";
import DeletePresetButton from "./DeletePresetButton";

export default function PresetDetailsClient({ id }: { id: string }) {
  const [domain, setDomain] = useState("");
  const [openChapter, setOpenChapter] = useState<number | null>(0);
  useEffect(() => {
    setDomain(window.location.origin);
  }, []);
  // PLACEHOLDER-DB (2026-07-15): DATABASE_URL absent in this dev env, real queries crash SSR.
  // Original:
  // const preset = await prisma.preset.findUnique({ where: { id: resolvedParams.id } });
  // if (!preset) return notFound();
  // const authorUser = preset.discordId ? await prisma.user.findUnique({ where: { discordId: preset.discordId } }) : null;
  const preset = {
    id, name: "Уголовный кодекс (плейсхолдер)", description: "Полный УК сервера Majestic — placeholder-данные для превью без БД.",
    author: "roodyu", discordId: "111111111111111111", data: JSON.stringify([{ name: "Глава 1. Общие положения", articles: [{ title: "Статья 1. Незаконное хранение оружия" }, { title: "Статья 2. Сопротивление сотруднику" }] }]),
    downloads: 482, isVerified: true, serverProjectId: "ph-project-1", serverId: "ph-server-1", createdAt: new Date("2026-06-01"),
  };

  const authorUser = { badges: JSON.stringify(["Creator", "Staff"]) };
  const authorBadges = authorUser ? JSON.parse(authorUser.badges || "[]") as string[] : [];

  const BADGE_FILES: Record<string, string> = {
    Staff: "Staff.png",
    BugHunter: "BugHunter.png",
    ActivePresetser: "ActivePresetser.png",
    Moderator: "Moderator.png",
    Partnered: "Partnered.png"
  };

  const BADGE_LABELS: Record<string, string> = {
    Staff: "Staff",
    BugHunter: "Bug Hunter",
    ActivePresetser: "Активный автор пресетов",
    Moderator: "Модератор Lexis",
    Partnered: "Партнер Lexis"
  };

  // Get current user session & permission checks
  const { data: session } = useDevSession();
  const currentUserId = session?.user ? (session.user as any).id : null;
  const currentUserRole = session?.user ? (session.user as any).role : "user";

  const isAuthor = preset.discordId === currentUserId;
  const isModOrAdmin = currentUserRole === "admin" || currentUserRole === "developer" || currentUserRole === "moderator" || currentUserId === "546005790864048140";
  const hasDeletePermission = isAuthor || isModOrAdmin;
  const hasEditPermission = isAuthor || isModOrAdmin;

  // Parse the JSON data safely
  let data;
  try {
    data = JSON.parse(preset.data);
  } catch (e) {
    data = [];
  }

  // Calculate stats
  const categoryCount = Array.isArray(data) ? data.length : (data?.data ? data.data.length : 0);
  let articleCount = 0;

  const rawArray = Array.isArray(data) ? data : (data?.data || []);
  rawArray.forEach((cat: any) => {
    if (cat.articles && Array.isArray(cat.articles)) {
      articleCount += cat.articles.length;
    }
  });

  // Protocol scheme for direct opening
  const directLink = `lexis://import?url=${domain}/api/download/${preset.id}`;

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <Link href="/presets" className="rc-link mb-8 inline-flex items-center gap-1.5">
        <ArrowLeft className="w-4 h-4" /> Назад к базе
      </Link>

      <div className="rc-card-edge !p-8 mb-8 relative bg-[var(--color-ink)]">
        {preset.isVerified && (
          <div className="absolute top-8 right-8 group/tooltip">
            <img src="/img/Verified.png" alt="Verified" className="h-10 w-auto" />
            <span className="absolute bottom-full right-0 mb-1.5 hidden group-hover/tooltip:block bg-[var(--color-graphite)] border border-[var(--color-hairline)] text-[var(--color-pure-white)] text-[11px] font-semibold px-2.5 py-1.5 rounded-lg shadow-2xl pointer-events-none whitespace-nowrap z-30">
              Верифицированный пресет
            </span>
          </div>
        )}
        <h1 className="text-heading font-bold text-[var(--color-pure-white)] mb-2 pr-12">{preset.name}</h1>
        <p className="text-[var(--color-ash)] mb-6">{preset.description || "Нет описания"}</p>

        <div className="flex flex-wrap gap-4 mb-8">
          <div className="bg-[var(--overlay-soft)] rounded-md px-4 py-2 border border-[var(--color-hairline)]">
            <span className="text-[var(--color-smoke)] text-sm block">Автор</span>
            <span className="text-[var(--color-pure-white)] font-semibold flex items-center gap-2">
              {preset.author}
              {authorBadges.map(b => {
                const file = BADGE_FILES[b];
                const label = BADGE_LABELS[b];
                if (!file) return null;
                return (
                  <span key={b} className="relative group/tooltip inline-block align-middle ml-1">
                    <img
                      src={`/img/${file}`}
                      alt={label}
                      className="h-4.5 w-auto cursor-help"
                    />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/tooltip:block bg-[var(--color-graphite)] border border-[var(--color-hairline)] text-[var(--color-pure-white)] text-[10px] font-semibold px-2 py-1 rounded-md shadow-2xl pointer-events-none whitespace-nowrap z-30">
                      {label}
                    </span>
                  </span>
                );
              })}
            </span>
          </div>
          <div className="bg-[var(--overlay-soft)] rounded-md px-4 py-2 border border-[var(--color-hairline)]">
            <span className="text-[var(--color-smoke)] text-sm block">Категорий</span>
            <span className="text-[var(--color-pure-white)] font-semibold font-data">{categoryCount}</span>
          </div>
          <div className="bg-[var(--overlay-soft)] rounded-md px-4 py-2 border border-[var(--color-hairline)]">
            <span className="text-[var(--color-smoke)] text-sm block">Статей</span>
            <span className="text-[var(--color-pure-white)] font-semibold font-data">{articleCount}</span>
          </div>
          <div className="bg-[var(--overlay-soft)] rounded-md px-4 py-2 border border-[var(--color-hairline)]">
            <span className="text-[var(--color-smoke)] text-sm block">Скачиваний</span>
            <span className="text-[var(--color-pure-white)] font-semibold font-data">{preset.downloads}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <a href={`/api/download/${preset.id}`} className="rc-btn">
              Скачать .json
            </a>
            <a href={directLink} className="rc-btn-ghost flex items-center gap-2">
              <Rocket className="w-4 h-4" /> Открыть в Lexis
            </a>
            {hasEditPermission && (
              <Link href={`/presets/${preset.id}/edit`} className="rc-btn-ghost flex items-center gap-1.5">
                <Pencil className="w-4 h-4" /> Редактировать
              </Link>
            )}
          </div>

          {hasDeletePermission && (
            <DeletePresetButton
              presetId={preset.id}
              presetName={preset.name}
              isAuthor={isAuthor}
              isModOrAdmin={isModOrAdmin}
            />
          )}
        </div>
      </div>

      <h2 className="text-heading-sm font-bold text-[var(--color-pure-white)] mb-6">Предпросмотр структуры</h2>
      <div className="rc-accordion">
        {rawArray.map((cat: any, idx: number) => {
          const isOpen = openChapter === idx;
          const num = String(idx + 1).padStart(2, "0");
          return (
            <div key={idx} className={`rc-accordion-item ${isOpen ? "is-open" : ""}`}>
              <button
                type="button"
                className="rc-accordion-trigger"
                onClick={() => setOpenChapter(isOpen ? null : idx)}
                aria-expanded={isOpen}
              >
                <span className="rc-accordion-num">{num}</span>
                <span className="rc-accordion-icon">
                  <BookOpen className="w-[18px] h-[18px]" strokeWidth={2} />
                </span>
                <span className="rc-accordion-title">{cat.name || "Без названия"}</span>
                <ChevronDown className="rc-accordion-chevron w-5 h-5" />
              </button>
              <div className="rc-accordion-panel">
                <div className="rc-accordion-panel-inner">
                  <div className="rc-accordion-panel-content">
                    {cat.articles && cat.articles.length > 0 ? (
                      <div className="space-y-2 pl-4 border-l-2 border-[var(--color-hairline)]">
                        {cat.articles.map((art: any, i: number) => (
                          <div key={i} className="text-[var(--color-ash)]">
                            <span className="font-semibold text-[var(--color-pure-white)]">{art.title}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[var(--color-smoke)] italic">Нет статей</div>
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

"use client";

import { useState, useEffect } from "react";
import { SERVERS, PROJECTS } from "@/lib/serverLaws";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, AlertTriangle, X } from "lucide-react";

export default function ExamClient({ isPremium }: { isPremium: boolean }) {
  const [stage, setStage] = useState<"setup" | "loading" | "history">("setup");
  const [serverId, setServerId] = useState(SERVERS[0].id);
  const [faction, setFaction] = useState<string>("LSPD");
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [showAnswersAtEnd, setShowAnswersAtEnd] = useState<boolean>(true);

  const [isServerSelectOpen, setIsServerSelectOpen] = useState(false);
  const [isFactionSelectOpen, setIsFactionSelectOpen] = useState(false);
  const [isDifficultySelectOpen, setIsDifficultySelectOpen] = useState(false);

  const [history, setHistory] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const router = useRouter();
  const selectedServer = SERVERS.find((s) => s.id === serverId) || SERVERS[0];

  const FACTIONS = ["LSPD", "FIB", "GOV", "USSS", "SANG", "EMS", "Weazel News", "Судейство", "Адвокатура"];
  const DIFFICULTIES = [
    { id: "easy", name: "Легко" },
    { id: "medium", name: "Средне" },
    { id: "hard", name: "Сложно" }
  ];

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/exam/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [stage]); // Refresh history when stage changes too, just in case

  const createExam = async () => {
    setStage("loading");
    try {
      const res = await fetch("/api/exam/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverId, faction, difficulty, questionCount, showAnswersAtEnd }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка генерации");

      if (data.examId) {
         router.push(`/exam/dashboard/${data.examId}`);
      }
    } catch (e: any) {
      showToast(e.message, "error");
      setStage("setup");
    }
  };

  const todayStr = new Date().toLocaleDateString();
  const examsToday = history.filter((h: any) => new Date(h.createdAt).toLocaleDateString() === todayStr).length;
  const examsLeft = Math.max(0, 3 - examsToday);

  if (stage === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <div className="w-16 h-16 border-4 border-[var(--overlay-soft-strong)] border-t-[var(--color-coral-text)] rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-bold text-[var(--color-pure-white)] mb-2">ИИ составляет вопросы...</h2>
        <p className="text-[var(--color-ash)] text-sm animate-pulse">Ищет каверзные ситуации в законах {faction}</p>
      </div>
    );
  }

  if (stage === "history") {
    return (
      <div className="flex flex-col items-center justify-start min-h-[80vh] px-4 py-8 relative">
        <div className="w-full max-w-3xl">
           <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-bold text-[var(--color-pure-white)]">История экзаменов</h1>
              <button onClick={() => setStage("setup")} className="rc-btn-ghost px-5 text-sm">Создать новый</button>
           </div>

           <div className="grid gap-3">
              {history.length === 0 ? (
                <div className="rc-card-edge bg-[var(--color-ink)] text-center text-sm text-[var(--color-ash)]">У вас пока нет созданных экзаменов.</div>
              ) : (
                history.map((h: any) => (
                  <Link href={`/exam/dashboard/${h.id}`} key={h.id} className="rc-card-edge bg-[var(--color-ink)] flex items-center justify-between hover:border-[#4a4b4d] transition-colors group cursor-pointer">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-bold text-sm text-[var(--color-pure-white)]">{h.faction}</span>
                        <span className="rc-badge">{h.difficulty === 'easy' ? 'Легко' : h.difficulty === 'hard' ? 'Сложно' : 'Средне'}</span>
                      </div>
                      <div className="text-xs text-[var(--color-ash)] flex gap-3">
                        <span>Вопросов: {h.questionCount}</span>
                        <span>Прошло: {h._count?.results || 0} чел.</span>
                        <span>{new Date(h.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-[var(--color-ash)] group-hover:translate-x-2 group-hover:text-[var(--color-pure-white)] transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                ))
              )}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 z-10 relative py-10">
      <div className="rc-card-edge w-full max-w-md bg-[var(--color-ink)] relative overflow-visible !p-6">

        <div className="flex justify-between items-center mb-1.5">
          <h1 className="text-lg font-bold text-[var(--color-pure-white)] text-center flex-1">Создать Экзамен</h1>
        </div>
        <p className="text-[var(--color-ash)] text-xs text-center mb-6 leading-relaxed">ИИ сгенерирует уникальный тест по законам штата, которым вы сможете поделиться с кандидатами.</p>

        <div className="space-y-4">
          <div className="relative z-40">
            <label className="text-xs font-bold text-[var(--color-smoke)] uppercase tracking-wider block mb-1.5">Сервер</label>
            <button
              onClick={() => { setIsServerSelectOpen(!isServerSelectOpen); setIsFactionSelectOpen(false); setIsDifficultySelectOpen(false); }}
              className="w-full bg-[var(--overlay-soft)] hover:bg-[var(--overlay-soft-strong)] px-3.5 py-2.5 rounded-[var(--radius-lg)] border border-[var(--color-hairline)] text-[var(--color-pure-white)] text-sm flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="font-semibold truncate text-left">{selectedServer.projectName ? `${selectedServer.projectName} - ${selectedServer.name}` : selectedServer.name}</span>
              <svg className={`w-4 h-4 transition-transform flex-shrink-0 text-[var(--color-ash)] ${isServerSelectOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isServerSelectOpen && (
              <div className="rc-card-edge absolute top-full left-0 right-0 mt-2 !p-0 bg-[var(--color-ink)] overflow-hidden animate-fade-in max-h-60 overflow-y-auto z-50">
                {PROJECTS.map(p => (
                  <div key={p.id} className="border-b border-[var(--color-hairline)] last:border-0 pb-1">
                    <div className="px-3 py-1.5 mt-1 text-[10px] font-bold text-[var(--color-smoke)] uppercase tracking-wider">{p.name}</div>
                    {p.servers.length === 0 ? (
                      <div className="px-4 py-2 text-xs text-[var(--color-smoke)] italic">Скоро...</div>
                    ) : (
                      p.servers.map(s => (
                        <button
                          key={s.id}
                          onClick={() => { setServerId(s.id); setIsServerSelectOpen(false); }}
                          className={`w-full text-left px-3.5 py-1.5 text-sm hover:bg-[var(--overlay-soft-strong)] transition-colors cursor-pointer flex items-center gap-2 ${serverId === s.id ? 'bg-[var(--overlay-soft-strong)] text-[var(--color-pure-white)] font-bold' : 'text-[var(--color-ash)]'}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
                          {s.name}
                        </button>
                      ))
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative z-30">
            <label className="text-xs font-bold text-[var(--color-smoke)] uppercase tracking-wider block mb-1.5">Фракция</label>
            <button
              onClick={() => { setIsFactionSelectOpen(!isFactionSelectOpen); setIsServerSelectOpen(false); setIsDifficultySelectOpen(false); }}
              className="w-full bg-[var(--overlay-soft)] hover:bg-[var(--overlay-soft-strong)] px-3.5 py-2.5 rounded-[var(--radius-lg)] border border-[var(--color-hairline)] text-[var(--color-pure-white)] text-sm flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="font-semibold truncate text-left">{faction}</span>
              <svg className={`w-4 h-4 transition-transform flex-shrink-0 text-[var(--color-ash)] ${isFactionSelectOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isFactionSelectOpen && (
              <div className="rc-card-edge absolute top-full left-0 right-0 mt-2 bg-[var(--color-ink)] overflow-hidden animate-fade-in max-h-60 overflow-y-auto grid grid-cols-2 gap-1 !p-2 z-50">
                {FACTIONS.map(f => (
                  <button key={f} onClick={() => { setFaction(f); setIsFactionSelectOpen(false); }} className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-[var(--overlay-soft-strong)] ${faction === f ? 'bg-[var(--overlay-soft-strong)] text-[var(--color-pure-white)] font-bold' : 'text-[var(--color-ash)]'}`}>
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative z-20">
            <label className="text-xs font-bold text-[var(--color-smoke)] uppercase tracking-wider block mb-1.5">Сложность вопросов</label>
            <button
              onClick={() => { setIsDifficultySelectOpen(!isDifficultySelectOpen); setIsFactionSelectOpen(false); setIsServerSelectOpen(false); }}
              className="w-full bg-[var(--overlay-soft)] hover:bg-[var(--overlay-soft-strong)] px-3.5 py-2.5 rounded-[var(--radius-lg)] border border-[var(--color-hairline)] text-[var(--color-pure-white)] text-sm flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="font-semibold truncate text-left">{DIFFICULTIES.find(d => d.id === difficulty)?.name}</span>
              <svg className={`w-4 h-4 transition-transform flex-shrink-0 text-[var(--color-ash)] ${isDifficultySelectOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isDifficultySelectOpen && (
              <div className="rc-card-edge absolute top-full left-0 right-0 mt-2 !p-0 bg-[var(--color-ink)] overflow-hidden animate-fade-in z-50">
                {DIFFICULTIES.map(d => (
                  <button key={d.id} onClick={() => { setDifficulty(d.id); setIsDifficultySelectOpen(false); }} className={`w-full text-left px-3.5 py-2.5 text-sm transition-colors hover:bg-[var(--overlay-soft-strong)] ${difficulty === d.id ? 'bg-[var(--overlay-soft-strong)] text-[var(--color-pure-white)] font-bold' : 'text-[var(--color-ash)]'}`}>
                    {d.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-[var(--color-smoke)] uppercase tracking-wider block">Количество вопросов</label>
              <span className="text-[var(--color-pure-white)] font-bold bg-[var(--overlay-soft-strong)] px-2 py-0.5 rounded-md text-xs">{questionCount}</span>
            </div>
            <input
              type="range"
              min="5"
              max="20"
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              className="w-full accent-[var(--color-pure-white)] h-1.5 bg-[var(--overlay-soft-strong)] rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between bg-[var(--overlay-soft)] p-3.5 rounded-[var(--radius-lg)] border border-[var(--color-hairline)]">
            <div>
              <p className="text-sm font-bold text-[var(--color-pure-white)]">Показывать ответы кандидату</p>
              <p className="text-xs text-[var(--color-ash)] mt-1">Кандидат увидит свои ошибки в конце теста</p>
            </div>
            <button
              onClick={() => setShowAnswersAtEnd(!showAnswersAtEnd)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors border shrink-0"
              style={showAnswersAtEnd
                ? { background: "var(--color-coral-pulse)", borderColor: "var(--color-coral-pulse)" }
                : { background: "var(--overlay-soft-strong)", borderColor: "var(--color-hairline)" }}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showAnswersAtEnd ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="pt-1">
            {!isPremium && <p className="text-xs text-amber-500 mb-2 text-center">Вам доступно создание тестов сегодня: <strong>{examsLeft} из 3</strong></p>}
            <button
              onClick={createExam}
              disabled={!isPremium && examsLeft === 0}
              className={`rc-btn w-full flex items-center justify-center gap-2 text-sm ${(!isPremium && examsLeft === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ padding: "12px" }}
            >
              Сгенерировать тест
            </button>
          </div>

          <button
            onClick={() => setStage("history")}
            className="w-full text-center text-xs text-[var(--color-ash)] hover:text-[var(--color-pure-white)] transition-colors"
          >
            Посмотреть историю моих тестов
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-fade-in">
          <div
            className="rc-card-edge bg-[var(--color-ink)] p-4 flex items-center gap-3 shadow-2xl"
            style={{ borderColor: toast.type === "success" ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)" }}
          >
            {toast.type === "success" ? (
              <Sparkles className="w-5 h-5 text-green-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            )}
            <span className="text-sm font-semibold pr-4 text-[var(--color-pure-white)]">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-[var(--color-ash)] hover:text-[var(--color-pure-white)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

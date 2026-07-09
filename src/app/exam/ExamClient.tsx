"use client";

import { useState, useEffect } from "react";
import { SERVERS, PROJECTS } from "../api/assistant/serverLaws";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
        <div className="w-16 h-16 border-4 border-white/10 border-t-[var(--blurple)] rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-bold text-white mb-2">ИИ составляет вопросы...</h2>
        <p className="text-gray-400 text-sm animate-pulse">Ищет каверзные ситуации в законах {faction}</p>
      </div>
    );
  }

  if (stage === "history") {
    return (
      <div className="flex flex-col items-center justify-start min-h-[80vh] px-4 py-8 relative">
        <div className="w-full max-w-4xl">
           <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-white">История экзаменов</h1>
              <button onClick={() => setStage("setup")} className="btn-secondary px-6">Создать новый</button>
           </div>
           
           <div className="grid gap-4">
              {history.length === 0 ? (
                <div className="smart-card rounded-2xl p-8 text-center text-gray-400">У вас пока нет созданных экзаменов.</div>
              ) : (
                history.map((h: any) => (
                  <Link href={`/exam/dashboard/${h.id}`} key={h.id} className="smart-card rounded-2xl p-6 flex items-center justify-between hover:border-[var(--blurple)] transition-colors group cursor-pointer">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-lg text-white">{h.faction}</span>
                        <span className="text-xs bg-white/10 px-2 py-1 rounded-md text-gray-300">{h.difficulty === 'easy' ? 'Легко' : h.difficulty === 'hard' ? 'Сложно' : 'Средне'}</span>
                      </div>
                      <div className="text-sm text-gray-400 flex gap-4">
                        <span>Вопросов: {h.questionCount}</span>
                        <span>Прошло: {h._count?.results || 0} чел.</span>
                        <span>{new Date(h.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-[var(--blurple)] group-hover:translate-x-2 transition-transform">
                      ➔
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
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 z-10 relative py-12">
      <div className="w-full max-w-lg smart-card rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-visible">
        
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-white text-center flex-1">Создать Экзамен</h1>
        </div>
        <p className="text-gray-400 text-sm text-center mb-8">ИИ сгенерирует уникальный тест по законам штата, которым вы сможете поделиться с кандидатами.</p>

        <div className="space-y-6">
          <div className="relative z-40">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Сервер</label>
            <button 
              onClick={() => { setIsServerSelectOpen(!isServerSelectOpen); setIsFactionSelectOpen(false); setIsDifficultySelectOpen(false); }}
              className="w-full bg-white/5 hover:bg-white/10 px-4 py-3 rounded-xl border border-white/10 text-white flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="font-semibold truncate text-left">{selectedServer.projectName ? `${selectedServer.projectName} - ${selectedServer.name}` : selectedServer.name}</span>
              <svg className={`w-5 h-5 transition-transform flex-shrink-0 text-gray-400 ${isServerSelectOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isServerSelectOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 smart-dropdown border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-fade-in max-h-60 overflow-y-auto z-50">
                {PROJECTS.map(p => (
                  <div key={p.id} className="border-b border-white/5 last:border-0 pb-1">
                    <div className="px-3 py-1.5 mt-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">{p.name}</div>
                    {p.servers.length === 0 ? (
                      <div className="px-4 py-2 text-xs text-gray-600 italic">Скоро...</div>
                    ) : (
                      p.servers.map(s => (
                        <button
                          key={s.id}
                          onClick={() => { setServerId(s.id); setIsServerSelectOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2 ${serverId === s.id ? 'bg-[var(--blurple-alpha-20)] text-[var(--blurple)] font-bold' : 'text-gray-300'}`}
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
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Фракция</label>
            <button 
              onClick={() => { setIsFactionSelectOpen(!isFactionSelectOpen); setIsServerSelectOpen(false); setIsDifficultySelectOpen(false); }}
              className="w-full bg-white/5 hover:bg-white/10 px-4 py-3 rounded-xl border border-white/10 text-white flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="font-semibold truncate text-left">{faction}</span>
              <svg className={`w-5 h-5 transition-transform flex-shrink-0 text-gray-400 ${isFactionSelectOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isFactionSelectOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 smart-dropdown border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-fade-in max-h-60 overflow-y-auto grid grid-cols-2 gap-1 p-2 z-50">
                {FACTIONS.map(f => (
                  <button key={f} onClick={() => { setFaction(f); setIsFactionSelectOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/10 ${faction === f ? 'bg-[var(--blurple-alpha-20)] text-[var(--blurple)] font-bold' : 'text-gray-300'}`}>
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative z-20">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Сложность вопросов</label>
            <button 
              onClick={() => { setIsDifficultySelectOpen(!isDifficultySelectOpen); setIsFactionSelectOpen(false); setIsServerSelectOpen(false); }}
              className="w-full bg-white/5 hover:bg-white/10 px-4 py-3 rounded-xl border border-white/10 text-white flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="font-semibold truncate text-left">{DIFFICULTIES.find(d => d.id === difficulty)?.name}</span>
              <svg className={`w-5 h-5 transition-transform flex-shrink-0 text-gray-400 ${isDifficultySelectOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isDifficultySelectOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 smart-dropdown border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-fade-in z-50">
                {DIFFICULTIES.map(d => (
                  <button key={d.id} onClick={() => { setDifficulty(d.id); setIsDifficultySelectOpen(false); }} className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-white/10 ${difficulty === d.id ? 'bg-[var(--blurple-alpha-20)] text-[var(--blurple)] font-bold' : 'text-gray-300'}`}>
                    {d.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Количество вопросов</label>
              <span className="text-[var(--blurple)] font-bold bg-[var(--blurple-alpha-20)] px-2 py-0.5 rounded-md text-sm">{questionCount}</span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="20" 
              value={questionCount} 
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              className="w-full accent-[var(--blurple)] h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
            <div>
              <p className="text-sm font-bold text-white">Показывать ответы кандидату</p>
              <p className="text-xs text-gray-400 mt-1">Кандидат увидит свои ошибки в конце теста</p>
            </div>
            <button 
              onClick={() => setShowAnswersAtEnd(!showAnswersAtEnd)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors border ${showAnswersAtEnd ? 'bg-indigo-500 border-indigo-500' : 'bg-white/10 border-white/20'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showAnswersAtEnd ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="pt-2">
            {!isPremium && <p className="text-xs text-amber-500 mb-2 text-center">Вам доступно создание тестов сегодня: <strong>{examsLeft} из 3</strong></p>}
            <button 
              onClick={createExam}
              disabled={!isPremium && examsLeft === 0}
              className={`w-full btn-primary flex items-center justify-center gap-2 py-4 ${(!isPremium && examsLeft === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Сгенерировать тест
            </button>
          </div>
          
          <button 
            onClick={() => setStage("history")}
            className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors"
          >
            Посмотреть историю моих тестов
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-fade-in">
          <div className={`glass-card p-4 flex items-center gap-3 border shadow-2xl backdrop-blur-xl ${toast.type === "success" ? "border-green-500/30" : "border-red-500/30"}`}>
            <span className="text-xl">{toast.type === "success" ? "✨" : "⚠️"}</span>
            <span className="text-sm font-semibold pr-4 text-white">{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

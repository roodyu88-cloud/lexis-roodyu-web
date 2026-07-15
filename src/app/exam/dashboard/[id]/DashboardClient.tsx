"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Lock, ArrowLeft, ArrowRight, X, ChevronRight, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function DashboardClient({ examId }: { examId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchResults();
    // Обновляем результаты каждые 10 секунд
    const interval = setInterval(fetchResults, 10000);
    return () => clearInterval(interval);
  }, [examId]);

  const fetchResults = async () => {
    try {
      const res = await fetch(`/api/exam/session/${examId}/results`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Ошибка загрузки");
      } else {
        setData(json);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/exam/take/${examId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[80vh] text-[var(--color-pure-white)]">Загрузка...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <Lock className="w-10 h-10 mb-4 text-red-400" />
        <h2 className="text-xl font-bold text-[var(--color-pure-white)] mb-2">Ошибка доступа</h2>
        <p className="text-red-400">{error}</p>
        <Link href="/exam" className="mt-8 rc-btn-ghost">Вернуться к экзаменам</Link>
      </div>
    );
  }

  const { exam, results } = data;
  const examLink = typeof window !== 'undefined' ? `${window.location.origin}/exam/take/${examId}` : '';

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 min-h-[80vh]">
      <div className="flex justify-between items-end mb-8">
        <div>
          <Link href="/exam" className="text-[var(--color-pure-white)] hover:underline text-sm font-bold mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Назад к созданию
          </Link>
          <h1 className="text-3xl font-bold text-[var(--color-pure-white)] mb-2">
            Экзамен {exam.faction} <span className="text-[var(--color-smoke)] text-lg">({exam.difficulty === 'easy' ? 'Легко' : exam.difficulty === 'hard' ? 'Сложно' : 'Средне'})</span>
          </h1>
          <p className="text-[var(--color-ash)]">Создан: {new Date(exam.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="rc-card-edge bg-[var(--color-ink)] mb-8">
        <h3 className="text-sm font-bold text-[var(--color-ash)] uppercase tracking-wider mb-4">Ссылка для кандидатов</h3>
        <div className="flex gap-4">
          <input
            type="text"
            readOnly
            value={examLink}
            className="flex-1 rounded-lg px-4 py-3 text-[var(--color-pure-white)] outline-none border border-[var(--color-hairline)]"
            style={{ background: "var(--color-obsidian)" }}
          />
          <button
            onClick={copyLink}
            className={`px-8 py-3 rounded-lg font-bold transition-all shadow-lg ${copied ? 'bg-green-500 text-white' : 'hover:opacity-90'}`}
            style={copied ? undefined : { background: "var(--color-mist)", color: "var(--color-iron)" }}
          >
            {copied ? 'Скопировано!' : 'Копировать'}
          </button>
        </div>
        <p className="text-xs text-[var(--color-smoke)] mt-3">
          Отправьте эту ссылку кандидатам. Как только они пройдут тест, результаты появятся ниже в реальном времени.
        </p>
      </div>

      <h2 className="text-2xl font-bold text-[var(--color-pure-white)] mb-6">Результаты кандидатов ({results.length})</h2>

      {results.length === 0 ? (
        <div className="rc-card-edge bg-[var(--color-ink)] border-dashed p-12 text-center text-[var(--color-ash)]">
          <Clock className="w-10 h-10 mb-4 mx-auto text-[var(--color-smoke)]" />
          <p>Пока никто не прошел этот тест.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {results.map((r: any) => {
            const percentage = (r.score / r.totalQuestions) * 100;
            const passed = percentage >= 70;

            return (
              <div key={r.id} onClick={() => setSelectedCandidate(r)} className="rc-card-edge bg-[var(--color-ink)] flex items-center justify-between cursor-pointer hover:border-[#4a4b4d] transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--overlay-soft-strong)] rounded-full overflow-hidden flex-shrink-0">
                    {r.candidateAvatar ? (
                      <img src={r.candidateAvatar} alt={r.candidateName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg font-bold text-[var(--color-pure-white)]">
                        {r.candidateName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[var(--color-pure-white)]">{r.candidateName}</h3>
                    <p className="text-sm text-[var(--color-ash)]">{new Date(r.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-2xl font-black text-[var(--color-pure-white)] font-data">{r.score} <span className="text-[var(--color-smoke)] text-lg">/ {r.totalQuestions}</span></div>
                    <div className={`text-sm font-bold ${passed ? 'text-green-400' : 'text-red-400'}`}>
                      {passed ? 'СДАЛ' : 'ПРОВАЛИЛ'}
                    </div>
                  </div>
                  <div className="text-[var(--color-smoke)] group-hover:translate-x-2 group-hover:text-[var(--color-pure-white)] transition-all"><ArrowRight className="w-5 h-5" /></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedCandidate(null)}>
          <div className="rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[var(--color-hairline)]" style={{ background: "var(--color-ink)" }} onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 border-b border-[var(--color-hairline)] p-6 flex justify-between items-center z-10" style={{ background: "var(--color-ink)" }}>
              <div>
                <h3 className="text-xl font-bold text-[var(--color-pure-white)]">Ответы: {selectedCandidate.candidateName}</h3>
                <p className="text-sm text-[var(--color-ash)]">Балл: <span className="font-data">{selectedCandidate.score} / {selectedCandidate.totalQuestions}</span></p>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="w-10 h-10 bg-[var(--overlay-soft)] hover:bg-[var(--overlay-soft-strong)] rounded-full flex items-center justify-center text-[var(--color-pure-white)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {selectedCandidate.answersData.map((ans: any, idx: number) => (
                <div key={idx} className={`p-4 rounded-xl border ${ans.isCorrect ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                  <p className="font-bold text-[var(--color-pure-white)] mb-3">Вопрос {idx + 1}. {ans.question}</p>

                  {ans.options ? (
                    <div className="space-y-2 mt-4 text-sm">
                      {ans.options.map((opt: string, optIdx: number) => {
                        let styling = "text-[var(--color-ash)]";
                        if (optIdx === ans.correctAnswerIndex) styling = "text-green-400 font-bold";
                        else if (optIdx === ans.chosenIndex && !ans.isCorrect) styling = "text-red-400 font-bold line-through";

                        return (
                          <div key={optIdx} className={`flex items-start gap-2 ${styling}`}>
                            <span className="w-4 flex-shrink-0">{optIdx === ans.chosenIndex ? <ChevronRight className="w-4 h-4" /> : null}</span>
                            <span>{opt}</span>
                          </div>
                        );
                      })}

                      {ans.explanation && (
                        <div className="mt-4 pt-4 border-t border-[var(--color-hairline)] text-[var(--color-ash)]">
                          <span className="font-bold text-[var(--color-pure-white)]">Пояснение:</span> {ans.explanation}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4">
                      <p className="text-[var(--color-ash)] text-sm mb-1">Выбранный вариант (Индекс): {ans.chosenIndex}</p>
                      <p className={`text-sm font-bold flex items-center gap-1.5 ${ans.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {ans.isCorrect ? <><CheckCircle2 className="w-4 h-4" /> Правильно</> : <><XCircle className="w-4 h-4" /> Неправильно</>}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

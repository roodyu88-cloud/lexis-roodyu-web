"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
    return <div className="flex items-center justify-center min-h-[80vh] text-white">Загрузка...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-white mb-2">Ошибка доступа</h2>
        <p className="text-red-400">{error}</p>
        <Link href="/exam" className="mt-8 btn-secondary">Вернуться к экзаменам</Link>
      </div>
    );
  }

  const { exam, results } = data;
  const examLink = typeof window !== 'undefined' ? `${window.location.origin}/exam/take/${examId}` : '';

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 min-h-[80vh]">
      <div className="flex justify-between items-end mb-8">
        <div>
          <Link href="/exam" className="text-[var(--blurple)] hover:underline text-sm font-bold mb-4 inline-block flex items-center gap-2">
            ← Назад к созданию
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">
            Экзамен {exam.faction} <span className="text-gray-500 text-lg">({exam.difficulty === 'easy' ? 'Легко' : exam.difficulty === 'hard' ? 'Сложно' : 'Средне'})</span>
          </h1>
          <p className="text-gray-400">Создан: {new Date(exam.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="glass-card border border-white/10 rounded-2xl p-6 md:p-8 mb-8 shadow-2xl">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Ссылка для кандидатов</h3>
        <div className="flex gap-4">
          <input 
            type="text" 
            readOnly 
            value={examLink}
            className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none"
          />
          <button 
            onClick={copyLink}
            className={`px-8 py-3 rounded-2xl font-bold transition-all shadow-lg text-white ${copied ? 'bg-green-500' : 'bg-[#5865F2] hover:bg-[#4752C4]'}`}
          >
            {copied ? 'Скопировано!' : 'Копировать'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Отправьте эту ссылку кандидатам. Как только они пройдут тест, результаты появятся ниже в реальном времени.
        </p>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">Результаты кандидатов ({results.length})</h2>
      
      {results.length === 0 ? (
        <div className="glass-card border border-dashed border-white/20 p-12 text-center text-gray-400 rounded-3xl">
          <div className="text-4xl mb-4">⏳</div>
          <p>Пока никто не прошел этот тест.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {results.map((r: any) => {
            const percentage = (r.score / r.totalQuestions) * 100;
            const passed = percentage >= 70;

            return (
              <div key={r.id} onClick={() => setSelectedCandidate(r)} className="glass-card border border-white/10 p-6 rounded-2xl flex items-center justify-between cursor-pointer hover:border-[var(--blurple)] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full overflow-hidden flex-shrink-0">
                    {r.candidateAvatar ? (
                      <img src={r.candidateAvatar} alt={r.candidateName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white">
                        {r.candidateName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">{r.candidateName}</h3>
                    <p className="text-sm text-gray-400">{new Date(r.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-2xl font-black text-white">{r.score} <span className="text-gray-500 text-lg">/ {r.totalQuestions}</span></div>
                    <div className={`text-sm font-bold ${passed ? 'text-green-400' : 'text-red-400'}`}>
                      {passed ? 'СДАЛ' : 'ПРОВАЛИЛ'}
                    </div>
                  </div>
                  <div className="text-gray-500">➔</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedCandidate(null)}>
          <div className="bg-[#141517] border border-white/10 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-[#141517] border-b border-white/10 p-6 flex justify-between items-center z-10">
              <div>
                <h3 className="text-xl font-bold text-white">Ответы: {selectedCandidate.candidateName}</h3>
                <p className="text-sm text-gray-400">Балл: {selectedCandidate.score} / {selectedCandidate.totalQuestions}</p>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white">
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {selectedCandidate.answersData.map((ans: any, idx: number) => (
                <div key={idx} className={`p-4 rounded-xl border ${ans.isCorrect ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                  <p className="font-bold text-white mb-3">Вопрос {idx + 1}. {ans.question}</p>
                  
                  {ans.options ? (
                    <div className="space-y-2 mt-4 text-sm">
                      {ans.options.map((opt: string, optIdx: number) => {
                        let styling = "text-gray-400";
                        if (optIdx === ans.correctAnswerIndex) styling = "text-green-400 font-bold";
                        else if (optIdx === ans.chosenIndex && !ans.isCorrect) styling = "text-red-400 font-bold line-through";
                        
                        return (
                          <div key={optIdx} className={`flex items-start gap-2 ${styling}`}>
                            <span>{optIdx === ans.chosenIndex ? "👉" : "  "}</span>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                      
                      {ans.explanation && (
                        <div className="mt-4 pt-4 border-t border-white/10 text-gray-300">
                          <span className="font-bold">Пояснение:</span> {ans.explanation}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4">
                      <p className="text-gray-400 text-sm mb-1">Выбранный вариант (Индекс): {ans.chosenIndex}</p>
                      <p className={`text-sm font-bold ${ans.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {ans.isCorrect ? '✅ Правильно' : '❌ Неправильно'}
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

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Ban, FileText, ChevronRight, Sparkles, AlertTriangle, X } from "lucide-react";

export default function TakeExamClient({ examId, user }: { examId: string, user: any }) {
  const [stage, setStage] = useState<"intro" | "playing" | "submitting" | "results">("intro");
  const [examData, setExamData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [results, setResults] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchExam();
  }, [examId]);

  const fetchExam = async () => {
    try {
      const res = await fetch(`/api/exam/session/${examId}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Экзамен не найден");
      } else {
        setExamData(json);
        setAnswers(new Array(json.questions.length).fill(-1));
      }
    } catch (e: any) {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (answers[currentQuestionIndex] === -1) {
      showToast("Пожалуйста, выберите один из вариантов ответа.", "error");
      return;
    }

    if (currentQuestionIndex < examData.questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
    } else {
      submitExam();
    }
  };

  const submitExam = async () => {
    setStage("submitting");
    try {
      const res = await fetch(`/api/exam/session/${examId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers })
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Ошибка отправки");
        setStage("intro");
      } else {
        setResults(json);
        setStage("results");
      }
    } catch (e: any) {
      setError("Ошибка сети при отправке");
      setStage("intro");
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[80vh] text-[var(--color-pure-white)]">Загрузка...</div>;
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <Ban className="w-10 h-10 mb-4 text-red-400" />
      <h2 className="text-heading-sm font-bold text-[var(--color-pure-white)] mb-4">Ошибка</h2>
      <p className="text-red-400 mb-8">{error}</p>
      <Link href="/" className="rc-btn-ghost">На главную</Link>
    </div>
  );

  if (stage === "intro") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="rc-card-edge w-full max-w-lg bg-[var(--color-ink)] text-center relative">
          <div className="rc-icon-container w-20 h-20 mb-6 mx-auto" style={{ boxShadow: "var(--shadow-key)" }}>
            <FileText className="w-9 h-9 text-[var(--color-coral-text)]" />
          </div>
          <h1 className="text-heading-sm font-bold text-[var(--color-pure-white)] mb-2">Экзамен {examData.faction}</h1>
          <p className="text-[var(--color-ash)] mb-6">Сложность: {examData.difficulty === 'easy' ? 'Легко' : examData.difficulty === 'hard' ? 'Сложно' : 'Средне'}</p>

          <div className="rounded-xl border border-[var(--color-hairline)] p-4 mb-8 text-left" style={{ background: "var(--color-obsidian)" }}>
            <ul className="text-sm text-[var(--color-ash)] space-y-2">
              <li>• Вопросов: <strong className="text-[var(--color-pure-white)]">{examData.questionCount}</strong></li>
              <li>• Кандидат: <strong className="text-[var(--color-pure-white)]">{user.name}</strong></li>
              <li>• Назад вернуться нельзя, результаты будут отправлены экзаменатору сразу после завершения.</li>
            </ul>
          </div>

          <button onClick={() => setStage("playing")} className="rc-btn w-full" style={{ padding: "16px" }}>Начать экзамен</button>
        </div>
      </div>
    );
  }

  if (stage === "submitting") {
    return <div className="flex justify-center items-center min-h-[80vh] text-[var(--color-pure-white)] animate-pulse">Отправка результатов...</div>;
  }

  if (stage === "results") {
    const percentage = (results.score / results.total) * 100;
    const passed = percentage >= 70;

    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-12">
        <div className="rc-card-edge w-full max-w-2xl bg-[var(--color-ink)] text-center">
          <h2 className="text-heading-sm font-bold text-[var(--color-pure-white)] mb-2">Экзамен завершен</h2>

          <div className="my-10">
            <div className={`text-6xl font-black mb-2 font-data ${passed ? 'text-green-400' : 'text-red-400'}`}>
              {results.score} / {results.total}
            </div>
            <p className="text-[var(--color-ash)] font-bold tracking-widest uppercase">{passed ? 'СДАНО' : 'НЕ СДАНО'}</p>
          </div>

          {!results.showAnswersAtEnd && (
            <div className="p-4 bg-[var(--overlay-soft)] rounded-xl border border-[var(--color-hairline)] text-[var(--color-ash)] mb-8">
              Экзаменатор скрыл показ правильных ответов. Вы можете узнать подробности у него напрямую.
            </div>
          )}

          {results.showAnswersAtEnd && results.detailedResults && (
            <div className="text-left space-y-6 mt-8">
              <h3 className="text-xl font-bold text-[var(--color-pure-white)] mb-4 border-b border-[var(--color-hairline)] pb-2">Разбор ошибок</h3>
              {results.detailedResults.map((dr: any, idx: number) => (
                <div key={idx} className={`p-4 rounded-xl border ${dr.isCorrect ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                  <p className="font-bold text-[var(--color-pure-white)] mb-3">{idx + 1}. {dr.question}</p>

                  <div className="space-y-2 mt-4 text-sm">
                    {dr.options.map((opt: string, optIdx: number) => {
                      let styling = "text-[var(--color-ash)]";
                      if (optIdx === dr.correctAnswerIndex) styling = "text-green-400 font-bold";
                      else if (optIdx === dr.chosenIndex && !dr.isCorrect) styling = "text-red-400 font-bold line-through";

                      return (
                        <div key={optIdx} className={`flex items-start gap-2 ${styling}`}>
                          <span className="w-4 flex-shrink-0">{optIdx === dr.chosenIndex ? <ChevronRight className="w-4 h-4" /> : null}</span>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {dr.explanation && (
                    <div className="mt-4 pt-4 border-t border-[var(--color-hairline)] text-[var(--color-ash)] text-sm">
                      <span className="font-bold text-[var(--color-pure-white)]">Пояснение:</span> {dr.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <Link href="/" className="rc-btn-ghost w-full mt-8 block">Вернуться на главную</Link>
        </div>
      </div>
    );
  }

  const currentQ = examData.questions[currentQuestionIndex];
  const selectedOption = answers[currentQuestionIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8 relative">
      <div className="rc-card-edge w-full max-w-2xl bg-[var(--color-ink)] relative z-10">

        {/* Progress Bar */}
        <div className="flex items-center gap-4 mb-8">
           <div className="flex-1 h-2 rounded-full overflow-hidden border border-[var(--color-hairline)]" style={{ background: "var(--color-obsidian)" }}>
             <div
               className="h-full bg-[var(--color-pure-white)] transition-all duration-300"
               style={{ width: `${((currentQuestionIndex + 1) / examData.questions.length) * 100}%` }}
             ></div>
           </div>
           <span className="text-sm font-bold text-[var(--color-smoke)] whitespace-nowrap font-data">
             Вопрос {currentQuestionIndex + 1} из {examData.questions.length}
           </span>
        </div>

        <h2 className="text-subheading md:text-heading-sm font-bold text-[var(--color-pure-white)] mb-8 leading-relaxed">
          {currentQ.question}
        </h2>

        <div className="space-y-3 mb-8">
          {currentQ.options.map((opt: string, idx: number) => {
            const isSelected = idx === selectedOption;

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium ${isSelected ? 'bg-[var(--overlay-soft-strong)] border-[var(--color-pure-white)] text-[var(--color-pure-white)]' : 'bg-[var(--overlay-soft)] hover:bg-[var(--overlay-soft-strong)] border-[var(--color-hairline)] text-[var(--color-ash)]'}`}
              >
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-[var(--color-hairline)]">
          <p className="text-xs text-[var(--color-smoke)]">Нажмите далее, когда будете уверены</p>
          <button
            onClick={handleNext}
            disabled={selectedOption === -1}
            className={`rc-btn font-bold ${selectedOption === -1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ padding: "12px 32px" }}
          >
            {currentQuestionIndex < examData.questions.length - 1 ? "Следующий вопрос" : "Завершить экзамен"}
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

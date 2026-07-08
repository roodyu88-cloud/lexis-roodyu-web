"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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

  if (loading) return <div className="flex justify-center items-center min-h-[80vh] text-white">Загрузка...</div>;
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="text-4xl mb-4">⛔</div>
      <h2 className="text-2xl font-bold text-white mb-4">Ошибка</h2>
      <p className="text-red-400 mb-8">{error}</p>
      <Link href="/" className="btn-secondary">На главную</Link>
    </div>
  );

  if (stage === "intro") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-lg glass-card rounded-3xl p-8 border border-white/10 shadow-2xl text-center">
          <div className="w-20 h-20 bg-[var(--blurple-alpha-20)] text-[var(--blurple)] rounded-full flex items-center justify-center text-4xl mb-6 mx-auto shadow-[0_0_40px_rgba(var(--blurple-rgb),0.2)]">
            📝
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Экзамен {examData.faction}</h1>
          <p className="text-gray-400 mb-6">Сложность: {examData.difficulty === 'easy' ? 'Легко' : examData.difficulty === 'hard' ? 'Сложно' : 'Средне'}</p>
          
          <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-8 text-left">
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• Вопросов: <strong>{examData.questionCount}</strong></li>
              <li>• Кандидат: <strong>{user.name}</strong></li>
              <li>• Назад вернуться нельзя, результаты будут отправлены экзаменатору сразу после завершения.</li>
            </ul>
          </div>

          <button onClick={() => setStage("playing")} className="w-full btn-primary py-4">Начать экзамен</button>
        </div>
      </div>
    );
  }

  if (stage === "submitting") {
    return <div className="flex justify-center items-center min-h-[80vh] text-white animate-pulse">Отправка результатов...</div>;
  }

  if (stage === "results") {
    const percentage = (results.score / results.total) * 100;
    const passed = percentage >= 70;

    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-12">
        <div className="w-full max-w-2xl glass-card rounded-3xl p-8 border border-white/10 shadow-2xl text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Экзамен завершен</h2>
          
          <div className="my-10">
            <div className={`text-6xl font-black mb-2 ${passed ? 'text-green-400' : 'text-red-400'}`}>
              {results.score} / {results.total}
            </div>
            <p className="text-gray-400 font-bold tracking-widest uppercase">{passed ? 'СДАНО' : 'НЕ СДАНО'}</p>
          </div>

          {!results.showAnswersAtEnd && (
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-gray-300 mb-8">
              Экзаменатор скрыл показ правильных ответов. Вы можете узнать подробности у него напрямую.
            </div>
          )}

          {results.showAnswersAtEnd && results.detailedResults && (
            <div className="text-left space-y-6 mt-8">
              <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Разбор ошибок</h3>
              {results.detailedResults.map((dr: any, idx: number) => (
                <div key={idx} className={`p-4 rounded-xl border ${dr.isCorrect ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                  <p className="font-bold text-white mb-3">{idx + 1}. {dr.question}</p>
                  
                  <div className="space-y-2 mt-4 text-sm">
                    {dr.options.map((opt: string, optIdx: number) => {
                      let styling = "text-gray-400";
                      if (optIdx === dr.correctAnswerIndex) styling = "text-green-400 font-bold";
                      else if (optIdx === dr.chosenIndex && !dr.isCorrect) styling = "text-red-400 font-bold line-through";
                      
                      return (
                        <div key={optIdx} className={`flex items-start gap-2 ${styling}`}>
                          <span>{optIdx === dr.chosenIndex ? "👉" : "  "}</span>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {dr.explanation && (
                    <div className="mt-4 pt-4 border-t border-white/10 text-gray-300 text-sm">
                      <span className="font-bold">Пояснение:</span> {dr.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <Link href="/" className="btn-secondary w-full mt-8 block">Вернуться на главную</Link>
        </div>
      </div>
    );
  }

  const currentQ = examData.questions[currentQuestionIndex];
  const selectedOption = answers[currentQuestionIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8 relative">
      <div className="w-full max-w-2xl glass-card rounded-3xl p-6 md:p-10 border border-white/10 shadow-2xl relative z-10">
        
        {/* Progress Bar */}
        <div className="flex items-center gap-4 mb-8">
           <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
             <div 
               className="h-full bg-[var(--blurple)] transition-all duration-300" 
               style={{ width: `${((currentQuestionIndex + 1) / examData.questions.length) * 100}%` }}
             ></div>
           </div>
           <span className="text-sm font-bold text-gray-500 whitespace-nowrap">
             Вопрос {currentQuestionIndex + 1} из {examData.questions.length}
           </span>
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-white mb-8 leading-relaxed">
          {currentQ.question}
        </h2>

        <div className="space-y-3 mb-8">
          {currentQ.options.map((opt: string, idx: number) => {
            const isSelected = idx === selectedOption;
            
            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium ${isSelected ? 'bg-[var(--blurple-alpha-20)] border-[var(--blurple)] text-white shadow-[0_0_15px_rgba(var(--blurple-rgb),0.3)]' : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-200'}`}
              >
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-white/10">
          <p className="text-xs text-gray-500">Нажмите далее, когда будете уверены</p>
          <button 
            onClick={handleNext}
            disabled={selectedOption === -1}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${selectedOption === -1 ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'btn-primary'}`}
          >
            {currentQuestionIndex < examData.questions.length - 1 ? "Следующий вопрос" : "Завершить экзамен"}
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

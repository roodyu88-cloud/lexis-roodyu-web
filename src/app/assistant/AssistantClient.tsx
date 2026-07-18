"use client";

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, Scale, Briefcase, Siren, Crown, Lock, Package, BookOpen, Clock } from 'lucide-react';
import { SERVERS, PROJECTS } from "@/lib/serverLaws";

type Message = {
  role: 'user' | 'model';
  content: string;
};

type ChatSession = {
  id: string;
  title: string;
  updatedAt: number;
  messages: Message[];
  serverId: string;
  mode: 'normal' | 'detailed' | 'judge' | 'lawyer' | 'prosecutor' | 'admin_judge';
};

export default function AssistantClient({ isAuthenticated = false, isPremium = false, isAdmin = false }: { isAuthenticated?: boolean, isPremium?: boolean, isAdmin?: boolean }) {
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [serverId, setServerId] = useState(SERVERS[0].id);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [mode, setMode] = useState<'normal' | 'detailed' | 'judge' | 'lawyer' | 'prosecutor' | 'admin_judge'>('normal');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Modal State
  const [quoteModal, setQuoteModal] = useState<{ isOpen: boolean; title: string; text: string }>({ isOpen: false, title: '', text: '' });
  const [premiumModal, setPremiumModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
  const [limitResetTimeMs, setLimitResetTimeMs] = useState<number | null>(null);
  const [timeLeftStr, setTimeLeftStr] = useState<string>("");

  useEffect(() => {
    if (!limitResetTimeMs) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = limitResetTimeMs - now;
      if (diff <= 0) {
        setLimitResetTimeMs(null);
        setTimeLeftStr("");
        clearInterval(interval);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeftStr(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [limitResetTimeMs]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lexis_chat_history');
    if (saved) {
      try {
        setChatHistory(JSON.parse(saved));
      } catch (e) { }
    }
  }, []);

  const saveHistory = (newHistory: ChatSession[]) => {
    setChatHistory(newHistory);
    localStorage.setItem('lexis_chat_history', JSON.stringify(newHistory));
  };

  const selectedServer = SERVERS.find(s => s.id === serverId) || SERVERS[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const createNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setInput("");
  };

  const loadChat = (chat: ChatSession) => {
    setCurrentChatId(chat.id);
    setMessages(chat.messages);
    setServerId(chat.serverId || SERVERS[0].id);
    setMode(chat.mode || 'normal');
  };

  const deleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newHistory = chatHistory.filter(c => c.id !== id);
    saveHistory(newHistory);
    if (currentChatId === id) {
      createNewChat();
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const newMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(newMessages);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsLoading(true);

    let chatId = currentChatId;
    let history = [...chatHistory];

    if (!chatId) {
      chatId = Date.now().toString();
      setCurrentChatId(chatId);
      const newSession: ChatSession = {
        id: chatId,
        title: text.length > 30 ? text.substring(0, 30) + '...' : text,
        updatedAt: Date.now(),
        messages: newMessages,
        serverId,
        mode
      };
      history = [newSession, ...history];
      saveHistory(history);
    } else {
      history = history.map(c =>
        c.id === chatId ? { ...c, messages: newMessages, updatedAt: Date.now() } : c
      );
      saveHistory(history);
    }

    if (!isAuthenticated) {
      // Demo mode: simulate response
      setTimeout(() => {
        const normalizedQuery = text.trim().toLowerCase();
        let answer = "";

        if (normalizedQuery.includes("суд")) {
          answer = `Судебная система штата состоит из Окружного, Апелляционного и Верховного судов.

**Основные этапы работы суда:**
1. **Подача иска:** Истец подает исковое заявление через официальный веб-портал.
2. **Назначение судебного заседания:** Судья рассматривает иск и назначает дату слушания ({ЦИТАТА:Статья 3.2 | Судебный кодекс|Судья единолично принимает решение о принятии иска к производству...}).
3. **Судебное следствие:** Стороны обвинения и защиты представляют доказательства, допрашивают свидетелей и проводят прения.
4. **Вынесение приговора:** Судья выносит окончательное решение по делу.`;
        } else if (normalizedQuery.includes("прокуратур")) {
          answer = `Прокуратура — это единая централизованная система органов, осуществляющая надзор за соблюдением законов.

**Ключевые обязанности прокуратуры:**
- Проведение прокурорских проверок в государственных ведомствах.
- Поддержание государственного обвинения в суде.
- Рассмотрение жалоб и обращений граждан на неправомерные действия сотрудников гос. структур ({ЦИТАТА:Статья 2.1 | Закон о Прокуратуре|Прокурор при исполнении своих обязанностей вправе требовать от должностных лиц предоставления необходимых документов...}).`;
        } else if (normalizedQuery.includes("убийств") || normalizedQuery.includes("защит")) {
          answer = `Защита обвиняемого по уголовному делу строится на поиске процессуальных нарушений со стороны следствия и смягчающих обстоятельств.

**Основные шаги защитника:**
1. **Анализ протокола задержания:** Проверьте соблюдение прав задержанного ({ЦИТАТА:Статья 5.1 | Процессуальный кодекс|Каждому задержанному должна быть зачитана его хабеас корпус (правило Миранды)...}). Если правило Миранды не зачитали, дело может быть прекращено.
2. **Поиск алиби:** Предоставьте записи с видеокамер, показания свидетелей.
3. **Оспаривание улик:** Если улики получены без ордера, требуйте признания их недопустимыми.`;
        } else if (normalizedQuery.includes("губернатор") || normalizedQuery.includes("импичмент")) {
          answer = `Снятие Губернатора с должности осуществляется исключительно по процедуре **импичмента**.

**Процедура импичмента:**
1. **Инициирование:** Решение палаты представителей или петиция верховного судьи при совершении губернатором тяжкого преступления ({ЦИТАТА:Статья 10.4 | Конституция|Губернатор может быть отрешен от должности в порядке импичмента при наличии доказанной вины в совершении государственной измены...}).
2. **Рассмотрение:** Дело передается в Верховный суд для подтверждения законности обвинений.`;
        } else {
          answer = `🔒 **Доступ к ИИ-ассистенту ограничен**

Вы находитесь в демонстрационном режиме ассистента. Чтобы свободно общаться с ИИ и задавать любые вопросы по законодательству, пожалуйста, авторизуйтесь на сайте через Discord.`;
        }

        const finalMsg: Message = { role: 'model', content: answer };
        const finalMessages = [...newMessages, finalMsg];
        setMessages(finalMessages);
        saveHistory(history.map(c => c.id === chatId ? { ...c, messages: finalMessages, updatedAt: Date.now() } : c));
        setIsLoading(false);
      }, 1000);
      return;
    }

    let attempts = 0;
    const maxAttempts = 3;
    let success = false;
    let lastError = "";
    let hitLimit = false;

    while (attempts < maxAttempts && !success) {
      try {
        const res = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: newMessages, serverId, mode })
        });

        const data = await res.json();

        if (res.ok) {
          success = true;
          const finalMsg: Message = { role: 'model', content: data.response };
          const finalMessages = [...newMessages, finalMsg];
          setMessages(finalMessages);
          saveHistory(history.map(c => c.id === chatId ? { ...c, messages: finalMessages, updatedAt: Date.now() } : c));
        } else {
          lastError = data.error === 'LIMIT_REACHED' ? data.message : (data.error || "Неизвестная ошибка");

          if (res.status === 403 && data.error === 'LIMIT_REACHED') {
            setLimitResetTimeMs(data.resetTimeMs || Date.now() + 60 * 60 * 1000);
            hitLimit = true;
            success = false;
            break; // Stop retrying immediately
          }

          attempts++;
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1500)); // wait before retry
          }
        }
      } catch (e) {
        lastError = "Не удалось связаться с сервером.";
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
    }

    if (!success && !hitLimit) {
      const finalMsg: Message = { role: 'model', content: `**Ошибка:** ${lastError} (попыток: ${maxAttempts})` };
      setMessages([...newMessages, finalMsg]);
    }

    setIsLoading(false);
  };

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(quoteModal.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderSidebarContent = () => (
    <>
      {/* Server Selector */}
      <div className="relative">
        <label className="text-[10px] font-bold text-[var(--color-smoke)] uppercase tracking-wider block mb-1.5">Сервер законов</label>
        <button
          onClick={() => setIsSelectOpen(!isSelectOpen)}
          className="w-full bg-[var(--overlay-soft)] hover:bg-[var(--overlay-soft-strong)] px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] text-sm text-[var(--color-pure-white)] flex items-center justify-between transition-colors cursor-pointer"
        >
          <span className="font-semibold truncate text-left">{selectedServer.projectName ? `${selectedServer.projectName} - ${selectedServer.name}` : selectedServer.name}</span>
          <svg className={`w-4 h-4 transition-transform flex-shrink-0 ${isSelectOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>

        {isSelectOpen && (
          <div className="rc-card-edge absolute top-full left-0 right-0 mt-2 !p-0 bg-[var(--color-ink)] overflow-hidden z-35 max-h-64 overflow-y-auto">
            {PROJECTS.map(p => (
              <div key={p.id} className="border-b border-[var(--color-hairline)] last:border-0 pb-1">
                <div className="px-3 py-1.5 mt-1 text-[10px] font-bold text-[var(--color-smoke)] uppercase tracking-wider">{p.name}</div>
                {p.servers.length === 0 ? (
                  <div className="px-4 py-2 text-xs text-[var(--color-smoke)] italic">Скоро...</div>
                ) : (
                  p.servers.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setServerId(s.id); setIsSelectOpen(false); setIsMobileSidebarOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-[var(--overlay-soft-strong)] transition-colors cursor-pointer flex items-center gap-2 ${serverId === s.id ? 'text-[var(--color-pure-white)] bg-[var(--overlay-soft)] font-semibold' : 'text-[var(--color-ash)]'}`}
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

      {/* Role Selector */}
      {isAuthenticated && (
        <div className="relative mt-3">
          <label className="text-[10px] font-bold text-[var(--color-smoke)] uppercase tracking-wider block mb-1.5 flex justify-between">
            <span>Роль ИИ</span>
            {isPremium && <span className="text-amber-500">Premium</span>}
          </label>
          <button
            onClick={() => setIsRoleOpen(!isRoleOpen)}
            className="w-full bg-[var(--overlay-soft)] hover:bg-[var(--overlay-soft-strong)] px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] text-sm text-[var(--color-pure-white)] flex items-center justify-between transition-colors cursor-pointer"
          >
            <span className="font-semibold truncate text-left flex items-center gap-2">
              {(mode === 'normal' || mode === 'detailed') && (<><Bot className="w-4 h-4 flex-shrink-0" /> Обычный ИИ</>)}
              {mode === 'judge' && (<><Scale className="w-4 h-4 flex-shrink-0" /> Судья</>)}
              {mode === 'lawyer' && (<><Briefcase className="w-4 h-4 flex-shrink-0" /> Адвокат</>)}
              {mode === 'prosecutor' && (<><Siren className="w-4 h-4 flex-shrink-0" /> Прокурор</>)}
              {mode === 'admin_judge' && (<><Crown className="w-4 h-4 flex-shrink-0" /> Суд Админ</>)}
            </span>
            <svg className={`w-4 h-4 transition-transform flex-shrink-0 ${isRoleOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>

          {isRoleOpen && (
            <div className="rc-card-edge absolute top-full left-0 right-0 mt-2 !p-0 bg-[var(--color-ink)] overflow-hidden z-35">
              <button
                onClick={() => { setMode('normal'); setIsRoleOpen(false); }}
                className={`w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--overlay-soft-strong)] transition-colors cursor-pointer ${mode === 'normal' || mode === 'detailed' ? 'text-[var(--color-pure-white)] bg-[var(--overlay-soft)] font-semibold' : 'text-[var(--color-ash)]'}`}
              >
                <Bot className="w-4 h-4 flex-shrink-0" /> Обычный
              </button>

              <button
                onClick={() => {
                  if (isPremium) {
                    setMode('judge'); setIsRoleOpen(false);
                  } else {
                    setPremiumModal(true); setIsRoleOpen(false);
                  }
                }}
                className={`w-full text-left flex items-center justify-between px-4 py-2.5 text-sm hover:bg-[var(--overlay-soft-strong)] transition-colors cursor-pointer ${mode === 'judge' ? 'text-[var(--color-pure-white)] bg-[var(--overlay-soft)] font-semibold' : 'text-[var(--color-ash)]'}`}
              >
                <span className="flex items-center gap-2"><Scale className="w-4 h-4 flex-shrink-0" /> Судья</span>
                {!isPremium && <span className="text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded">PREMIUM</span>}
              </button>

              <button
                onClick={() => {
                  if (isPremium) {
                    setMode('lawyer'); setIsRoleOpen(false);
                  } else {
                    setPremiumModal(true); setIsRoleOpen(false);
                  }
                }}
                className={`w-full text-left flex items-center justify-between px-4 py-2.5 text-sm hover:bg-[var(--overlay-soft-strong)] transition-colors cursor-pointer ${mode === 'lawyer' ? 'text-[var(--color-pure-white)] bg-[var(--overlay-soft)] font-semibold' : 'text-[var(--color-ash)]'}`}
              >
                <span className="flex items-center gap-2"><Briefcase className="w-4 h-4 flex-shrink-0" /> Адвокат</span>
                {!isPremium && <span className="text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded">PREMIUM</span>}
              </button>

              <button
                onClick={() => {
                  if (isPremium) {
                    setMode('prosecutor'); setIsRoleOpen(false);
                  } else {
                    setPremiumModal(true); setIsRoleOpen(false);
                  }
                }}
                className={`w-full text-left flex items-center justify-between px-4 py-2.5 text-sm hover:bg-[var(--overlay-soft-strong)] transition-colors cursor-pointer ${mode === 'prosecutor' ? 'text-[var(--color-pure-white)] bg-[var(--overlay-soft)] font-semibold' : 'text-[var(--color-ash)]'}`}
              >
                <span className="flex items-center gap-2"><Siren className="w-4 h-4 flex-shrink-0" /> Прокурор</span>
                {!isPremium && <span className="text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded">PREMIUM</span>}
              </button>

              {isAdmin && (
                <button
                  onClick={() => {
                    setMode('admin_judge'); setIsRoleOpen(false);
                  }}
                  className={`w-full text-left flex items-center justify-between px-4 py-2.5 text-sm hover:bg-[var(--overlay-soft-strong)] transition-colors cursor-pointer ${mode === 'admin_judge' ? 'text-[var(--color-pure-white)] bg-[var(--overlay-soft)] font-semibold' : 'text-[var(--color-ash)]'}`}
                >
                  <span className="flex items-center gap-2"><Crown className="w-4 h-4 flex-shrink-0" /> Суд Админ</span>
                  <span className="text-[10px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded">ADMIN</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Новый чат button */}
      <button
        onClick={() => { createNewChat(); setIsMobileSidebarOpen(false); }}
        className="rc-btn-ghost flex items-center justify-center gap-2 w-full mt-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
        Новый чат
      </button>

      {/* History */}
      <div className="flex-1 overflow-y-auto space-y-2 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="text-xs font-semibold text-[var(--color-smoke)] uppercase tracking-wider mb-3 mt-4">История</div>
        {chatHistory.length === 0 ? (
          <p className="text-xs text-[var(--color-smoke)] text-center py-4">Нет сохраненных чатов</p>
        ) : (
          chatHistory.map(chat => (
            <div
              key={chat.id}
              onClick={() => { loadChat(chat); setIsMobileSidebarOpen(false); }}
              className={`group relative flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${currentChatId === chat.id ? 'bg-[var(--overlay-soft-strong)] text-[var(--color-pure-white)]' : 'hover:bg-[var(--overlay-soft)] text-[var(--color-ash)]'}`}
            >
              <div className="flex flex-col gap-1 overflow-hidden">
                <span className="text-sm truncate pr-6">{chat.title}</span>
                <span className="text-[10px] text-[var(--color-smoke)]">{new Date(chat.updatedAt).toLocaleDateString()}</span>
              </div>
              <button
                onClick={(e) => deleteChat(e, chat.id)}
                className="absolute right-2 p-1.5 rounded-lg text-[var(--color-smoke)] hover:text-red-400 hover:bg-red-500/10 opacity-100 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );

  return (
    <>
      <style>{`
        footer { display: none !important; }
        body { overflow: hidden; }
      `}</style>

      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden animate-fade-in"
          style={{ background: "color-mix(in srgb, var(--color-void-black) 70%, transparent)", backdropFilter: "blur(8px)" }}
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Drawer (Slide-out Sidebar) */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-[var(--color-ink)] border-r border-[var(--color-hairline)] p-6 z-50 md:hidden transition-transform duration-300 ease-out flex flex-col gap-4 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold text-[var(--color-pure-white)]">Lexis Ассистент</span>
          <button onClick={() => setIsMobileSidebarOpen(false)} className="text-[var(--color-ash)] hover:text-[var(--color-pure-white)] p-1 rounded hover:bg-[var(--overlay-soft)] transition-colors cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        {renderSidebarContent()}
      </div>

      <div className="flex h-[calc(100dvh-80px)] w-full max-w-[1400px] mx-auto px-2 md:px-6 relative flex-col md:flex-row">
        {/* Mobile Header Bar */}
        <div className="w-full flex items-center justify-between py-2 px-3 border-b border-[var(--color-hairline)] bg-black/20 md:hidden z-30">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 text-[var(--color-ash)] hover:text-[var(--color-pure-white)] rounded-lg hover:bg-[var(--overlay-soft)] transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>

          {/* Mode switcher on mobile - Now replaced by Role Selector in sidebar, so we can hide this or keep it empty */}
          {isAuthenticated && (
            <div className="flex items-center">
              {isPremium ? <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">PREMIUM</span> : null}
            </div>
          )}

          <button
            onClick={createNewChat}
            className="p-2 text-[var(--color-ash)] hover:text-[var(--color-pure-white)] rounded-lg hover:bg-[var(--overlay-soft)] transition-colors cursor-pointer"
            title="Новый чат"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          </button>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:flex w-64 flex-col gap-4 border-r border-[var(--color-hairline)] pr-6 h-full pt-4 pb-4">
          {renderSidebarContent()}
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col items-center relative h-full max-w-4xl mx-auto w-full pt-2 md:pt-4 px-2">
          {!isAuthenticated && (
            <div className="rc-card-edge w-full max-w-3xl bg-[var(--color-ink)] mb-2 flex flex-col sm:flex-row items-center justify-between gap-4 z-30 animate-fade-in">
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 flex-shrink-0 text-[var(--color-coral-text)]" />
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-[var(--color-pure-white)]">Демонстрационный режим</h4>
                  <p className="text-xs text-[var(--color-ash)]">Вам доступны заготовки вопросов. Для свободного общения с ИИ авторизуйтесь на сайте.</p>
                </div>
              </div>
              <a href="/api/auth/signin?callbackUrl=/assistant" className="rc-btn w-full sm:w-auto text-center flex-shrink-0">
                Войти через Discord
              </a>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center w-full animate-fade-in pb-20 relative">
              <div className="w-12 h-12 mb-4 text-[var(--color-coral-text)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>

              <h1 className="text-heading-sm font-bold text-[var(--color-pure-white)] mb-6 text-center">Чем могу помочь?</h1>

              <div className="flex flex-wrap justify-center gap-2 w-full max-w-2xl mt-2 px-4">
                {[
                  "Как работает суд?",
                  "Чем занимается прокуратура?",
                  "Как в суде защищать обвиняемого за убийство?",
                  "Как снять с должности губернатора?"
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="px-4 py-2.5 rounded-xl bg-[var(--overlay-soft)] border border-[var(--color-hairline)] hover:bg-[var(--overlay-soft-strong)] hover:border-[#4a4b4d] transition-all text-xs text-[var(--color-ash)] shadow-sm cursor-pointer text-left sm:text-center w-full sm:w-auto"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Top Header (Desktop only) */}
              <div className="hidden md:flex absolute top-0 left-0 right-0 w-full pt-2 pb-6 z-20 justify-center pointer-events-none">
                <div className="w-full max-w-3xl flex justify-between items-start pointer-events-auto px-2">
                  <div className="text-sm text-[var(--color-ash)] flex items-center gap-3">
                    <span>Сервер:</span> <span className="text-[var(--color-pure-white)] font-semibold text-shadow-sm">{selectedServer.projectName ? `${selectedServer.projectName} - ${selectedServer.name}` : selectedServer.name}</span>
                  </div>
                </div>
              </div>

              <div
                className="flex-1 w-full max-w-3xl flex flex-col gap-6 mb-4 mt-2 overflow-y-auto overflow-x-hidden pr-2 pb-[180px] pt-4 md:pt-14 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                style={{ maskImage: 'linear-gradient(to bottom, transparent 0px, black 40px, black calc(100% - 180px), transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, black 40px, black calc(100% - 180px), transparent 100%)' }}
              >
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    <div
                      className={`max-w-[90%] md:max-w-[85%] rounded-3xl px-4 md:px-5 py-3 md:py-3.5 text-sm leading-relaxed shadow-sm ${m.role === 'user'
                        ? 'rounded-tr-sm'
                        : 'border border-[var(--color-hairline)] text-[var(--color-ash)] rounded-tl-sm backdrop-blur-md'
                        }`}
                      style={m.role === 'user' ? { background: "var(--color-mist)", color: "var(--color-iron)" } : { background: "var(--color-ink)" }}
                    >
                      {m.role === 'user' ? (
                        <div className="whitespace-pre-wrap font-medium">{m.content}</div>
                      ) : (
                        <div className="flex flex-col text-[var(--color-pure-white)] group">
                          <div className="flex flex-col gap-1.5">
                            {m.content.split(/(\{ЦИТАТА:[^{}]+\})/g).map((part, idx) => {
                              if (part.startsWith('{ЦИТАТА:') && part.endsWith('}')) {
                                const inner = part.slice(8, -1);
                                const [article, law, ...textParts] = inner.split('|');
                                const text = textParts.join('|').trim();

                                const getLawName = (t: string) => {
                                  if (!t) return 'Цитата';
                                  const upper = t.toUpperCase().trim();
                                  if (upper === 'UK.TXT') return 'Уголовный кодекс';
                                  if (upper === 'PROC.TXT') return 'Процессуальный кодекс';
                                  return t;
                                };

                                return (
                                  <button
                                    key={idx}
                                    onClick={() => setQuoteModal({ isOpen: true, title: getLawName(law), text: text || inner })}
                                    className="inline-flex items-center gap-1.5 px-2 py-1 mt-1 rounded bg-[var(--overlay-soft-strong)] border border-[var(--color-hairline)] text-[var(--color-pure-white)] hover:bg-[var(--overlay-soft)] transition-colors text-xs font-semibold cursor-pointer align-middle w-fit text-left"
                                  >
                                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                                    <span className="truncate max-w-[200px]">{article?.trim()}</span>
                                  </button>
                                );
                              }

                              // Fallback for old saved chats
                              let processedPart = part;
                              try {
                                const matchRegex = /\[([^\]]+)\]\s*\((?:<)?quote:/g;
                                let match;
                                let offset = 0;
                                let finalResult = "";

                                while ((match = matchRegex.exec(processedPart)) !== null) {
                                  const startIdx = match.index;
                                  const title = match[1];
                                  const contentStart = match.index + match[0].length;

                                  let openParens = 1;
                                  let endIdx = -1;
                                  for (let i = contentStart; i < processedPart.length; i++) {
                                    if (processedPart[i] === '(') openParens++;
                                    if (processedPart[i] === ')') openParens--;
                                    if (openParens === 0) {
                                      endIdx = i;
                                      break;
                                    }
                                  }

                                  if (endIdx !== -1) {
                                    let quoteText = processedPart.slice(contentStart, endIdx);
                                    if (quoteText.endsWith('>')) quoteText = quoteText.slice(0, -1);
                                    finalResult += processedPart.slice(offset, startIdx);
                                    finalResult += `[${title}](quote:${encodeURIComponent(quoteText)})`;
                                    offset = endIdx + 1;
                                    matchRegex.lastIndex = offset;
                                  } else {
                                    break;
                                  }
                                }
                                finalResult += processedPart.slice(offset);
                                processedPart = finalResult;
                              } catch (e) {
                                console.error("Error parsing old quote:", e);
                              }

                              return (
                                <ReactMarkdown
                                  key={idx}
                                  urlTransform={(url) => url}
                                  components={{
                                    p: ({ node, ...props }) => <p className="mb-1.5 last:mb-0" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2" {...props} />,
                                    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                    h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-2 mt-3 text-[var(--color-pure-white)]" {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-2 mt-3 text-[var(--color-pure-white)]" {...props} />,
                                    h3: ({ node, ...props }) => <h3 className="text-base font-bold mb-2 mt-2 text-[var(--color-pure-white)]" {...props} />,
                                    strong: ({ node, ...props }) => <strong className="font-semibold text-[var(--color-pure-white)]" {...props} />,
                                    pre: ({ node, ...props }) => <pre className="whitespace-pre-wrap break-words overflow-x-auto bg-black/40 border border-[var(--color-hairline)] rounded-lg p-3 my-2 text-xs font-mono text-[var(--color-ash)]" {...props} />,
                                    code: ({ node, className, ...props }) => {
                                      const match = /language-(\w+)/.exec(className || '');
                                      const isInline = !match;
                                      return <code className={isInline ? "bg-black/40 rounded px-1.5 py-0.5 text-[var(--color-pure-white)] font-mono text-xs break-words whitespace-normal" : "break-words"} {...props} />;
                                    },
                                    a: ({ node, href, children, ...props }) => {
                                      if (href?.startsWith('/api/download/')) {
                                        return (
                                          <a href={href} className="mt-4 mb-2 flex items-center gap-4 p-4 bg-[var(--overlay-soft)] border border-[var(--color-hairline)] rounded-xl hover:bg-[var(--overlay-soft-strong)] transition-all cursor-pointer max-w-sm w-full shadow-lg" {...props}>
                                            <Package className="w-8 h-8 text-[var(--color-pure-white)] flex-shrink-0" />
                                            <div className="flex flex-col">
                                              <span className="font-semibold text-[var(--color-pure-white)] text-base leading-tight">Скачать JSON Пресет</span>
                                              <span className="text-xs text-[var(--color-ash)] mt-0.5">Нажмите, чтобы загрузить как вложение</span>
                                            </div>
                                          </a>
                                        );
                                      }
                                      if (href?.startsWith('/presets/')) {
                                        return (
                                          <a href={href} target="_blank" className="mb-2 flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-500/20 to-transparent border border-emerald-500/30 rounded-xl hover:bg-emerald-500/30 transition-all cursor-pointer max-w-sm w-full shadow-lg" {...props}>
                                            <BookOpen className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                                            <div className="flex flex-col">
                                              <span className="font-semibold text-[var(--color-pure-white)] text-base leading-tight">Открыть в приложении</span>
                                              <span className="text-xs text-[var(--color-ash)] mt-0.5">Открыть пресет на сайте Lexis</span>
                                            </div>
                                          </a>
                                        );
                                      }
                                      if (href?.startsWith('quote:')) {
                                        const content = decodeURIComponent(href.replace('quote:', ''));
                                        const [title, text] = content.split('|');

                                        const getLawName = (t: string) => {
                                          if (!t) return 'Цитата';
                                          const upper = t.toUpperCase().trim();
                                          if (upper === 'UK.TXT') return 'Уголовный кодекс';
                                          if (upper === 'PROC.TXT') return 'Процессуальный кодекс';
                                          return t;
                                        };

                                        return (
                                          <button
                                            onClick={() => setQuoteModal({ isOpen: true, title: getLawName(title), text: text || content })}
                                            className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 rounded bg-[var(--overlay-soft-strong)] border border-[var(--color-hairline)] text-[var(--color-pure-white)] hover:bg-[var(--overlay-soft)] transition-colors text-xs font-semibold cursor-pointer align-middle"
                                          >
                                            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                                            {children}
                                          </button>
                                        );
                                      }
                                      return <a href={href} className="text-[var(--color-pure-white)] hover:underline" {...props}>{children}</a>;
                                    }
                                  }}
                                >
                                  {processedPart}
                                </ReactMarkdown>
                              );
                            })}
                          </div>

                          <div className="mt-2 flex justify-end md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                let textToCopy = m.content.replace(/\{ЦИТАТА:[^{}]+\}/g, (match) => {
                                  const inner = match.slice(8, -1);
                                  const [article, law, ...textParts] = inner.split('|');
                                  const text = textParts.join('|').trim();
                                  return `"${text}" (${article?.trim() || ''}, ${law?.trim() || ''})`;
                                });

                                textToCopy = textToCopy.replace(/\[([^\]]+)\]\s*\((?:<)?quote:([^|)]+)\|?([^\)]*)\)/g, (match, title, quoteTitle, text) => {
                                  return `"${decodeURIComponent(text || quoteTitle)}" (${title})`;
                                });

                                navigator.clipboard.writeText(textToCopy);
                                setCopiedMessageIndex(i);
                                setTimeout(() => setCopiedMessageIndex(null), 2000);
                              }}
                              className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--color-ash)] hover:text-[var(--color-pure-white)] transition-colors bg-[var(--overlay-soft)] hover:bg-[var(--overlay-soft-strong)] px-2.5 py-1.5 rounded"
                            >
                              {copiedMessageIndex === i ? (
                                <>
                                  <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                  <span className="text-green-500">Скопировано</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                  <span>Копировать</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="max-w-[90%] md:max-w-[85%] rounded-3xl px-6 py-5 bg-[var(--color-ink)] border border-[var(--color-hairline)] text-[var(--color-ash)] rounded-tl-sm flex items-center gap-2 backdrop-blur-md">
                      <div className="w-2 h-2 bg-[var(--color-smoke)] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[var(--color-smoke)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-[var(--color-smoke)] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            </>
          )}

          {/* Input Area (Docked to bottom) */}
          <div className="absolute bottom-0 left-0 right-0 w-full pt-16 pb-4 md:pb-6 px-2 md:px-4 z-20 flex justify-center pointer-events-none">
            <div className="w-full max-w-3xl flex flex-col pointer-events-auto">
              <div className="w-full bg-[var(--color-ink)] backdrop-blur-xl border border-[var(--color-hairline)] rounded-3xl p-3 shadow-2xl transition-all focus-within:border-[var(--color-coral-text)] ring-1 ring-black/50">
                <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(input);
                  }
                }}
                placeholder={limitResetTimeMs ? "Лимит запросов исчерпан. Ожидайте окончания таймера..." : (isAuthenticated ? "(IC) Задай свой вопрос..." : "Выберите заготовленный вопрос...")}
                disabled={!isAuthenticated || limitResetTimeMs !== null}
                className="w-full bg-transparent text-sm text-[var(--color-pure-white)] placeholder-[var(--color-smoke)] resize-none outline-none max-h-32 min-h-[44px] overflow-y-auto px-3 pt-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] disabled:opacity-50"
                rows={1}
              />
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--color-hairline)] px-1">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-[var(--color-hairline)]">
                    <div className="w-3.5 h-3.5 text-[var(--color-pure-white)]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-[var(--color-ash)]">Lexis AI</span>
                  </div>

                  {isAuthenticated && (
                    <div className="hidden sm:flex items-center bg-black/40 rounded-full p-0.5 border border-[var(--color-hairline)]">
                      <button
                        onClick={() => setMode('normal')}
                        className="px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer"
                        style={mode === 'normal' ? { background: "var(--color-mist)", color: "var(--color-iron)" } : { color: "var(--color-ash)" }}
                      >Краткий</button>
                      <button
                        onClick={() => setMode('detailed')}
                        className="px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer"
                        style={mode === 'detailed' ? { background: "var(--color-mist)", color: "var(--color-iron)" } : { color: "var(--color-ash)" }}
                      >Подробный</button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleSend(input)}
                  disabled={!input.trim() || isLoading || !isAuthenticated}
                  className="p-2.5 rounded-xl disabled:opacity-50 transition-all cursor-pointer shadow-lg"
                  style={{ background: "var(--color-mist)", color: "var(--color-iron)" }}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-black/20 border-t-[var(--color-iron)] rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 translate-x-px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  )}
                </button>
              </div>
              </div>
              <p className="text-center text-[10.5px] text-[var(--color-smoke)] mt-2.5 px-4 font-medium drop-shadow-sm">
                ИИ может допускать ошибки. Если на вашем сервере изменилось законодательство, или вы хотите добавить новый сервер — <a href="https://discord.gg/hM4BfE6Tnt" target="_blank" rel="noopener noreferrer" className="text-[var(--color-pure-white)] hover:underline transition-colors">создавайте тикет в официальном Discord</a>.<br/>Последнее обновление законодательства: 14.07.2026.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Modal */}
      {premiumModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
          style={{ background: "color-mix(in srgb, var(--color-void-black) 70%, transparent)", backdropFilter: "blur(8px)" }}
          onClick={() => setPremiumModal(false)}
        >
          <div
            className="rc-card-edge p-6 w-full max-w-md shadow-2xl shadow-amber-900/20 relative animate-scale-up"
            style={{ background: "var(--color-ink)", borderColor: "rgba(245, 158, 11, 0.3)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.2)]">
                <Crown className="w-8 h-8 text-amber-500" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-center text-[var(--color-pure-white)] mb-2">Требуется Premium</h3>
            <p className="text-[var(--color-ash)] text-sm text-center mb-6 leading-relaxed">
              Роли Судьи, Адвоката и Прокурора доступны только для пользователей с <span className="text-amber-400 font-semibold">Lexis Premium</span>.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setPremiumModal(false)}
                className="rc-btn-ghost flex-1 py-3 font-semibold"
              >
                Закрыть
              </button>
              <a
                href="/premium"
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white text-center rounded-xl font-semibold shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
              >
                Подробнее
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Limit Rate Modal */}
      {limitResetTimeMs && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
          style={{ background: "color-mix(in srgb, var(--color-void-black) 70%, transparent)", backdropFilter: "blur(8px)" }}
          onClick={() => { }}
        >
          <div
            className="rc-card-edge p-6 w-full max-w-md relative animate-scale-up overflow-hidden"
            style={{ background: "var(--color-ink)" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Liquid glass reflection and glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.05] to-transparent pointer-events-none" />
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.2)]">
                  <Clock className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center text-[var(--color-pure-white)] mb-2">Лимит запросов исчерпан</h3>
              <p className="text-[var(--color-ash)] text-sm text-center mb-4 leading-relaxed">
                Вы достигли бесплатного лимита запросов к ИИ-ассистенту (15 в час). Новые запросы будут доступны через:
              </p>
              <div className="flex justify-center mb-6">
                <div className="bg-black/40 border border-red-500/20 px-6 py-3 rounded-xl shadow-inner">
                  <span className="text-3xl font-mono font-bold text-red-400 tracking-wider drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]">{timeLeftStr || "00:00"}</span>
                </div>
              </div>
              <p className="text-xs text-center text-[var(--color-ash)] mb-6">
                Чтобы общаться без лимитов и ожиданий, приобретите <span className="text-amber-400 font-semibold drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]">Lexis Premium</span>.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="/"
                  className="rc-btn-ghost flex-1 py-3 text-center font-semibold"
                >
                  В главное меню
                </a>
                <a
                  href="/premium"
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-center rounded-xl font-semibold shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all active:scale-95 cursor-pointer border border-amber-400/50"
                >
                  Купить Premium
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quote Modal */}
      {quoteModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: "color-mix(in srgb, var(--color-void-black) 70%, transparent)", backdropFilter: "blur(8px)" }}
          onClick={() => setQuoteModal({ ...quoteModal, isOpen: false })}
        >
          <div className="rc-card-edge max-w-lg w-full overflow-hidden !p-0 animate-scale-up" style={{ background: "var(--color-ink)" }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-[var(--color-hairline)] bg-[var(--overlay-soft)]">
              <div className="flex flex-col">
                <span className="text-[10px] text-[var(--color-smoke)] uppercase font-semibold">Цитата</span>
                <span className="text-sm font-bold text-[var(--color-pure-white)]">{quoteModal.title}</span>
              </div>
              <button onClick={() => setQuoteModal({ ...quoteModal, isOpen: false })} className="text-[var(--color-ash)] hover:text-[var(--color-pure-white)] p-1 rounded hover:bg-[var(--overlay-soft-strong)] transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-[var(--color-ash)] leading-relaxed font-medium">
                {quoteModal.text}
              </p>
            </div>
            <div className="p-4 pt-0 flex justify-end">
              <button
                onClick={handleCopyQuote}
                className="rc-btn-ghost flex items-center gap-2 px-4 py-2 text-xs"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Скопировано
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    Скопировать
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

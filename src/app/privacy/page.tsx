import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Политика конфиденциальности - Lexis',
  description: 'Политика конфиденциальности сервиса Lexis',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto space-y-8 relative overflow-hidden animate-fade-in">
      <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none -z-10" style={{ background: "color-mix(in srgb, var(--color-coral-pulse) 6%, transparent)" }} aria-hidden="true" />

      <Link href="/" className="rc-link inline-flex items-center gap-2 mb-4 group">
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" strokeWidth={2.5} />
        На главную
      </Link>

      <div className="rc-card-edge p-8 md:p-12 relative z-10" style={{ background: "var(--color-ink)" }}>
        <header className="mb-10 pb-8 border-b" style={{ borderColor: "var(--color-hairline)" }}>
          <h1 className="text-heading-sm md:text-heading-lg font-extrabold tracking-tight text-[var(--color-pure-white)] mb-3 break-words">Политика конфиденциальности</h1>
          <p className="font-data text-sm text-[var(--color-smoke)]">
            Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
          </p>
        </header>

        <div className="max-w-[70ch] space-y-10 text-[var(--color-ash)] leading-relaxed text-base md:text-lg">
          <section className="border-l-2 pl-6 transition-colors duration-300" style={{ borderColor: "var(--color-hairline)" }}>
            <h2 className="text-xl md:text-2xl font-bold text-[var(--color-pure-white)] mb-4">1. Сбор информации</h2>
            <p>
              При использовании нашего Discord бота и веб-приложения Lexis, мы можем собирать следующую информацию:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 marker:text-[var(--color-smoke)] text-[var(--color-ash)]">
              <li>Ваш Discord ID, имя пользователя (username) и аватар.</li>
              <li>Данные о серверах, на которых вы используете нашего бота (названия, ID гильдий).</li>
              <li>Техническую информацию, необходимую для работы пресетов и экзаменационных модулей.</li>
            </ul>
          </section>

          <section className="border-l-2 pl-6 transition-colors duration-300" style={{ borderColor: "var(--color-hairline)" }}>
            <h2 className="text-xl md:text-2xl font-bold text-[var(--color-pure-white)] mb-4">2. Использование информации</h2>
            <p>
              Собранные данные используются исключительно для:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 marker:text-[var(--color-smoke)] text-[var(--color-ash)]">
              <li>Предоставления вам услуг сервиса Lexis (включая работу Discord бота).</li>
              <li>Верификации Premium-статуса и участия в акциях (например, отслеживание тега LEXS).</li>
              <li>Улучшения качества наших алгоритмов (ответы на экзаменах, пресеты).</li>
            </ul>
          </section>

          <section className="border-l-2 pl-6 transition-colors duration-300" style={{ borderColor: "var(--color-hairline)" }}>
            <h2 className="text-xl md:text-2xl font-bold text-[var(--color-pure-white)] mb-4">3. Защита данных</h2>
            <p>
              Мы принимаем все необходимые меры для защиты ваших данных от несанкционированного доступа. Мы <strong className="text-[var(--color-pure-white)]">не продаем</strong> и не передаем вашу личную информацию третьим лицам.
            </p>
          </section>

          <section className="border-l-2 pl-6 transition-colors duration-300" style={{ borderColor: "var(--color-hairline)" }}>
            <h2 className="text-xl md:text-2xl font-bold text-[var(--color-pure-white)] mb-4">4. Контакты</h2>
            <p>
              Если у вас есть вопросы по поводу вашей конфиденциальности или вы хотите запросить удаление ваших данных из нашей базы, пожалуйста, свяжитесь с нами через наш официальный Discord сервер.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

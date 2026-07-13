import React from 'react';

export const metadata = {
  title: 'Политика конфиденциальности - Lexis',
  description: 'Политика конфиденциальности сервиса Lexis',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto glass-card p-8 md:p-12 relative z-10">
        <h1 className="text-3xl md:text-5xl font-bold mb-8 text-white">Политика конфиденциальности</h1>
        
        <div className="space-y-6 text-gray-300 leading-relaxed text-lg">
          <p>
            Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
          </p>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Сбор информации</h2>
            <p>
              При использовании нашего Discord бота и веб-приложения Lexis, мы можем собирать следующую информацию:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2 marker:text-[#5865F2]">
              <li>Ваш Discord ID, имя пользователя (username) и аватар.</li>
              <li>Данные о серверах, на которых вы используете нашего бота (названия, ID гильдий).</li>
              <li>Техническую информацию, необходимую для работы пресетов и экзаменационных модулей.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Использование информации</h2>
            <p>
              Собранные данные используются исключительно для:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2 marker:text-[#5865F2]">
              <li>Предоставления вам услуг сервиса Lexis (включая работу Discord бота).</li>
              <li>Верификации Premium-статуса и участия в акциях (например, отслеживание тега LEXS).</li>
              <li>Улучшения качества наших алгоритмов (ответы на экзаменах, пресеты).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Защита данных</h2>
            <p>
              Мы принимаем все необходимые меры для защиты ваших данных от несанкционированного доступа. Мы <strong>не продаем</strong> и не передаем вашу личную информацию третьим лицам.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Контакты</h2>
            <p>
              Если у вас есть вопросы по поводу вашей конфиденциальности или вы хотите запросить удаление ваших данных из нашей базы, пожалуйста, свяжитесь с нами через наш официальный Discord сервер.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

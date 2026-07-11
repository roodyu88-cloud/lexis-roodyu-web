import React from 'react';
import Link from 'next/link';

export default function PromoRulesPage() {
    return (
        <div className="min-h-screen bg-[#111] text-white py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-[#1a1a1a] rounded-2xl p-8 border border-[#333] shadow-xl">
                <div className="text-center mb-10">
                    <span className="bg-[#5865F2]/20 text-[#5865F2] px-3 py-1 rounded-full text-sm font-semibold tracking-wide uppercase">
                        Акция
                    </span>
                    <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                        Правила акции: LEXS
                    </h1>
                    <p className="mt-4 text-xl text-gray-400">
                        Условия получения бонусной Premium-подписки за поддержку нашего сообщества.
                    </p>
                </div>

                <div className="space-y-8 text-gray-300">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                            <span className="text-[#5865F2] mr-3">1.</span> Суть акции
                        </h2>
                        <p className="leading-relaxed">
                            Каждый пользователь, зарегистрированный на сайте, может получить <strong>3 дня Premium-подписки абсолютно бесплатно</strong>. Для этого необходимо добавить тег <strong className="text-white bg-[#333] px-2 py-1 rounded">LEXS</strong> в свой никнейм на сервере Discord, глобальное имя Discord или выбрать наш официальный клановый тег.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                            <span className="text-[#5865F2] mr-3">2.</span> Ограничения
                        </h2>
                        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                            <li>Акция доступна <strong>только один раз</strong> для каждого аккаунта.</li>
                            <li>Если у вас уже есть активная подписка Premium, вы не можете воспользоваться данной акцией.</li>
                            <li>Запрещено создавать дополнительные аккаунты (твинки) для повторного получения бонуса.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                            <span className="text-[#5865F2] mr-3">3.</span> Аннулирование бонуса
                        </h2>
                        <div className="bg-[#ff4757]/10 border-l-4 border-[#ff4757] p-4 rounded-r-lg">
                            <p className="text-[#ff4757] font-medium">
                                Внимание! Бот автоматически отслеживает изменения профилей в реальном времени.
                            </p>
                            <p className="mt-2 text-sm text-gray-300">
                                Если после получения бонуса вы <strong>уберете тег LEXS</strong> из своего имени до истечения 3 дней, ваша Premium-подписка будет <strong>моментально и безвозвратно аннулирована</strong>. Повторно получить бонус за возвращение тега будет невозможно.
                            </p>
                        </div>
                    </section>

                    <div className="mt-12 pt-8 border-t border-[#333] text-center">
                        <Link 
                            href="/"
                            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-[#5865F2] hover:bg-[#4752C4] transition-colors duration-200"
                        >
                            Вернуться на главную
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

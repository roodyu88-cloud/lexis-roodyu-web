import React from 'react';
import Link from 'next/link';

export default function PromoRulesPage() {
    return (
        <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
            
            {/* Background glowing effects to enhance the glassmorphism */}
            <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-[#5865F2] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 pointer-events-none animate-pulse"></div>
            <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-[#00F0FF] rounded-full mix-blend-multiply filter blur-[128px] opacity-10 pointer-events-none"></div>

            <div className="glass-card max-w-4xl w-full p-8 md:p-12 relative z-10">
                <div className="text-center mb-12">
                    <span className="inline-block bg-[#5865F2]/20 text-[#5865F2] px-4 py-1.5 rounded-full text-sm font-bold tracking-wider uppercase mb-4 border border-[#5865F2]/30 shadow-[0_0_15px_rgba(88,101,242,0.3)]">
                        Специальная Акция
                    </span>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-sm">
                        Правила акции LEXS
                    </h1>
                    <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light">
                        Условия получения бонусной Premium-подписки за поддержку нашего сообщества.
                    </p>
                </div>

                <div className="space-y-10 text-gray-200">
                    <section className="group">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 flex items-center transition-transform group-hover:translate-x-1 duration-300">
                            <span className="text-[#5865F2] mr-4 text-4xl opacity-80">01</span> 
                            Суть акции
                        </h2>
                        <div className="pl-12">
                            <p className="leading-relaxed text-lg text-gray-300">
                                Каждый пользователь, зарегистрированный на сайте, может получить <strong className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">3 дня Premium-подписки абсолютно бесплатно</strong>. Для этого необходимо добавить тег <strong className="text-white bg-white/10 px-3 py-1 rounded-md border border-white/20 shadow-sm mx-1">LEXS</strong> в свой никнейм на сервере Discord, глобальное имя Discord или выбрать наш официальный клановый тег.
                            </p>
                        </div>
                    </section>

                    <section className="group">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 flex items-center transition-transform group-hover:translate-x-1 duration-300">
                            <span className="text-[#5865F2] mr-4 text-4xl opacity-80">02</span> 
                            Ограничения
                        </h2>
                        <div className="pl-12">
                            <ul className="list-disc pl-5 space-y-3 text-lg text-gray-300 marker:text-[#5865F2]">
                                <li>Акция доступна <strong className="text-white">только один раз</strong> для каждого аккаунта.</li>
                                <li>Если у вас уже есть активная подписка Premium, вы не можете воспользоваться данной акцией.</li>
                                <li>Запрещено создавать дополнительные аккаунты (твинки) для повторного получения бонуса.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="group">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 flex items-center transition-transform group-hover:translate-x-1 duration-300">
                            <span className="text-[#ff4757] mr-4 text-4xl opacity-80 drop-shadow-[0_0_10px_rgba(255,71,87,0.4)]">03</span> 
                            Аннулирование бонуса
                        </h2>
                        <div className="pl-12">
                            <div className="bg-[#ff4757]/10 backdrop-blur-md border border-[#ff4757]/30 p-6 rounded-2xl shadow-[0_4px_20px_rgba(255,71,87,0.15)] relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#ff4757] to-transparent"></div>
                                <p className="text-[#ff4757] font-semibold text-lg flex items-center mb-2">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    Внимание! Бот автоматически отслеживает изменения.
                                </p>
                                <p className="text-gray-300 text-lg leading-relaxed">
                                    Если после получения бонуса вы <strong>уберете тег LEXS</strong> из своего имени до истечения 3 дней, ваша Premium-подписка будет <strong>моментально и безвозвратно аннулирована</strong>. Повторно получить бонус за возвращение тега будет невозможно.
                                </p>
                            </div>
                        </div>
                    </section>

                    <div className="mt-16 pt-10 border-t border-white/10 text-center flex justify-center">
                        <Link 
                            href="/"
                            className="btn-primary flex items-center space-x-2 text-lg px-8 py-4 w-full sm:w-auto justify-center"
                        >
                            <span>Вернуться на главную</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

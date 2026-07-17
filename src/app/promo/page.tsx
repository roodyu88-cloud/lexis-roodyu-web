import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export default function PromoRulesPage() {
    return (
        <div className="min-h-[calc(100vh-5rem)] py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">

            {/* Background glowing effects */}
            <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full filter blur-[128px] opacity-20 pointer-events-none animate-pulse" style={{ background: "var(--color-coral-pulse)" }}></div>
            <div className="fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full filter blur-[128px] opacity-30 pointer-events-none" style={{ background: "var(--color-obsidian)" }}></div>

            <div className="rc-card-edge max-w-4xl w-full p-8 md:p-12 relative z-10" style={{ background: "var(--color-ink)" }}>
                <div className="text-center mb-12">
                    <span
                        className="rc-eyebrow inline-block px-4 py-1.5 rounded-full text-sm font-bold tracking-wider uppercase mb-4 border"
                        style={{ background: "var(--color-coral-pulse)", color: "var(--color-on-coral)", borderColor: "var(--color-coral-pulse)" }}
                    >
                        Специальная Акция
                    </span>
                    <h1 className="text-heading md:text-heading-lg font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-pure-white)] to-[var(--color-ash)]">
                        Правила акции LEXS
                    </h1>
                    <p className="mt-6 text-lg md:text-xl text-[var(--color-ash)] max-w-2xl mx-auto font-light">
                        Условия получения бонусной Premium-подписки за поддержку нашего сообщества.
                    </p>
                </div>

                <div className="space-y-10 text-[var(--color-ash)] max-w-[75ch] mx-auto">
                    <section className="group">
                        <h2 className="text-heading-sm md:text-heading font-bold text-[var(--color-pure-white)] mb-4 flex items-center transition-transform group-hover:translate-x-1 duration-300">
                            <span className="text-[var(--color-coral-text)] mr-4 text-4xl opacity-80 font-data">01</span>
                            Суть акции
                        </h2>
                        <div className="pl-12">
                            <p className="leading-relaxed text-lg text-[var(--color-ash)]">
                                Каждый пользователь, зарегистрированный на сайте, может получить <strong className="text-[var(--color-pure-white)]">3 дня Premium-подписки абсолютно бесплатно</strong>. Для этого необходимо добавить тег <strong className="text-[var(--color-pure-white)] px-3 py-1 rounded-md border mx-1" style={{ background: "var(--overlay-soft-strong)", borderColor: "var(--color-hairline)" }}>LEXS</strong> в свой никнейм на сервере Discord, глобальное имя Discord или выбрать наш официальный клановый тег.
                            </p>
                        </div>
                    </section>

                    <section className="group">
                        <h2 className="text-heading-sm md:text-heading font-bold text-[var(--color-pure-white)] mb-4 flex items-center transition-transform group-hover:translate-x-1 duration-300">
                            <span className="text-[var(--color-coral-text)] mr-4 text-4xl opacity-80 font-data">02</span>
                            Ограничения
                        </h2>
                        <div className="pl-12">
                            <ul className="list-disc pl-5 space-y-3 text-lg text-[var(--color-ash)] marker:text-[var(--color-smoke)]">
                                <li>Акция доступна <strong className="text-[var(--color-pure-white)]">только один раз</strong> для каждого аккаунта.</li>
                                <li>Если у вас уже есть активная подписка Premium, вы не можете воспользоваться данной акцией.</li>
                                <li>Запрещено создавать дополнительные аккаунты (твинки) для повторного получения бонуса.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="group">
                        <h2 className="text-heading-sm md:text-heading font-bold text-[var(--color-pure-white)] mb-4 flex items-center transition-transform group-hover:translate-x-1 duration-300">
                            <span className="text-red-400 mr-4 text-4xl opacity-80 font-data">03</span>
                            Аннулирование бонуса
                        </h2>
                        <div className="pl-12">
                            <div className="bg-red-500/10 backdrop-blur-md border border-red-500/30 p-6 rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-transparent"></div>
                                <p className="text-red-400 font-semibold text-lg flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-5 h-5 shrink-0" strokeWidth={2.25} />
                                    Внимание! Бот автоматически отслеживает изменения.
                                </p>
                                <p className="text-[var(--color-ash)] text-lg leading-relaxed">
                                    Если после получения бонуса вы <strong>уберете тег LEXS</strong> из своего имени до истечения 3 дней, ваша Premium-подписка будет <strong>моментально и безвозвратно аннулирована</strong>. Повторно получить бонус за возвращение тега будет невозможно.
                                </p>
                            </div>
                        </div>
                    </section>

                    <div className="mt-16 pt-10 border-t text-center flex justify-center" style={{ borderColor: "var(--color-hairline)" }}>
                        <Link
                            href="/"
                            className="rc-btn group flex items-center space-x-2 text-lg px-8 py-4 w-full sm:w-auto justify-center"
                        >
                            <span>Вернуться на главную</span>
                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" strokeWidth={2.25} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

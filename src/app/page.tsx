import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const revalidate = 0;

export default async function Home() {
  const discordSetting = await prisma.appSetting.findUnique({ where: { key: "discordUrl" } });
  const discordUrl = discordSetting?.value || "https://dsc.gg/lexis";

  const session = await getServerSession(authOptions);
  const isPremium = (session?.user as any)?.isPremium || false;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full flex flex-col items-center text-center space-y-8 z-10">

        {/* Hero Section */}
        <div className="space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-4 text-[var(--blurple)]">
            v2.0.0 - Новый дизайн!
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Твой идеальный <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--blurple)] to-[var(--blurple-hover)] glow-text">
              RP Справочник
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mt-6">
            Lexis — это стильный оверлей для GTA 5 RP, который позволяет мгновенно находить нужные статьи и законы прямо поверх игры по кнопке F9.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 flex-wrap justify-center">
          <a href="https://github.com/abstracktyt/lexis/releases/latest" target="_blank" rel="noreferrer" className="btn-primary flex items-center justify-center gap-2 text-lg px-8">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Скачать Lexis
          </a>
          <Link href="/presets" className="btn-secondary flex items-center justify-center gap-2 text-lg px-8">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            База Пресетов
          </Link>
          <a href={discordUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-lg px-8 py-3 rounded-xl font-bold transition-all bg-[#5865F2]/10 text-[#5865F2] border border-[#5865F2]/20 hover:bg-[#5865F2] hover:text-white shadow-lg shadow-transparent hover:shadow-[#5865F2]/20">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" /></svg>
            Discord
          </a>
          <Link href="/exam" className="flex items-center justify-center gap-2 text-lg px-8 py-3 rounded-xl font-bold transition-all bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-white shadow-lg shadow-transparent hover:shadow-amber-500/20">
            <span className="text-xl">🎓</span> Тренажер (Premium)
          </Link>
        </div>

        {/* Features / Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-16 text-left">
          <div className="glass-card p-8 relative overflow-hidden group">
            {/* Ambient background light inside the card */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-[var(--blurple-alpha-10)] rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
            <div className="w-12 h-12 rounded-xl bg-[var(--blurple-alpha-10)] border border-[var(--blurple-alpha-20)] flex items-center justify-center mb-6 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.15)] backdrop-blur-md transition-all duration-300 group-hover:border-[var(--blurple-alpha-30)]">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-white transition-colors duration-300">Моментально</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Мгновенный вызов по кнопке F9. Никаких сворачиваний игры во время ареста.</p>
          </div>
          <div className="glass-card p-8 relative overflow-hidden group">
            {/* Ambient background light inside the card */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-[var(--blurple-alpha-10)] rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
            <div className="w-12 h-12 rounded-xl bg-[var(--blurple-alpha-10)] border border-[var(--blurple-alpha-20)] flex items-center justify-center mb-6 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.15)] backdrop-blur-md transition-all duration-300 group-hover:border-[var(--blurple-alpha-30)]">
              <span className="text-2xl">🌍</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-white transition-colors duration-300">Облако Пресетов</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Делитесь своими законами и скачивайте пресеты других серверов в один клик.</p>
          </div>
          <div className="glass-card p-8 relative overflow-hidden group">
            {/* Ambient background light inside the card */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-[var(--blurple-alpha-10)] rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
            <div className="w-12 h-12 rounded-xl bg-[var(--blurple-alpha-10)] border border-[var(--blurple-alpha-20)] flex items-center justify-center mb-6 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.15)] backdrop-blur-md transition-all duration-300 group-hover:border-[var(--blurple-alpha-30)]">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-white transition-colors duration-300">Умный Дизайн</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Темная тема, подсветка синтаксиса и никаких артефактов поверх вашего геймплея.</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="w-full mt-24 mb-16 text-left relative z-10">
          <h2 className="text-3xl font-bold mb-8 text-center text-white">Частые вопросы (FAQ)</h2>

          <div className="space-y-4">
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:border-[var(--blurple-alpha-30)] transition-all">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <span className="text-xl">🛠️</span> Как установить Lexis?
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                1. Нажмите кнопку <b>«Скачать Lexis»</b> на главной странице.<br/>
                2. Распакуйте скачанный архив в любую удобную папку (<b>важно:</b> не запускайте программу прямо внутри архива!).<br/>
                3. Запустите файл <b>Lexis.exe</b>. Приложение откроется и свернется в системный трей (возле часов).
              </p>
              <div className="bg-[var(--blurple-alpha-10)] p-3 rounded-lg border border-[var(--blurple-alpha-20)] mt-3">
                <span className="text-[var(--blurple)] font-medium text-sm">💡 Заметка:</span> <span className="text-gray-400 text-sm">Если Windows SmartScreen заблокирует запуск, нажмите «Подробнее» → «Выполнить в любом случае». Это нормально для новых программ без платной цифровой подписи.</span>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:border-[var(--blurple-alpha-30)] transition-all">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <span className="text-xl">📥</span> Как загрузить закон (пресет) с сайта?
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-3">
                Перейдите в раздел <b>«База Пресетов»</b>. Найдите нужный вам сервер и закон. У вас есть два пути:
              </p>
              <ul className="text-gray-400 text-sm leading-relaxed list-disc list-inside space-y-1">
                <li><b>Автоматически (Рекомендуется):</b> Просто нажмите кнопку «Импортировать в приложение» на сайте. Откроется Lexis, и пресет установится сам!</li>
                <li><b>Вручную:</b> Скачайте `.json` файл пресета с сайта. Затем в приложении Lexis зайдите во вкладку «Профили», нажмите «Импорт» и выберите скачанный файл.</li>
              </ul>
            </div>

            <div className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:border-[var(--blurple-alpha-30)] transition-all">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <span className="text-xl">🎮</span> Почему оверлей не открывается в игре по кнопке F9?
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Для корректной работы оверлея поверх игры, ваша GTA 5 (или любая другая игра) должна быть запущена в режиме <span className="text-white font-medium">«В окне без рамок» (Windowed Borderless)</span> или <span className="text-white font-medium">«Оконный» (Windowed)</span>. 
                В полноэкранном (Fullscreen) режиме операционная система Windows жестко блокирует отрисовку сторонних окон поверх игры.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:border-[var(--blurple-alpha-30)] transition-all">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <span className="text-xl">✨</span> Как добавить свои собственные статьи?
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Вы можете добавлять статьи вручную по одной во вкладке <b>«Редактор»</b>, либо использовать наш <b>Умный Парсер</b>. Просто скопируйте весь текст законодательной базы прямо с форума проекта, вставьте его в парсер, и приложение само разобьет текст на статьи, вытащит названия, определит наказания и расставит звездочки приоритета розыска!
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

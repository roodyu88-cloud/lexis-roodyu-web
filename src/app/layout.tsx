import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Providers from "@/app/components/Providers";
import GlobalBanCheck from "@/app/components/GlobalBanCheck";

const inter = Inter({ subsets: ["latin", "cyrillic"] });
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const metadata: Metadata = {
  title: "Lexis Web | База пресетов",
  description: "Официальный сайт и база пресетов для справочника Lexis (GTA 5 RP)",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var theme = localStorage.getItem('lexis-theme');
            if (theme === 'glass') {
              document.documentElement.classList.add('theme-glass');
            } else {
              document.documentElement.classList.remove('theme-glass');
            }
          })();
        ` }} />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col justify-between`}>
        <Providers>
          <GlobalBanCheck />
          <div className="flex-1 flex flex-col w-full">
            <Navbar session={session} />
            <div className="pt-20 flex-1">
              {children}
            </div>
          </div>
        </Providers>
        
        {/* Premium footer */}
        <footer className="w-full py-8 px-6 mt-16 border-t border-white/5 bg-black/40 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <div>
              &copy; {new Date().getFullYear()} Lexis Web. Все права защищены.
            </div>
            <div className="flex gap-6">
              <Link href="/promo" className="hover:text-white transition-colors text-[#5865F2]">
                Акция LEXS
              </Link>
              <Link href="/rules" className="hover:text-white transition-colors">
                Правила пресетов
              </Link>
              <Link href="/tos" className="hover:text-white transition-colors">
                Пользовательское соглашение
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Политика конфиденциальности
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}


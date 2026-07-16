import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Providers from "@/app/components/Providers";
import GlobalBanCheck from "@/app/components/GlobalBanCheck";
import SettingsFab from "@/app/components/SettingsFab";
import { Sparkles } from "lucide-react";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter-loaded" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono-loaded" });

export const metadata: Metadata = {
  title: "Lexis Web | База пресетов",
  description: "Официальный сайт и база пресетов для справочника Lexis (GTA 5 RP)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning className={`${inter.variable} ${geistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var theme = localStorage.getItem('lexis-theme');
            if (theme === 'glass') {
              document.documentElement.classList.add('theme-glass');
            } else {
              document.documentElement.classList.remove('theme-glass');
            }
            var accent = localStorage.getItem('lexis-accent');
            if (accent) {
              document.documentElement.style.setProperty('--color-coral-pulse', accent);
              document.documentElement.style.setProperty('--color-coral-text', accent);
            }
          })();
        ` }} />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col justify-between`}>
        <Providers>
          <GlobalBanCheck />
          <div className="flex-1 flex flex-col w-full">
            <Navbar />
            <div className="pt-20 flex-1">
              {children}
            </div>
          </div>
          <SettingsFab />
        </Providers>

        {/* Premium footer */}
        <footer
          className="w-full py-8 px-6 mt-16 relative"
          style={{ borderTop: "1px solid var(--color-hairline)", background: "var(--color-ink)" }}
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-body" style={{ color: "var(--color-smoke)" }}>
            <div className="rc-eyebrow">
              &copy; {new Date().getFullYear()} Lexis Web. Все права защищены.
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <Link
                href="/promo"
                className="inline-flex items-center gap-1.5 font-semibold transition-colors hover:text-[var(--color-coral-text)]"
                style={{ color: "var(--color-pure-white)" }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Акция LEXS
              </Link>
              <Link href="/rules" className="transition-colors hover:text-[var(--color-pure-white)]">
                Правила пресетов
              </Link>
              <Link href="/tos" className="transition-colors hover:text-[var(--color-pure-white)]">
                Пользовательское соглашение
              </Link>
              <Link href="/privacy" className="transition-colors hover:text-[var(--color-pure-white)]">
                Политика конфиденциальности
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}


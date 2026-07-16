"use client";

import { useRouter } from "next/navigation";
import { useDevAuth } from "@/app/components/DevAuthProvider";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { setRole } = useDevAuth();
  const router = useRouter();

  const handleDiscordLogin = () => {
    setIsLoading(true);
    setRole("user");
    router.push("/");
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center p-4 relative overflow-hidden z-0">
      {/* Ambient background glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[130px] pointer-events-none -z-10" style={{ background: "rgba(124, 108, 240, 0.08)" }} aria-hidden="true" />
      <div className="fixed bottom-0 right-[10%] w-[400px] h-[400px] rounded-full blur-[130px] pointer-events-none -z-10" style={{ background: "rgba(124, 108, 240, 0.05)" }} aria-hidden="true" />

      {/* Main Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="rc-card-edge p-8 relative overflow-hidden" style={{ background: "var(--color-ink)" }}>

          {/* Shine effect */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          {/* Logo / Header */}
          <div className="text-center mb-10 relative">
            <h1 className="text-4xl font-extrabold mb-2 tracking-tight" style={{ color: "var(--color-pure-white)" }}>
              LEXIS
            </h1>
            <p className="text-sm" style={{ color: "var(--color-ash)" }}>
              Войдите, чтобы получить доступ к панели и инструментам
            </p>
          </div>

          {/* Login Button */}
          <button
            onClick={handleDiscordLogin}
            disabled={isLoading}
            className="rc-btn w-full relative group overflow-hidden rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
          >
            <div className="relative flex items-center justify-center gap-3 px-6 py-4">
              {isLoading ? (
                <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "var(--overlay-soft-strong)", borderTopColor: "var(--color-iron)" }} />
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
              )}
              <span className="font-semibold text-lg">
                {isLoading ? "Подключение..." : "Войти через Discord"}
              </span>
            </div>
          </button>

          {/* Footer */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="rc-link inline-flex items-center gap-1.5 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> На главную
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

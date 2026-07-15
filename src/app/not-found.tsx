import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow effect */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "rgba(124, 108, 240, 0.06)" }}
      />

      <div
        className="rc-card-edge relative z-10 flex flex-col items-center text-center px-8 py-14 md:px-16 md:py-16 max-w-xl w-full animate-fade-in"
        style={{ background: "var(--color-ink)" }}
      >
        <div
          className="text-[110px] md:text-[160px] font-black leading-none select-none tracking-tighter"
          style={{ color: "var(--color-hairline)" }}
        >
          404
        </div>

        <div className="w-16 h-px my-8" style={{ background: "var(--color-hairline)" }} />

        <h1 className="text-heading font-bold mb-4 tracking-tight" style={{ color: "var(--color-pure-white)" }}>
          Страница не найдена
        </h1>

        <p className="text-body-lg max-w-md mb-10" style={{ color: "var(--color-ash)" }}>
          Похоже, вы забрели не туда. Закон не предусматривает нахождение на этой странице, либо она была удалена.
        </p>

        <Link href="/" className="rc-btn group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" strokeWidth={2.25} />
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}

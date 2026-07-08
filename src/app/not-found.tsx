import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0D14] px-4 relative overflow-hidden text-white">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5865F2]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#4752C4]/30 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center animate-fade-in">
        <div className="text-[150px] md:text-[200px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 select-none tracking-tighter drop-shadow-2xl">
          404
        </div>
        
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-[#5865F2] to-transparent my-8 opacity-70" />

        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
          Страница не найдена
        </h1>
        
        <p className="text-gray-400 max-w-md mb-10 text-base md:text-lg">
          Похоже, вы забрели не туда. Закон не предусматривает нахождение на этой странице, либо она была удалена.
        </p>

        <Link 
          href="/" 
          className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 bg-[#5865F2] border border-transparent rounded-full shadow-lg hover:bg-[#4752C4] hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5865F2] focus:ring-offset-[#0B0D14]"
        >
          <svg className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}

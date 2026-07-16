"use client";

import { useEffect, useRef, useState } from "react";
import { Settings2, Check } from "lucide-react";
import { useDevAuth } from "./DevAuthProvider";
import { DEV_ROLE_LABELS, DevRole } from "@/lib/devAuth";

const ACCENTS: { name: string; hex: string; textHex: string }[] = [
  { name: "Фиолетовый", hex: "#7c6cf0", textHex: "#7c6cf0" },
  { name: "Коралл", hex: "#ff6363", textHex: "#ff6363" },
  { name: "Небо", hex: "#63a1ff", textHex: "#63a1ff" },
  { name: "Мята", hex: "#59d499", textHex: "#59d499" },
  { name: "Янтарь", hex: "#f5a623", textHex: "#f5a623" },
  { name: "Розовый", hex: "#ec6ba0", textHex: "#ec6ba0" },
];

const ROLE_ORDER: DevRole[] = ["guest", "user", "admin"];

export default function SettingsFab() {
  const { role, setRole } = useDevAuth();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"classic" | "glass">("classic");
  const [accent, setAccent] = useState(ACCENTS[0].hex);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("lexis-theme") as "classic" | "glass";
    if (savedTheme) setTheme(savedTheme);

    const savedAccent = localStorage.getItem("lexis-accent");
    if (savedAccent) {
      setAccent(savedAccent);
      document.documentElement.style.setProperty("--color-coral-pulse", savedAccent);
      document.documentElement.style.setProperty("--color-coral-text", savedAccent);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "glass" ? "classic" : "glass";
    setTheme(newTheme);
    localStorage.setItem("lexis-theme", newTheme);
    if (newTheme === "glass") {
      document.documentElement.classList.add("theme-glass");
    } else {
      document.documentElement.classList.remove("theme-glass");
    }
  };

  const pickAccent = (hex: string) => {
    setAccent(hex);
    localStorage.setItem("lexis-accent", hex);
    document.documentElement.style.setProperty("--color-coral-pulse", hex);
    document.documentElement.style.setProperty("--color-coral-text", hex);
  };

  return (
    <div ref={rootRef} className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
      {open && (
        <div
          className="rc-card-edge !p-4 w-64 bg-[var(--color-ink)] animate-scale-up origin-bottom-right"
        >
          <div className="mb-4">
            <span className="rc-eyebrow block mb-2.5">Акцент</span>
            <div className="flex flex-wrap gap-2.5">
              {ACCENTS.map((a) => (
                <button
                  key={a.hex}
                  onClick={() => pickAccent(a.hex)}
                  title={a.name}
                  className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
                  style={{ background: a.hex, boxShadow: accent === a.hex ? `0 0 0 2px var(--color-ink), 0 0 0 4px ${a.hex}` : "none" }}
                >
                  {accent === a.hex && <Check className="w-3.5 h-3.5" style={{ color: "#140f2e" }} strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <span className="rc-eyebrow block mb-2.5">Тема</span>
            <div className="flex gap-2">
              <button
                onClick={() => theme !== "classic" && toggleTheme()}
                className={`flex-1 text-xs font-medium py-1.5 rounded-[var(--radius-lg)] transition-colors cursor-pointer ${theme === "classic" ? "bg-[var(--overlay-soft-strong)] text-[var(--color-pure-white)]" : "text-[var(--color-ash)] hover:text-[var(--color-pure-white)]"}`}
              >
                Темная
              </button>
              <button
                onClick={() => theme !== "glass" && toggleTheme()}
                className={`flex-1 text-xs font-medium py-1.5 rounded-[var(--radius-lg)] transition-colors cursor-pointer ${theme === "glass" ? "bg-[var(--overlay-soft-strong)] text-[var(--color-pure-white)]" : "text-[var(--color-ash)] hover:text-[var(--color-pure-white)]"}`}
              >
                Светлая
              </button>
            </div>
          </div>

          <div>
            <span className="rc-eyebrow block mb-2.5">Тестовая роль (dev)</span>
            <div className="flex flex-col gap-1">
              {ROLE_ORDER.map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex items-center justify-between text-xs font-medium px-2.5 py-1.5 rounded-[var(--radius-lg)] transition-colors cursor-pointer ${role === r ? "bg-[var(--overlay-soft-strong)] text-[var(--color-pure-white)]" : "text-[var(--color-ash)] hover:text-[var(--color-pure-white)] hover:bg-[var(--overlay-soft)]"}`}
                >
                  {DEV_ROLE_LABELS[r]}
                  {role === r && <Check className="w-3.5 h-3.5" style={{ color: "var(--color-coral-text)" }} strokeWidth={2.5} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 border border-[var(--color-hairline)]"
        style={{
          background: "color-mix(in srgb, var(--color-void-black) 72%, transparent)",
          backdropFilter: "blur(24px)",
          boxShadow: "var(--shadow-key)",
        }}
        title="Настройки оформления"
        aria-label="Настройки оформления"
      >
        <Settings2 className="w-4 h-4 transition-transform duration-300" style={{ color: "var(--color-coral-text)", transform: open ? "rotate(45deg)" : "none" }} strokeWidth={1.75} />
      </button>
    </div>
  );
}

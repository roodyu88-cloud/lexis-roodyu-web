"use client";

import { useState } from "react";
import { Trash2, Sparkles, AlertTriangle } from "lucide-react";

interface DeletePresetButtonProps {
  presetId: string;
  presetName: string;
  isAuthor: boolean;
  isModOrAdmin: boolean;
}

export default function DeletePresetButton({ presetId, presetName, isAuthor, isModOrAdmin }: DeletePresetButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [deletedSuccessfully, setDeletedSuccessfully] = useState(false);

  const handleDelete = async () => {
    if (!isAuthor && isModOrAdmin && (!reason || reason.trim() === "")) {
      setErrorMsg("Укажите причину удаления!");
      return;
    }

    setDeleting(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/presets/${presetId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      if (res.ok) {
        setDeletedSuccessfully(true);
        setTimeout(() => {
          window.location.href = "/presets";
        }, 1500);
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || "Не удалось удалить пресет");
        setDeleting(false);
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Произошла ошибка при отправке запроса");
      setDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-red-950/40 border border-red-500/30 hover:bg-red-600 hover:text-white text-red-400 font-semibold rounded-lg text-sm transition-all cursor-pointer flex items-center gap-1.5"
      >
        <Trash2 className="w-4 h-4" /> Удалить пресет
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
          style={{ background: "color-mix(in srgb, var(--color-void-black) 85%, transparent)", backdropFilter: "blur(12px)" }}
        >
          <div
            className="rc-card-edge max-w-md w-full mx-4 relative overflow-hidden animate-scale-up text-left"
            style={{ borderColor: "rgba(239, 68, 68, 0.2)", background: "var(--color-ink)", padding: "32px" }}
          >
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {deletedSuccessfully ? (
              <div className="text-center py-6 animate-scale-up">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-subheading font-bold text-[var(--color-pure-white)] mb-2">Пресет успешно удален</h3>
                <p className="text-[var(--color-ash)] text-sm">
                  Перенаправление обратно в базу пресетов...
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-subheading font-bold text-[var(--color-pure-white)] mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" /> Удаление пресета
                </h3>
                <p className="text-[var(--color-ash)] text-sm mb-4 leading-relaxed">
                  Вы собираетесь удалить пресет <strong className="text-[var(--color-pure-white)]">"{presetName}"</strong>.
                </p>

                {/* If moderator is deleting another person's preset, require reason */}
                {!isAuthor && isModOrAdmin ? (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider mb-2">
                        Укажите причину удаления (будет отправлена автору)
                      </label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Например: Пресет нарушает правила сайта, содержит оскорбления или спам..."
                        rows={3}
                        className="w-full bg-[var(--color-obsidian)] border border-[var(--color-hairline)] text-[var(--color-pure-white)] rounded-lg p-3 text-sm outline-none focus:border-red-500 transition-colors resize-none placeholder:text-[var(--color-smoke)]"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--color-ash)] mb-6">
                    Вы действительно хотите навсегда удалить свой пресет из базы данных? Это действие необратимо.
                  </p>
                )}

                {errorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-semibold mb-4 leading-normal">
                    {errorMsg}
                  </div>
                )}

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => { setShowModal(false); setReason(""); setErrorMsg(""); }}
                    className="flex-1 rc-btn-ghost text-sm cursor-pointer"
                    disabled={deleting}
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm py-2.5 transition-colors cursor-pointer flex items-center justify-center"
                  >
                    {deleting ? "Удаление..." : "Удалить"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

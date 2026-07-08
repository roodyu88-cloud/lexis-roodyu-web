"use client";

import { useState } from "react";

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
        🗑️ Удалить пресет
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="glass-card p-8 max-w-md w-full mx-4 border border-red-500/20 shadow-2xl relative overflow-hidden rounded-2xl animate-scale-up text-left">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {deletedSuccessfully ? (
              <div className="text-center py-6 animate-scale-up">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl">
                  ✨
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Пресет успешно удален</h3>
                <p className="text-gray-400 text-sm">
                  Перенаправление обратно в базу пресетов...
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  ⚠️ Удаление пресета
                </h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  Вы собираетесь удалить пресет <strong className="text-white">"{presetName}"</strong>.
                </p>

                {/* If moderator is deleting another person's preset, require reason */}
                {!isAuthor && isModOrAdmin ? (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Укажите причину удаления (будет отправлена автору)
                      </label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Например: Пресет нарушает правила сайта, содержит оскорбления или спам..."
                        rows={3}
                        className="w-full bg-black/50 border border-white/10 text-white rounded-lg p-3 text-sm outline-none focus:border-red-500 transition-colors resize-none placeholder-gray-600"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-300 mb-6">
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
                    className="flex-1 btn-secondary text-sm !py-2.5 cursor-pointer"
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

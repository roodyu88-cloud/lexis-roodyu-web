"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReleaseAdminActions({ releaseId }: { releaseId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить этот релиз?")) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/releases?id=${releaseId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Ошибка при удалении");
      }
    } catch (e) {
      console.error(e);
      alert("Ошибка при удалении");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    router.push(`/admin/releases/edit/${releaseId}`);
  };

  return (
    <div className="flex gap-2 mt-4">
      <button
        onClick={handleEdit}
        className="px-4 py-2 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs font-bold rounded-xl hover:bg-yellow-500/30 transition-all"
      >
        ✏️ Редактировать
      </button>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold rounded-xl hover:bg-red-500/30 transition-all disabled:opacity-50"
      >
        {isDeleting ? "Удаление..." : "🗑️ Удалить"}
      </button>
    </div>
  );
}

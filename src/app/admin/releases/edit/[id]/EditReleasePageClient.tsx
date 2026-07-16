"use client";

// PLACEHOLDER-DB (2026-07-15): unused while DB call below is placeholdered — restore with the query.
// import { prisma } from "@/lib/prisma";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDevSession } from "@/app/components/DevAuthProvider";
import EditReleaseForm from "./EditReleaseForm";

export default function EditReleasePageClient({ id }: { id: string }) {
  const { data: session, status } = useDevSession();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const isAdmin = (session?.user as any)?.role === "admin" || (session?.user as any)?.role === "developer";

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && !isAdmin)) {
      router.push("/");
    } else if (status === "authenticated" && isAdmin) {
      setChecked(true);
    }
  }, [status, isAdmin, router]);

  if (!checked) {
    return <div className="min-h-screen flex items-center justify-center text-sm animate-pulse" style={{ color: "var(--color-ash)" }}>Проверка доступа...</div>;
  }

  // PLACEHOLDER-DB (2026-07-15): DATABASE_URL absent in this dev env, real query crashes SSR.
  // Original: const release = await prisma.release.findUnique({ where: { id } });
  const release = {
    id, version: "v2.1.0", title: "Биндер и стабильность", description: "Placeholder-данные для превью без БД.\n- Добавлен биндер\n- Исправлены баги",
    downloadUrl: null, fileData: null, fileName: null, virusTotalUrl: null, createdAt: new Date("2026-07-01"),
  };

  return (
    <div className="min-h-screen bg-[var(--color-void-black)] text-[var(--color-pure-white)] p-4 sm:p-8 relative overflow-hidden z-0">
      <div className="max-w-2xl mx-auto z-10 relative">
        <h1 className="text-heading font-extrabold mb-8 tracking-[var(--tracking-heading-lg)]">
          Редактировать релиз
        </h1>
        <EditReleaseForm release={release} />
      </div>
    </div>
  );
}

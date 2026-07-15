// PLACEHOLDER-DB (2026-07-15): unused while DB call below is placeholdered — restore with the query.
// import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import EditReleaseForm from "./EditReleaseForm";

export default async function EditReleasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || ((session.user as any)?.role !== "admin" && (session.user as any)?.role !== "developer")) {
    redirect("/");
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

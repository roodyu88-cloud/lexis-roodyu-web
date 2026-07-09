import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import EditReleaseForm from "./EditReleaseForm";

export default async function EditReleasePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || ((session.user as any)?.role !== "admin" && (session.user as any)?.role !== "developer")) {
    redirect("/");
  }

  const release = await prisma.release.findUnique({
    where: { id: params.id }
  });

  if (!release) {
    return <div className="p-8 text-white">Релиз не найден</div>;
  }

  return (
    <div className="min-h-screen text-white p-8 relative overflow-hidden z-0">
      <div className="max-w-2xl mx-auto z-10 relative">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 tracking-tight">
          Редактировать релиз
        </h1>
        <EditReleaseForm release={release} />
      </div>
    </div>
  );
}

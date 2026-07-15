import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import TakeExamClient from "./TakeExamClient";

export default async function TakeExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    // Если не авторизован, можно перекинуть на логин и потом вернуть сюда
    redirect(`/api/auth/signin?callbackUrl=/exam/take/${id}`);
  }

  return (
    <div className="min-h-screen text-[var(--color-pure-white)]">
      <TakeExamClient examId={id} user={session.user} />
    </div>
  );
}

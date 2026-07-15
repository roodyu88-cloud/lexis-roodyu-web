import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ExamClient from "./ExamClient";
import { redirect } from "next/navigation";

export default async function ExamPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/exam");
  }

  const isPremium = (session.user as any).isPremium || false;

  return (
    <div className="min-h-screen text-[var(--color-pure-white)]">
      <ExamClient isPremium={isPremium} />
    </div>
  );
}

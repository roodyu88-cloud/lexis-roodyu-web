"use client";

import { useDevSession } from "@/app/components/DevAuthProvider";
import LoginRequiredCard from "@/app/components/LoginRequiredCard";
import TakeExamClient from "./TakeExamClient";

export default function TakeExamGate({ id }: { id: string }) {
  const { data: session, status } = useDevSession();

  if (status === "loading") return null;

  if (!session?.user) {
    return <LoginRequiredCard />;
  }

  return (
    <div className="min-h-screen text-[var(--color-pure-white)]">
      <TakeExamClient examId={id} user={session.user} />
    </div>
  );
}

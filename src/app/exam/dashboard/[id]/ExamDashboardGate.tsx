"use client";

import { useDevSession } from "@/app/components/DevAuthProvider";
import LoginRequiredCard from "@/app/components/LoginRequiredCard";
import DashboardClient from "./DashboardClient";

export default function ExamDashboardGate({ id }: { id: string }) {
  const { data: session, status } = useDevSession();

  if (status === "loading") return null;

  if (!session?.user) {
    return <LoginRequiredCard />;
  }

  return (
    <div className="min-h-screen text-[var(--color-pure-white)]">
      <DashboardClient examId={id} />
    </div>
  );
}

"use client";

import { useDevSession } from "@/app/components/DevAuthProvider";
import AssistantClient from "./AssistantClient";

export default function AssistantPage() {
  const { data: session } = useDevSession();
  const isAuthenticated = !!session?.user;
  const isPremium = (session?.user as any)?.isPremium || false;
  const isAdmin = (session?.user as any)?.role === "admin";

  return <AssistantClient isAuthenticated={isAuthenticated} isPremium={isPremium} isAdmin={isAdmin} />;
}

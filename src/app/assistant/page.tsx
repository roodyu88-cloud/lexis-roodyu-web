import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AssistantClient from "./AssistantClient";

export default async function AssistantPage() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session?.user;
  const isPremium = (session?.user as any)?.isPremium || false;
  const isAdmin = (session?.user as any)?.role === "admin";

  return <AssistantClient isAuthenticated={isAuthenticated} isPremium={isPremium} isAdmin={isAdmin} />;
}

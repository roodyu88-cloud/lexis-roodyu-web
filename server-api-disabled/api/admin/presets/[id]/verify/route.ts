import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Middleware check for admin
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  
  const discordId = (session.user as any).id;
  const role = (session.user as any).role;
  
  if (role === "admin" || role === "developer" || discordId === "546005790864048140") {
    return session;
  }
  return null;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const { isVerified } = body;

    const preset = await prisma.preset.update({
      where: { id },
      data: { isVerified: Boolean(isVerified) },
    });

    return NextResponse.json({ preset });
  } catch (e) {
    console.error("Error verifying preset:", e);
    return NextResponse.json({ error: "Failed to verify preset" }, { status: 500 });
  }
}

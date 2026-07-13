import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Middleware-like check for admin
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

export async function GET() {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ users });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { discordId, role, badges, canUpload, isBanned, banReason } = body;

    if (!discordId) {
      return NextResponse.json({ error: "Missing discordId" }, { status: 400 });
    }

    // Safety check: Do not allow changing the root admin's role
    const rootAdminId = "546005790864048140";
    let updatedRole = role;
    if (discordId === rootAdminId) {
      updatedRole = "admin";
    }

    const updatedUser = await prisma.user.update({
      where: { discordId },
      data: {
        role: updatedRole,
        badges: badges ? JSON.stringify(badges) : undefined,
        canUpload: canUpload !== undefined ? canUpload : undefined,
        isBanned: isBanned !== undefined ? isBanned : undefined,
        banReason: banReason !== undefined ? banReason : undefined,
        ...(body.revokePremium ? {
          isPremium: false,
          premiumUntil: null,
        } : {}),
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (e) {
    console.error("Error updating user:", e);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

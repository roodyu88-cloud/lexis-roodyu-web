import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const discordId = (session.user as any).id;

  try {
    const notifications = await prisma.notification.findMany({
      where: { discordId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ notifications });
  } catch (e) {
    console.error("Failed to fetch notifications:", e);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const discordId = (session.user as any).id;

  try {
    await prisma.notification.updateMany({
      where: { discordId, read: false },
      data: { read: true },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Failed to mark notifications as read:", e);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}

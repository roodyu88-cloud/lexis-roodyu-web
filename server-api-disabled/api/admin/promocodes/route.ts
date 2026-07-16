import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return false;
  const role = (session.user as any).role;
  const discordId = (session.user as any).id;
  return role === "admin" || role === "developer" || discordId === "546005790864048140";
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { code, days, maxUses } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    // Check if code already exists
    const existing = await prisma.promocode.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ error: "Этот промокод уже существует" }, { status: 400 });
    }

    const promocode = await prisma.promocode.create({
      data: {
        code,
        days: days || 30,
        maxUses: maxUses || 1,
      }
    });

    return NextResponse.json({ promocode });
  } catch (error) {
    console.error("Promocode create error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.promocode.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Promocode delete error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

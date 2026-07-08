import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const role = (session.user as any).role;
  const discordId = (session.user as any).id;
  
  if (role !== "admin" && role !== "developer" && discordId !== "546005790864048140") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { key, value } = await req.json();
    if (!key) return NextResponse.json({ error: "Key is required" }, { status: 400 });

    const setting = await prisma.appSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });

    return NextResponse.json({ setting });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

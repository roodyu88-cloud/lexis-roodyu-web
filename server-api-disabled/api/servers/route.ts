import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const servers = await prisma.serverProject.findMany({
      orderBy: { name: "asc" },
      include: { servers: true }
    });
    return NextResponse.json({ servers });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch servers" }, { status: 500 });
  }
}

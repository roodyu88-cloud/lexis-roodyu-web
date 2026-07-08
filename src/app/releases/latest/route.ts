import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const latestRelease = await prisma.release.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!latestRelease) {
      return NextResponse.redirect(new URL("/releases", process.env.NEXTAUTH_URL || "http://localhost:3000"));
    }

    return NextResponse.redirect(new URL(`/api/releases/download/${latestRelease.id}`, process.env.NEXTAUTH_URL || "http://localhost:3000"));
  } catch (error) {
    console.error("Error fetching latest release:", error);
    return NextResponse.redirect(new URL("/releases", process.env.NEXTAUTH_URL || "http://localhost:3000"));
  }
}

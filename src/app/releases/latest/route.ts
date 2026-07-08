import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const latestRelease = await prisma.release.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!latestRelease || !latestRelease.downloadUrl) {
      return NextResponse.redirect(new URL("/releases", process.env.NEXTAUTH_URL || "http://localhost:3000"));
    }

    return NextResponse.redirect(latestRelease.downloadUrl);
  } catch (error) {
    console.error("Error fetching latest release:", error);
    return NextResponse.redirect(new URL("/releases", process.env.NEXTAUTH_URL || "http://localhost:3000"));
  }
}

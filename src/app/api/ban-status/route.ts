import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ isBanned: false, banReason: null });
    }

    const discordId = (session.user as any).id;
    if (!discordId) {
      return NextResponse.json({ isBanned: false, banReason: null });
    }

    const user = await prisma.user.findUnique({
      where: { discordId },
      select: { isBanned: true, banReason: true }
    });

    const discordUrlSetting = await prisma.appSetting.findUnique({
      where: { key: "discordUrl" }
    });
    const discordUrl = discordUrlSetting?.value || "https://dsc.gg/lexis";

    if (user && user.isBanned) {
      return NextResponse.json({ isBanned: true, banReason: user.banReason, discordUrl });
    }

    return NextResponse.json({ isBanned: false, banReason: null, discordUrl });
  } catch (e) {
    console.error("Error checking ban status:", e);
    // On error, default to not banned so we don't accidentally block everyone
    return NextResponse.json({ isBanned: false, banReason: null });
  }
}

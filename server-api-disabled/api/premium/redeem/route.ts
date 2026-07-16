import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const discordId = (session.user as any).id;

  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Введите промокод" }, { status: 400 });
    }

    // Find promocode
    const promocode = await prisma.promocode.findUnique({ where: { code } });

    if (!promocode) {
      return NextResponse.json({ error: "Промокод не найден" }, { status: 404 });
    }

    if (promocode.uses >= promocode.maxUses) {
      return NextResponse.json({ error: "Лимит активаций этого промокода исчерпан" }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({ where: { discordId } });
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    // Calculate new premium Until date
    const now = new Date();
    let currentUntil = user.premiumUntil ? new Date(user.premiumUntil) : now;
    
    // If premium has already expired, start from now
    if (currentUntil < now) {
      currentUntil = now;
    }

    // Add days
    currentUntil.setDate(currentUntil.getDate() + promocode.days);

    // Update user
    await prisma.user.update({
      where: { discordId },
      data: {
        isPremium: true,
        premiumUntil: currentUntil
      }
    });

    // Increment uses
    await prisma.promocode.update({
      where: { id: promocode.id },
      data: {
        uses: { increment: 1 }
      }
    });

    return NextResponse.json({ success: true, days: promocode.days });

  } catch (error) {
    console.error("Promocode redeem error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

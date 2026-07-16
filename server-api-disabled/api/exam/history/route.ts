import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
        return NextResponse.json({ error: 'Доступ запрещен.' }, { status: 401 });
    }

    const discordId = session.user.id || (session.user as any).discordId || session.user.email;
    if (!discordId) {
        return NextResponse.json({ error: 'ID пользователя не найден.' }, { status: 400 });
    }

    try {
        const history = await prisma.examSession.findMany({
            where: { creatorId: discordId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { results: true }
                }
            }
        });

        return NextResponse.json(history);
    } catch (error: any) {
        console.error("Exam History Error:", error);
        return NextResponse.json({ error: "Ошибка при получении истории тестов." }, { status: 500 });
    }
}

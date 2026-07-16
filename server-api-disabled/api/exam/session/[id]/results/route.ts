import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
        return NextResponse.json({ error: 'Требуется авторизация.' }, { status: 401 });
    }

    const discordId = session.user.id || (session.user as any).discordId || session.user.email;

    try {
        const examSession = await prisma.examSession.findUnique({
            where: { id: id }
        });

        if (!examSession) {
            return NextResponse.json({ error: 'Экзамен не найден.' }, { status: 404 });
        }

        // Проверяем права: только создатель может смотреть результаты (или админ)
        if (examSession.creatorId !== discordId) {
            // Для безопасности: если это не создатель, он не должен видеть чужие результаты.
            // Можно добавить проверку на админа, но пока так.
            return NextResponse.json({ error: 'У вас нет прав для просмотра результатов этого экзамена.' }, { status: 403 });
        }

        const results = await prisma.examResult.findMany({
            where: { examSessionId: id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            exam: {
                faction: examSession.faction,
                difficulty: examSession.difficulty,
                questionCount: examSession.questionCount,
                isActive: examSession.isActive,
                createdAt: examSession.createdAt
            },
            results: results.map(r => ({
                id: r.id,
                candidateName: r.candidateName,
                candidateAvatar: r.candidateAvatar,
                score: r.score,
                totalQuestions: r.totalQuestions,
                answersData: JSON.parse(r.answersData),
                createdAt: r.createdAt
            }))
        });

    } catch (error: any) {
        console.error("Exam Results GET Error:", error);
        return NextResponse.json({ error: "Системная ошибка." }, { status: 500 });
    }
}

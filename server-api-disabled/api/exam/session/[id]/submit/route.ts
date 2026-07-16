import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
        return NextResponse.json({ error: 'Требуется авторизация.' }, { status: 401 });
    }

    const discordId = session.user.id || (session.user as any).discordId || session.user.email;
    const userName = session.user.name || "Unknown";
    const userAvatar = session.user.image || "";

    try {
        const { answers } = await req.json(); // answers: number[] (индексы выбранных ответов)

        if (!Array.isArray(answers)) {
            return NextResponse.json({ error: 'Неверный формат ответов.' }, { status: 400 });
        }

        const examSession = await prisma.examSession.findUnique({
            where: { id: id }
        });

        if (!examSession) {
            return NextResponse.json({ error: 'Экзамен не найден.' }, { status: 404 });
        }

        // Проверяем, не проходил ли он уже этот тест
        const existingResult = await prisma.examResult.findFirst({
            where: {
                examSessionId: id,
                candidateDiscordId: discordId
            }
        });

        if (existingResult) {
            return NextResponse.json({ error: 'Вы уже прошли этот тест.' }, { status: 403 });
        }

        const questionsData = JSON.parse(examSession.questionsData);
        
        let score = 0;
        const detailedResults = questionsData.map((q: any, index: number) => {
            const chosen = answers[index];
            const isCorrect = chosen === q.correctAnswerIndex;
            if (isCorrect) score++;

            // Если экзаменатор запретил показ ответов, скрываем explanation и correctAnswerIndex для кандидата
            if (!examSession.showAnswersAtEnd) {
                return {
                    question: q.question,
                    chosenIndex: chosen,
                    isCorrect: isCorrect
                };
            }

            return {
                question: q.question,
                chosenIndex: chosen,
                correctAnswerIndex: q.correctAnswerIndex,
                isCorrect: isCorrect,
                explanation: q.explanation,
                options: q.options
            };
        });

        // Сохраняем результат
        await prisma.examResult.create({
            data: {
                examSessionId: id,
                candidateDiscordId: discordId,
                candidateName: userName,
                candidateAvatar: userAvatar,
                score: score,
                totalQuestions: questionsData.length,
                answersData: JSON.stringify(detailedResults) // Сохраняем подробный JSON для истории
            }
        });

        return NextResponse.json({
            success: true,
            score: score,
            total: questionsData.length,
            showAnswersAtEnd: examSession.showAnswersAtEnd,
            detailedResults: detailedResults
        });

    } catch (error: any) {
        console.error("Exam Submit Error:", error);
        return NextResponse.json({ error: "Системная ошибка при отправке результатов." }, { status: 500 });
    }
}

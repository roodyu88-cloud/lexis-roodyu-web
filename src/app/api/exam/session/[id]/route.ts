import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    // Кандидат должен быть авторизован
    if (!session?.user) {
        return NextResponse.json({ error: 'Требуется авторизация.' }, { status: 401 });
    }

    try {
        const examSession = await prisma.examSession.findUnique({
            where: { id: id }
        });

        if (!examSession) {
            return NextResponse.json({ error: 'Экзамен не найден.' }, { status: 404 });
        }

        if (!examSession.isActive) {
            return NextResponse.json({ error: 'Этот экзамен завершен или деактивирован.' }, { status: 403 });
        }

        const questionsData = JSON.parse(examSession.questionsData);
        
        // Вырезаем правильные ответы из JSON для безопасности
        const sanitizedQuestions = questionsData.map((q: any) => {
            return {
                question: q.question,
                options: q.options
            };
        });

        return NextResponse.json({
            id: examSession.id,
            faction: examSession.faction,
            difficulty: examSession.difficulty,
            questionCount: examSession.questionCount,
            questions: sanitizedQuestions
        });

    } catch (error: any) {
        console.error("Exam Session GET Error:", error);
        return NextResponse.json({ error: "Системная ошибка." }, { status: 500 });
    }
}

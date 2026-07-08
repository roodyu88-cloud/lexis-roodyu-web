import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { SERVERS } from '../../assistant/serverLaws';

// Функция для загрузки текста из файла
const getFileContent = (filename: string) => {
    try {
        const filePath = path.join(process.cwd(), filename);
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, 'utf-8');
        }
    } catch (e) {
        console.error(`Не удалось загрузить файл ${filename}`, e);
    }
    return '';
};

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    
    // Проверка авторизации
    if (!session?.user) {
        return NextResponse.json({ error: 'Доступ запрещен. Авторизуйтесь на сайте.' }, { status: 401 });
    }

    const discordId = session.user.id || (session.user as any).discordId || session.user.email;
    if (!discordId) {
        return NextResponse.json({ error: 'Ошибка получения ID пользователя.' }, { status: 400 });
    }

    // Проверка Premium
    const isPremium = (session.user as any).isPremium || false;
    
    // Лимиты: если не премиум, максимум 3 теста за 24 часа
    if (!isPremium) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const testCount = await prisma.examSession.count({
            where: {
                creatorId: discordId,
                createdAt: {
                    gte: yesterday
                }
            }
        });
        
        if (testCount >= 3) {
            return NextResponse.json({ 
                error: 'Вы исчерпали дневной лимит создания тестов (3/3). Приобретите Premium для безлимитного создания экзаменов.' 
            }, { status: 403 });
        }
    }

    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ error: 'API ключ Gemini не настроен.' }, { status: 500 });
    }

    try {
        const { serverId, faction, difficulty, questionCount, showAnswersAtEnd } = await req.json();

        if (!serverId || !faction) {
            return NextResponse.json({ error: 'Не указан сервер или фракция.' }, { status: 400 });
        }

        const count = parseInt(questionCount) || 5;
        if (count < 5 || count > 20) {
            return NextResponse.json({ error: 'Количество вопросов должно быть от 5 до 20.' }, { status: 400 });
        }

        const validDifficulties = ['easy', 'medium', 'hard'];
        const diff = validDifficulties.includes(difficulty) ? difficulty : 'medium';

        // Загружаем все законы выбранного сервера
        const serverInfo = SERVERS.find(s => s.id === serverId) || SERVERS[0];
        let lawContent = "";
        
        // Чтобы не выбить лимит контекста, выберем нужные файлы с помощью ИИ
        let targetFiles: string[] = [];
        
        const fileDescriptions: Record<string, string> = {
            'uk': 'Уголовный кодекс', 'proc': 'Процессуальный кодекс, задержания', 'konst': 'Конституция',
            'adk': 'Административный кодекс', 'advokat': 'Адвокатура', 'chp': 'Закон о ЧП/ВП',
            'dk': 'Дорожный кодекс, ПДД', 'ems': 'Медицина, ЕМС', 'etk': 'Этика, дресс-код',
            'fib': 'ФИБ, ФБР', 'gosnag': 'Госнаграды', 'gostay': 'Гостайна', 'grak': 'Гражданский кодекс',
            'gun': 'Оружие', 'miting': 'Митинги', 'nej': 'Нежелательные организации',
            'neprikos': 'Неприкосновенность', 'ogp': 'Прокуратура', 'order': 'Ордера, рейды',
            'organ': 'Органы власти', 'orm': 'ОРМ, розыск', 'prav': 'Правительство, мэрия',
            'predp': 'Бизнес', 'prodr': 'Процессуальные действия', 'sang': 'Армия, нацгвардия',
            'senat': 'Сенат', 'sredmass': 'СМИ', 'sudk': 'Судебный кодекс, иски',
            'ter': 'Территории, КПЗ', 'trudk': 'Трудовой кодекс, увольнения', 'usss': 'Секретная служба'
        };

        if (process.env.GROQ_API_KEY) {
            try {
                const availableFilesStr = serverInfo.files.map((f: string) => {
                    const base = f.split('/').pop()?.replace('.txt', '') || '';
                    return `- ${base}: ${fileDescriptions[base] || 'Закон'}`;
                }).join('\n');

                const routerPrompt = `Ты - система маршрутизации для создания экзамена. Выбери из списка законов те, которые критически необходимы для проверки знаний кандидата во фракцию/отдел: "${faction}".
Доступные законы:
${availableFilesStr}
ВЕРНИ ТОЛЬКО НАЗВАНИЯ ФАЙЛОВ через запятую (например: uk, proc, gun). Не пиши ничего больше. Выбирай от 3 до 6 самых важных законов.`;

                const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST", headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: routerPrompt }], temperature: 0.1, max_tokens: 50 })
                });
                
                if (groqRes.ok) {
                    const groqData = await groqRes.json();
                    const routerText = groqData.choices[0]?.message?.content || "";
                    targetFiles = routerText.toLowerCase().split(',').map((s: string) => s.trim().replace(/[^a-z0-9_]/g, '')).filter(Boolean);
                } else {
                    console.error("Groq Exam Router API error:", await groqRes.text());
                }
            } catch (e) { console.error("Groq Exam Router failed", e); }
        }

        // Запасная эвристика, если ИИ-маршрутизатор упал
        if (targetFiles.length === 0) {
            const factionLower = faction.toLowerCase();
            
            if (factionLower === 'lspd' || factionLower === 'fib' || factionLower === 'lssd') {
                targetFiles = ['uk', 'proc', 'adk', 'gun', factionLower];
            } else if (factionLower === 'gov' || factionLower === 'usss' || factionLower === 'judiciary') {
                targetFiles = ['konst', 'sudk', 'advokat', 'grak', 'trudk', 'prav', 'usss'];
            } else if (factionLower === 'ems') {
                targetFiles = ['ems', 'etk', 'trudk'];
            } else if (factionLower === 'sang') {
                targetFiles = ['sang', 'gun', 'ter', 'uk'];
            } else if (factionLower === 'wn' || factionLower === 'weazel news') {
                targetFiles = ['sredmass', 'etk', 'trudk'];
            } else {
                targetFiles = ['uk', 'proc', 'adk', 'konst'];
            }
        }

        for (const f of serverInfo.files) {
            const baseName = f.split('/').pop()?.replace('.txt', '') || '';
            if (targetFiles.includes(baseName) || targetFiles.some(tf => baseName.includes(tf))) {
                lawContent += `\n\n--- ДОКУМЕНТ: ${f.toUpperCase()} ---\n` + getFileContent(f);
            }
        }

        // Если не удалось найти специфичные файлы, берем любые первые 3
        if (!lawContent) {
            for (let i = 0; i < Math.min(3, serverInfo.files.length); i++) {
                lawContent += `\n\n--- ДОКУМЕНТ: ${serverInfo.files[i].toUpperCase()} ---\n` + getFileContent(serverInfo.files[i]);
            }
        }

        // Настройка сложности
        let difficultyPrompt = "";
        if (diff === 'easy') {
            difficultyPrompt = "Вопросы должны быть БАЗОВЫМИ, на знание простых определений и самых частых статей. Варианты ответов должны быть очевидными (1 правильный, 3 явно нелепых).";
        } else if (diff === 'medium') {
            difficultyPrompt = "Вопросы должны быть СРЕДНЕЙ СЛОЖНОСТИ. Включай ситуации из ролеплей процесса, где игроку нужно применить закон.";
        } else if (diff === 'hard') {
            difficultyPrompt = "Вопросы должны быть ОЧЕНЬ СЛОЖНЫМИ (УРОВЕНЬ ПРОКУРАТУРЫ). Моделируй запутанные ситуации, включай исключения из правил, ссылки на подпункты. Варианты ответов должны быть очень похожи друг на друга, чтобы запутать кандидата.";
        }

        // Собираем промпт
        const systemPrompt = `Ты — строгий экзаменатор (Главный инструктор).
Твоя задача сгенерировать ровно ${count} тестовых вопросов для вступления/повышения во фракцию: ${faction.toUpperCase()}.
${difficultyPrompt}

Законы штата предоставлены ниже. Ты должен опираться ТОЛЬКО на эти тексты. НЕ придумывай свои законы, фракции (например, Sheriff Department, если его нет в тексте) или правила.
Все 4 варианта ответа должны быть ПРИМЕРНО ОДИНАКОВЫМИ ПО ДЛИНЕ (объему символов). Правильный ответ НЕ ДОЛЖЕН выделяться тем, что он длиннее или подробнее остальных. Это критически важно, чтобы кандидат не мог угадать ответ по размеру текста.
Каждый вопрос должен иметь 4 варианта ответа, только один из которых правильный.
Ты ОБЯЗАН вернуть результат строго в формате JSON, без маркдаун-оберток (без \`\`\`json).

Структура JSON:
{
  "questions": [
    {
      "question": "Текст вопроса",
      "options": ["Вариант 1 (длина 1)", "Вариант 2 (примерно такой же длины)", "Вариант 3 (примерно такой же длины)", "Вариант 4 (примерно такой же длины)"],
      "correctAnswerIndex": 0, // Индекс правильного ответа от 0 до 3
      "explanation": "Объяснение, почему этот ответ правильный, со ссылкой на статью."
    }
  ]
}

ЗАКОНОДАТЕЛЬНАЯ БАЗА:
${lawContent.substring(0, 100000)} // Ограничиваем длину
`;

        let parsedJson;
        let aiSuccess = false;

        // Попытка 0: Локальная нейросеть (Ollama), если настроена
        if (process.env.LOCAL_AI_URL && process.env.LOCAL_AI_MODEL) {
            try {
                const localResponse = await fetch(process.env.LOCAL_AI_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        model: process.env.LOCAL_AI_MODEL,
                        messages: [
                            { role: "system", content: "Ты строгий экзаменатор, возвращающий только чистый JSON." },
                            { role: "user", content: systemPrompt.substring(0, 100000) }
                        ],
                        temperature: 0.7,
                        format: "json" // Поддержка JSON mode в Ollama
                    })
                });

                if (localResponse.ok) {
                    const localData = await localResponse.json();
                    const localText = localData.choices[0]?.message?.content;
                    if (localText) {
                        try {
                            parsedJson = JSON.parse(localText);
                            if (parsedJson.questions && Array.isArray(parsedJson.questions) && parsedJson.questions.length > 0) {
                                aiSuccess = true;
                            }
                        } catch (e) {
                            console.error("Failed to parse Local AI JSON:", localText);
                        }
                    }
                } else {
                    console.error("Local AI Error, falling back to Gemini:", await localResponse.text());
                }
            } catch (localError) {
                console.error("Local AI Fetch Error, falling back to Gemini:", localError);
            }
        }

        // Попытка 1: Gemini (Fallback)
        if (!aiSuccess) {
            const geminiKeys = [
                process.env.GEMINI_API_KEY,
                process.env.GEMINI_API_KEY_2,
                process.env.GEMINI_API_KEY_3,
                process.env.GEMINI_API_KEY_4,
                process.env.GEMINI_API_KEY_5
            ].filter(Boolean) as string[];

            const randomKey = geminiKeys[Math.floor(Math.random() * geminiKeys.length)];

            const genAI = new GoogleGenerativeAI(randomKey);
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash",
                systemInstruction: "Ты строгий экзаменатор, возвращающий только чистый JSON."
            });

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });

            const responseText = result.response.text();
            
            try {
                parsedJson = JSON.parse(responseText);
                if (!parsedJson.questions || !Array.isArray(parsedJson.questions) || parsedJson.questions.length === 0) {
                     throw new Error("Неверный формат от ИИ: нет массива questions");
                }
                aiSuccess = true;
            } catch (parseError) {
                console.error("Failed to parse JSON from Gemini:", responseText);
                return NextResponse.json({ error: "ИИ вернул некорректный формат данных. Попробуйте еще раз." }, { status: 500 });
            }
        }

        // Сохраняем в БД
        const examSession = await prisma.examSession.create({
            data: {
                creatorId: discordId,
                serverId: serverId,
                faction: faction,
                difficulty: diff,
                questionCount: parsedJson.questions.length,
                questionsData: JSON.stringify(parsedJson.questions),
                showAnswersAtEnd: Boolean(showAnswersAtEnd),
                isActive: true
            }
        });

        return NextResponse.json({ 
            success: true, 
            examId: examSession.id 
        });

    } catch (error: any) {
        console.error("Exam Generate Error:", error);
        return NextResponse.json({ error: "Произошла системная ошибка при генерации вопросов." }, { status: 500 });
    }
}

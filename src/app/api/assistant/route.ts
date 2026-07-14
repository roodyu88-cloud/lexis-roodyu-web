import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SERVERS } from './serverLaws';
import * as fs from 'fs';
import * as path from 'path';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Функция для безопасной загрузки текстов из файлов (с обходом бага Next.js NFT tracing)

async function processAiResponse(text: string, serverInfo: any, isPremium: boolean, discordId: string, authorName: string) {
    const match = text.match(/\[CREATE_PRESET:\s*(.+?)\]/i);
    if (!match) {
        return NextResponse.json({ response: text });
    }

    const laws = match[1].split(',').map(s => s.trim().toLowerCase());
    
    if (!isPremium && laws.length > 3) {
        const errorMsg = "К сожалению, без Premium-подписки вы можете добавить максимум 3 закона в пресет.";
        const cleanText = text.replace(/\[CREATE_PRESET:\s*(.+?)\]/i, errorMsg);
        return NextResponse.json({ response: cleanText });
    }

    // Process files
    let presetData: any[] = [];
    for (const law of laws) {
        const file = serverInfo.files.find((f: string) => {
            const baseName = f.split('/').pop()?.replace('.txt', '').toLowerCase() || '';
            const isShorthand = 
                (law === 'uk' || law === 'ук') && baseName.includes('уголовн') ||
                (law === 'proc' || law === 'пк') && baseName.includes('процессуал') ||
                (law === 'dk' || law === 'дк') && baseName.includes('дорожн') ||
                (law === 'ak' || law === 'ак') && baseName.includes('административн') ||
                (law === 'konst') && baseName.includes('конституц');
            return baseName.includes(law) || law.includes(baseName) || isShorthand;
        });
        if (!file) continue;

        const content = getFileContent(file);
        if (!content) continue;

        const lawTitle = file.split('/').pop()?.replace('.txt', '') || 'Закон';
        
        const lines = content.split('\n');
        let currentCategory = { name: lawTitle, articles: [] as any[] };
        let currentArticle: { title: string; text: string } | null = null;
        
        for (let line of lines) {
            line = line.trim();
            if (!line) continue;
            
            if ((line.startsWith('Статья') || line.startsWith('Глава') || line.startsWith('Раздел')) && !line.includes('ч.')) {
               if (currentArticle) currentCategory.articles.push(currentArticle);
               currentArticle = { title: line, text: '' };
            } else {
               if (currentArticle) {
                   currentArticle.text += line + '\n';
               } else {
                   currentArticle = { title: "Введение", text: line + '\n' };
               }
            }
        }
        if (currentArticle) currentCategory.articles.push(currentArticle);
        presetData.push(currentCategory);
    }

    if (presetData.length === 0) {
        return NextResponse.json({ response: text.replace(/\[CREATE_PRESET:\s*(.+?)\]/i, "Не удалось найти указанные законы для создания пресета.") });
    }

    const preset = await prisma.preset.create({
        data: {
            name: `Пресет от ИИ: ${serverInfo.name}`,
            author: authorName,
            discordId: discordId,
            data: JSON.stringify(presetData),
            serverProjectId: serverInfo.projectId || null,
            serverId: serverInfo.id || null
        }
    });

    const link = `\n\n✅ **Пресет успешно создан!** [📦 Скачать JSON файл](/api/download/${preset.id})`;
    const finalResponse = text.replace(/\[CREATE_PRESET:\s*(.+?)\]/i, link);
    return NextResponse.json({ response: finalResponse });
}

const getFileContent = (filename: string) => {
    try {
        const parts = filename.split('/');
        const rootFolder = parts[0];
        const restPath = parts.slice(1).join('/');

        let filePath = "";
        if (rootFolder === 'majesticrp') {
            filePath = path.join(process.cwd(), 'majesticrp', restPath);
        } else if (rootFolder === 'crystalrp') {
            filePath = path.join(process.cwd(), 'crystalrp', restPath);
        } else if (rootFolder === 'public') {
            filePath = path.join(process.cwd(), 'public', restPath);
        }

        if (filePath && fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, 'utf-8');
        }
    } catch (e) {
        console.error(`Не удалось загрузить файл ${filename}`, e);
    }
    return '';
};

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Доступ запрещен. Пожалуйста, авторизуйтесь на сайте.' }, { status: 401 });
    }

    const discordId = session.user.id || (session.user as any).discordId || session.user.email;
    const isPremium = (session.user as any).isPremium || false;
    const isAdmin = (session.user as any).role === "admin";

    // Логируем запрос для статистики (для всех пользователей)
    await prisma.aIPromptLog.create({
        data: { discordId: discordId }
    });

    if (!isPremium) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const promptCount = await prisma.aIPromptLog.count({
            where: {
                discordId: discordId,
                createdAt: {
                    gte: oneHourAgo
                }
            }
        });

        if (promptCount > 15) {
            // Ищем самый старый запрос в текущем часовом окне
            const oldestPrompt = await prisma.aIPromptLog.findFirst({
                where: {
                    discordId: discordId,
                    createdAt: { gte: oneHourAgo }
                },
                orderBy: { createdAt: 'asc' }
            });

            let resetTimeMs = Date.now() + 60 * 60 * 1000;
            if (oldestPrompt) {
                resetTimeMs = oldestPrompt.createdAt.getTime() + 60 * 60 * 1000;
            }

            return NextResponse.json({
                error: 'LIMIT_REACHED',
                message: 'Вы достигли лимита бесплатных запросов к ИИ (15 в час).',
                resetTimeMs: resetTimeMs
            }, { status: 403 });
        }
    }

    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ error: 'API ключ Gemini не настроен. Обратитесь к администратору (нужно добавить GEMINI_API_KEY в .env)' }, { status: 500 });
    }

    try {
        const { messages, serverId, mode } = await req.json();

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: 'Некорректный формат сообщений' }, { status: 400 });
        }

        const serverInfo = SERVERS.find(s => s.id === serverId) || SERVERS[0];

        // Собираем системный промпт + законы
        let systemPrompt = serverInfo.basePrompt;
        // Добавляем инструкцию для пресетов
        systemPrompt += "\n\n[СОЗДАНИЕ ПРЕСЕТА]: Если пользователь просит создать пресет, ты должен обязательно вернуть специальный тег, перечислив в нем ТОЧНЫЕ названия нужных законов из списка твоей базы знаний (без .txt) ИЛИ их общепринятые сокращения (УК, ПК, ДК). Пример: [CREATE_PRESET: Уголовный кодекс штата Сан-Андреас, Процессуальный кодекс]. Перед тегом напиши пару слов подтверждения.";

        const latestMessage = messages[messages.length - 1].content;

        if (serverInfo.files && serverInfo.files.length > 0) {
            const userMsg = latestMessage.toLowerCase();
            let selectedFileNames: string[] = [];

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
                'ter': 'Территории, КПЗ', 'trudk': 'Трудовой кодекс, увольнения', 'usss': 'Секретная служба',
                'nalog': 'Налоговый кодекс, налоги'
            };

            // ИИ-Маршрутизатор (Groq)
            if (process.env.GROQ_API_KEY) {
                try {
                    const availableFilesStr = serverInfo.files.map((f: string) => {
                        const base = f.split('/').pop()?.replace('.txt', '') || '';
                        return `- ${base}: ${fileDescriptions[base] || 'Закон'}`;
                    }).join('\n');

                    const routerPrompt = `Ты - система маршрутизации. Выбери из списка законы, нужные для ответа на вопрос.
Доступные законы:
${availableFilesStr}
Вопрос пользователя: "${latestMessage}"
ВЕРНИ ТОЛЬКО НАЗВАНИЯ ФАЙЛОВ через запятую (например: uk, neprikos). Не пиши ничего больше. Выбирай uk или proc ТОЛЬКО если вопрос касается преступлений, задержания или судов. Не добавляй их просто так.`;

                    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                        method: "POST", headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
                        body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: routerPrompt }], temperature: 0.1, max_tokens: 50 })
                    });
                    
                    if (groqRes.ok) {
                        const groqData = await groqRes.json();
                        const routerText = groqData.choices[0]?.message?.content || "";
                        selectedFileNames = routerText.toLowerCase().split(',').map((s: string) => s.trim().replace(/[^a-z0-9_]/g, '')).filter(Boolean);
                    } else {
                        console.error("Groq Router API error:", await groqRes.text());
                    }
                } catch (e) { console.error("Groq Router failed", e); }
            }

            // Запасная эвристика, если ИИ-маршрутизатор упал (или нет ключа)
            if (selectedFileNames.length === 0) {
                for (const file of serverInfo.files) {
                    const baseName = file.split('/').pop()?.replace('.txt', '') || '';
                    const isCore = ['uk', 'proc', 'konst'].includes(baseName);
                    const isMentioned = userMsg.includes(baseName) ||
                        (baseName === 'uk' && (userMsg.includes('ук') || userMsg.includes('уголовн'))) ||
                        (baseName === 'proc' && (userMsg.includes('пк') || userMsg.includes('процессуал') || userMsg.includes('задержан') || userMsg.includes('миранд'))) ||
                        (baseName === 'konst' && (userMsg.includes('конституц') || userMsg.includes('прав') || userMsg.includes('свобод'))) ||
                        (baseName === 'adk' && (userMsg.includes('ак') || userMsg.includes('административн'))) ||
                        (baseName === 'advokat' && (userMsg.includes('адвокат') || userMsg.includes('юрист') || userMsg.includes('защит'))) ||
                        (baseName === 'chp' && (userMsg.includes('чп') || userMsg.includes('вп') || userMsg.includes('чрезвычайн') || userMsg.includes('военн'))) ||
                        (baseName === 'dk' && (userMsg.includes('дк') || userMsg.includes('дорожн') || userMsg.includes('пдд') || userMsg.includes('штраф') || userMsg.includes('авто'))) ||
                        (baseName === 'ems' && (userMsg.includes('емс') || userMsg.includes('медик') || userMsg.includes('больниц') || userMsg.includes('врач'))) ||
                        (baseName === 'etk' && (userMsg.includes('эк') || userMsg.includes('этик') || userMsg.includes('дресс'))) ||
                        (baseName === 'fib' && (userMsg.includes('фиб') || userMsg.includes('фбр') || userMsg.includes('федеральн') || userMsg.includes('бюро'))) ||
                        (baseName === 'gosnag' && (userMsg.includes('наград') || userMsg.includes('медал') || userMsg.includes('орден'))) ||
                        (baseName === 'gostay' && (userMsg.includes('гостайн') || userMsg.includes('государственн') || userMsg.includes('секрет'))) ||
                        (baseName === 'grak' && (userMsg.includes('гк') || userMsg.includes('гражданск'))) ||
                        (baseName === 'gun' && (userMsg.includes('оружи') || userMsg.includes('лиценз') || userMsg.includes('калибр') || userMsg.includes('ствол'))) ||
                        (baseName === 'miting' && (userMsg.includes('митинг') || userMsg.includes('забастов') || userMsg.includes('собрани'))) ||
                        (baseName === 'nej' && (userMsg.includes('нежелательн') || userMsg.includes('организаци'))) ||
                        (baseName === 'neprikos' && (userMsg.includes('неприкос') || userMsg.includes('статус'))) ||
                        (baseName === 'ogp' && (userMsg.includes('огп') || userMsg.includes('прокурор') || userMsg.includes('прокуратур'))) ||
                        (baseName === 'order' && (userMsg.includes('ордер') || userMsg.includes('обыск') || userMsg.includes('рейд'))) ||
                        (baseName === 'organ' && (userMsg.includes('орган') || userMsg.includes('власт'))) ||
                        (baseName === 'orm' && (userMsg.includes('орм') || userMsg.includes('оперативн') || userMsg.includes('розыск') || userMsg.includes('внедрен'))) ||
                        (baseName === 'prav' && (userMsg.includes('прав') || userMsg.includes('губернатор') || userMsg.includes('мэр'))) ||
                        (baseName === 'predp' && (userMsg.includes('предпринимат') || userMsg.includes('бизнес') || userMsg.includes('ип'))) ||
                        (baseName === 'prodr' && (userMsg.includes('процессуальн') || userMsg.includes('действи'))) ||
                        (baseName === 'sang' && (userMsg.includes('санг') || userMsg.includes('арми') || userMsg.includes('нацгвард') || userMsg.includes('воен'))) ||
                        (baseName === 'senat' && (userMsg.includes('сенат') || userMsg.includes('конгресс'))) ||
                        (baseName === 'sredmass' && (userMsg.includes('сми') || userMsg.includes('weazel') || userMsg.includes('журналист') || userMsg.includes('новост'))) ||
                        (baseName === 'sudk' && (userMsg.includes('суд') || userMsg.includes('иск') || userMsg.includes('заседан'))) ||
                        (baseName === 'ter' && (userMsg.includes('территори') || userMsg.includes('кпз') || userMsg.includes('закрыт') || userMsg.includes('охран'))) ||
                        (baseName === 'trudk' && (userMsg.includes('труд') || userMsg.includes('увольн') || userMsg.includes('работ') || userMsg.includes('выговор'))) ||
                        (baseName === 'usss' && (userMsg.includes('usss') || userMsg.includes('секретн') || userMsg.includes('служеб'))) ||
                        (baseName === 'nalog' && (userMsg.includes('налог') || userMsg.includes('пошлин')));
                    
                    if (isCore || isMentioned) selectedFileNames.push(baseName);
                }
            }

            // Загрузка выбранных файлов
            let loadedFiles = 0;
            for (const file of serverInfo.files) {
                const baseName = file.split('/').pop()?.replace('.txt', '') || '';
                if (selectedFileNames.includes(baseName)) {
                    systemPrompt += `\n\n--- ДОКУМЕНТ: ${file.toUpperCase()} ---\n` + getFileContent(file);
                    loadedFiles++;
                }
                // Лимит 8 файлов для стабильности контекста
                if (loadedFiles >= 8) break;
            }
        }

        // Security check
        if (['judge', 'lawyer', 'prosecutor'].includes(mode) && !isPremium) {
            return NextResponse.json({ error: 'Выбранная роль доступна только по Premium подписке.' }, { status: 403 });
        }
        
        if (mode === 'admin_judge' && !isAdmin) {
            return NextResponse.json({ error: 'Этот режим доступен только администраторам.' }, { status: 403 });
        }

        let modeInstruction = "";
        switch (mode) {
            case 'normal':
                modeInstruction = "\n\n[КРИТИЧЕСКИ ВАЖНОЕ ПРАВИЛО]: ОТВЕЧАЙ МАКСИМАЛЬНО КРАТКО И ПО СУТИ. Давай только прямой и быстрый ответ. Избегай длинных цитат и рассуждений. Форматируй красиво с помощью Markdown.";
                break;
            case 'detailed':
                modeInstruction = "\n\n[КРИТИЧЕСКИ ВАЖНОЕ ПРАВИЛО]: ОТВЕЧАЙ МАКСИМАЛЬНО ПОДРОБНО И РАЗВЕРНУТО. Обязательно цитируй конкретные статьи из законов, приводи примеры и детальные пояснения. Используй Markdown (жирный текст, списки).";
                break;
            case 'judge':
                modeInstruction = "\n\n[КРИТИЧЕСКИ ВАЖНОЕ ПРАВИЛО - РОЛЬ СУДЬИ]: Твоя роль: СУДЬЯ. Оценивай ситуацию беспристрастно по букве закона. Выноси вердикты, опираясь исключительно на законы. Тон общения: строгий, официальный, холодный.";
                break;
            case 'lawyer':
                modeInstruction = "\n\n[КРИТИЧЕСКИ ВАЖНОЕ ПРАВИЛО - РОЛЬ АДВОКАТА]: Твоя роль: ЧАСТНЫЙ АДВОКАТ. Защити клиента ЛЮБОЙ ЦЕНОЙ. Ищи лазейки, цепляйся к процессуальным нарушениям. Строй стратегию защиты. Тон: профессиональный, хитрый.";
                break;
            case 'prosecutor':
                modeInstruction = "\n\n[КРИТИЧЕСКИ ВАЖНОЕ ПРАВИЛО - РОЛЬ ПРОКУРОРА]: Твоя роль: ГОСУДАРСТВЕННЫЙ ПРОКУРОР. Выяви состав преступления, выдвигай обвинения, требуй жесткого наказания. Тон: обвинительный, жесткий, бескомпромиссный.";
                break;
            case 'admin_judge':
                modeInstruction = "\n\n[КРИТИЧЕСКИ ВАЖНОЕ ПРАВИЛО - СУД АДМИН]: Твоя задача — составить официальную бумагу/ордер/постановление. ТЫ ДОЛЖЕН НАПИСАТЬ ГОТОВЫЙ ТЕКСТ ДОКУМЕНТА (КАК БУМАЖКУ). Обязательно ссылайся на статьи законов. НЕ используй Markdown-форматирование (никаких звездочек, жирного шрифта, решеток). Если тебе не хватает данных для составления бумаги, задай уточняющий вопрос. Тон: максимально официальный и канцелярский.";
                break;
            default:
                modeInstruction = "\n\n[КРИТИЧЕСКИ ВАЖНОЕ ПРАВИЛО]: ОТВЕЧАЙ МАКСИМАЛЬНО ПОДРОБНО И РАЗВЕРНУТО. Обязательно цитируй конкретные статьи из законов.";
        }

        // Добавляем инструкцию режима в конец сообщения пользователя, чтобы ИИ 100% обратил на нее внимание
        messages[messages.length - 1].content += modeInstruction;
        const modifiedLatestMessage = messages[messages.length - 1].content;


        // Цепочка ИИ-Юриста (Gemini -> DeepSeek -> Mistral/OpenRouter)
        try {
            // Попытка 1: Gemini 2.0 Flash
            const geminiKeys = [
                process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2, process.env.GEMINI_API_KEY_3,
                process.env.GEMINI_API_KEY_4, process.env.GEMINI_API_KEY_5
            ].filter(Boolean) as string[];

            const randomKey = geminiKeys[Math.floor(Math.random() * geminiKeys.length)];
            const genAI = new GoogleGenerativeAI(randomKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", systemInstruction: systemPrompt });

            const history = messages.slice(0, -1).map((msg: any) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));

            const chat = model.startChat({ history: history });
            const result = await chat.sendMessage(modifiedLatestMessage);
            return await processAiResponse(result.response.text(), serverInfo, isPremium, discordId, session.user.name || "AI Assistant");
            
        } catch (geminiError: any) {
            console.error("Gemini Error, trying fallbacks:", geminiError);

            // Попытка 2: DeepSeek API
            if (process.env.DEEPSEEK_API_KEY) {
                try {
                    const dsMessages = [
                        { role: "system", content: systemPrompt.substring(0, 100000) },
                        ...messages.map((msg: any) => ({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content }))
                    ];
                    
                    const dsRes = await fetch("https://api.deepseek.com/chat/completions", {
                        method: "POST", headers: { "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`, "Content-Type": "application/json" },
                        body: JSON.stringify({ model: "deepseek-chat", messages: dsMessages, temperature: 0.7 })
                    });
                    
                    if (dsRes.ok) {
                        const dsData = await dsRes.json();
                        return await processAiResponse(dsData.choices[0]?.message?.content, serverInfo, isPremium, discordId, session.user.name || "AI Assistant");
                    } else {
                        console.error("DeepSeek 400 Error Details:", await dsRes.text());
                    }
                } catch (dsError) {
                    console.error("DeepSeek Error:", dsError);
                }
            }

            // Попытка 3: OpenRouter (Mistral)
            if (process.env.OPENROUTER_API_KEY) {
                try {
                    const orMessages = [
                        { role: "system", content: systemPrompt.substring(0, 100000) },
                        ...messages.map((msg: any) => ({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content }))
                    ];

                    const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST", headers: { "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
                        body: JSON.stringify({ model: "mistralai/mistral-nemo", messages: orMessages, temperature: 0.7 })
                    });

                    if (orRes.ok) {
                        const orData = await orRes.json();
                        return await processAiResponse(orData.choices[0]?.message?.content, serverInfo, isPremium, discordId, session.user.name || "AI Assistant");
                    } else {
                        console.error("OpenRouter API error:", await orRes.text());
                    }
                } catch (orError) {
                    console.error("OpenRouter Error:", orError);
                }
            }
            
            return NextResponse.json({ error: "Бот перегружен запросами от игроков. У ИИ началась перезарядка, пожалуйста, подождите 1 минуту и спросите снова!" }, { status: 503 });
        }

    } catch (error: any) {
        console.error("General Error:", error);
        return NextResponse.json({ error: "Произошла системная ошибка. Попробуйте позже." }, { status: 500 });
    }
}

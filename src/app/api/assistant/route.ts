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
    
    if (!isPremium) {
        if (laws.length > 3) {
            return NextResponse.json({ response: "К сожалению, без Premium-подписки вы можете добавить максимум 3 закона в пресет." });
        }
        
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const presetCount = await prisma.aIPromptLog.count({
            where: {
                discordId: `PRESET_${discordId}`,
                createdAt: { gte: oneDayAgo }
            }
        });

        if (presetCount >= 2) {
            return NextResponse.json({ response: "К сожалению, без Premium-подписки вы можете создавать не более 2 пресетов в сутки. Лимит исчерпан." });
        }
    }

    // Process files
    let presetData: any[] = [];
    for (const law of laws) {
        const file = serverInfo.files.find((f: string) => {
            const baseName = f.split('/').pop()?.replace('.txt', '').toLowerCase().trim() || '';
            if (!baseName) return false;
            
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
            
            const isArticleStart = /^(Статья|Глава|Раздел|Пункт)\s/i.test(line) || /^\d+\.\d+/.test(line);
            
            if (isArticleStart) {
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
        return NextResponse.json({ response: "Не удалось найти указанные законы для создания пресета." });
    }

    const jsonStr = JSON.stringify(presetData, null, 2);
    const link = `\n\n✅ **Пресет успешно создан!** Скопируйте содержимое ниже и сохраните его в файл \`.json\` (или воспользуйтесь функцией импорта напрямую из текста):\n\n\`\`\`json\n${jsonStr}\n\`\`\``;
    const finalResponse = text.replace(/\[CREATE_PRESET:\s*(.+?)\]/i, link);
    
    // Log the creation to track limits
    if (!isPremium) {
        await prisma.aIPromptLog.create({
            data: { discordId: `PRESET_${discordId}` }
        });
    }
    
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
        systemPrompt += `\n\n[КРИТИЧЕСКОЕ ПРАВИЛО ПОИСКА]: Игроки сервера часто называют пункты и части "статьями" (например, называют пункт 2.5.2 "статьей 2.5.2"). НИКОГДА не поправляй их и не говори, что такой статьи нет или это "нумерация/подпункт"! Если просят "статью 2.5.2", ты ОБЯЗАН найти в тексте строку "2.5.2" и выдать ее содержимое без лишних нравоучений. Если в тексте есть цифры 2.5.2, значит это и есть то, что нужно.`;
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
                        const parts = f.split('|');
                        const filePath = parts[0];
                        const realName = parts.length > 1 ? parts[1] : '';
                        if (realName) return `- ${filePath}: ${realName}`;
                        const base = filePath.split('/').pop()?.replace('.txt', '') || '';
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
                        selectedFileNames = routerText.toLowerCase().split(',').map((s: string) => s.trim().replace(/[^\w\sа-яё\-]/gi, '')).filter(Boolean);
                    } else {
                        console.error("Groq Router API error:", await groqRes.text());
                    }
                } catch (e) { console.error("Groq Router failed", e); }
            }

            // Запасная эвристика, если ИИ-маршрутизатор упал (или нет ключа)
            if (selectedFileNames.length === 0) {
                for (const fileItem of serverInfo.files) {
                    const parts = fileItem.split('|');
                    const file = parts[0];
                    const realName = parts.length > 1 ? parts[1] : '';
                    const baseName = realName ? realName.toLowerCase() : file.split('/').pop()?.replace('.txt', '').toLowerCase().trim() || '';
                    
                    let key = baseName;
                    if (baseName.includes('уголов')) key = 'uk';
                    else if (baseName.includes('процессуал')) key = 'proc';
                    else if (baseName.includes('конституц')) key = 'konst';
                    else if (baseName.includes('административ')) key = 'adk';
                    else if (baseName.includes('адвокат')) key = 'advokat';
                    else if (baseName.includes('чрезвычайн') || baseName.includes('военн')) key = 'chp';
                    else if (baseName.includes('дорож')) key = 'dk';
                    else if (baseName.includes('ems')) key = 'ems';
                    else if (baseName.includes('этик') || baseName.includes('поведен')) key = 'etk';
                    else if (baseName.includes('fib')) key = 'fib';
                    else if (baseName.includes('наград')) key = 'gosnag';
                    else if (baseName.includes('тайн')) key = 'gostay';
                    else if (baseName.includes('гражданск')) key = 'grak';
                    else if (baseName.includes('оружи')) key = 'gun';
                    else if (baseName.includes('митинг')) key = 'miting';
                    else if (baseName.includes('нежелательн')) key = 'nej';
                    else if (baseName.includes('неприкос')) key = 'neprikos';
                    else if (baseName.includes('прокурор') || baseName.includes('огп')) key = 'ogp';
                    else if (baseName.includes('ордер')) key = 'order';
                    else if (baseName.includes('орган')) key = 'organ';
                    else if (baseName.includes('розыск') || baseName.includes('орм') || baseName.includes('оператив')) key = 'orm';
                    else if (baseName.includes('правительств') || baseName.includes('gov')) key = 'prav';
                    else if (baseName.includes('предпринимат')) key = 'predp';
                    else if (baseName.includes('sang') || baseName.includes('арми') || baseName.includes('гвард')) key = 'sang';
                    else if (baseName.includes('сенат')) key = 'senat';
                    else if (baseName.includes('mass') || baseName.includes('сми') || baseName.includes('weazel')) key = 'sredmass';
                    else if (baseName.includes('судеб') || baseName.includes('правосуд')) key = 'sudk';
                    else if (baseName.includes('территори')) key = 'ter';
                    else if (baseName.includes('трудов')) key = 'trudk';
                    else if (baseName.includes('налог')) key = 'nalog';
                    else if (baseName.includes('lscsd')) key = 'lscsd';
                    else if (baseName.includes('lspd')) key = 'lspd';
                    else if (baseName.includes('usss')) key = 'usss';

                    const isCore = ['uk', 'proc', 'konst'].includes(key);
                    const isMentioned = userMsg.includes(key) || userMsg.includes(baseName) ||
                        (key === 'uk' && (userMsg.includes('ук') || userMsg.includes('уголовн'))) ||
                        (key === 'proc' && (userMsg.includes('пк') || userMsg.includes('процессуал') || userMsg.includes('задержан') || userMsg.includes('миранд'))) ||
                        (key === 'konst' && (userMsg.includes('конституц') || userMsg.includes('прав') || userMsg.includes('свобод'))) ||
                        (key === 'adk' && (userMsg.includes('ак') || userMsg.includes('административн'))) ||
                        (key === 'advokat' && (userMsg.includes('адвокат') || userMsg.includes('юрист') || userMsg.includes('защит'))) ||
                        (key === 'chp' && (userMsg.includes('чп') || userMsg.includes('вп') || userMsg.includes('чрезвычайн') || userMsg.includes('военн'))) ||
                        (key === 'dk' && (userMsg.includes('дк') || userMsg.includes('дорожн') || userMsg.includes('пдд') || userMsg.includes('штраф') || userMsg.includes('авто'))) ||
                        (key === 'ems' && (userMsg.includes('емс') || userMsg.includes('медик') || userMsg.includes('больниц') || userMsg.includes('врач'))) ||
                        (key === 'etk' && (userMsg.includes('эк') || userMsg.includes('этик') || userMsg.includes('дресс'))) ||
                        (key === 'fib' && (userMsg.includes('фиб') || userMsg.includes('фбр') || userMsg.includes('федеральн') || userMsg.includes('бюро'))) ||
                        (key === 'gosnag' && (userMsg.includes('наград') || userMsg.includes('медал') || userMsg.includes('орден'))) ||
                        (key === 'gostay' && (userMsg.includes('гостайн') || userMsg.includes('государственн') || userMsg.includes('секрет'))) ||
                        (key === 'grak' && (userMsg.includes('гк') || userMsg.includes('гражданск'))) ||
                        (key === 'gun' && (userMsg.includes('оружи') || userMsg.includes('лиценз') || userMsg.includes('калибр') || userMsg.includes('ствол'))) ||
                        (key === 'miting' && (userMsg.includes('митинг') || userMsg.includes('забастов') || userMsg.includes('собрани'))) ||
                        (key === 'nej' && (userMsg.includes('нежелательн') || userMsg.includes('организаци'))) ||
                        (key === 'neprikos' && (userMsg.includes('неприкос') || userMsg.includes('статус'))) ||
                        (key === 'ogp' && (userMsg.includes('огп') || userMsg.includes('прокурор') || userMsg.includes('прокуратур'))) ||
                        (key === 'order' && (userMsg.includes('ордер') || userMsg.includes('обыск') || userMsg.includes('рейд'))) ||
                        (key === 'organ' && (userMsg.includes('орган') || userMsg.includes('власт'))) ||
                        (key === 'orm' && (userMsg.includes('орм') || userMsg.includes('оперативн') || userMsg.includes('розыск') || userMsg.includes('внедрен'))) ||
                        (key === 'prav' && (userMsg.includes('прав') || userMsg.includes('губернатор') || userMsg.includes('мэр'))) ||
                        (key === 'predp' && (userMsg.includes('предпринимат') || userMsg.includes('бизнес') || userMsg.includes('ип'))) ||
                        (key === 'sang' && (userMsg.includes('санг') || userMsg.includes('арми') || userMsg.includes('нацгвард') || userMsg.includes('воен'))) ||
                        (key === 'senat' && (userMsg.includes('сенат') || userMsg.includes('конгресс'))) ||
                        (key === 'sredmass' && (userMsg.includes('сми') || userMsg.includes('weazel') || userMsg.includes('журналист') || userMsg.includes('новост'))) ||
                        (key === 'sudk' && (userMsg.includes('суд') || userMsg.includes('иск') || userMsg.includes('заседан'))) ||
                        (key === 'ter' && (userMsg.includes('территори') || userMsg.includes('кпз') || userMsg.includes('закрыт') || userMsg.includes('охран'))) ||
                        (key === 'trudk' && (userMsg.includes('труд') || userMsg.includes('увольн') || userMsg.includes('работ') || userMsg.includes('выговор'))) ||
                        (key === 'usss' && (userMsg.includes('usss') || userMsg.includes('секретн') || userMsg.includes('служеб'))) ||
                        (key === 'nalog' && (userMsg.includes('налог') || userMsg.includes('пошлин')));
                    
                    if (isCore || isMentioned) {
                        selectedFileNames.push(baseName);
                        if (realName) selectedFileNames.push(file.toLowerCase()); // Also push the path so the router fallback works
                    }
                }
            }

            // Загрузка выбранных файлов
            let loadedFiles = 0;
            for (const fileItem of serverInfo.files) {
                const parts = fileItem.split('|');
                const file = parts[0];
                const realName = parts.length > 1 ? parts[1] : '';
                const baseName = realName ? realName.toLowerCase() : file.split('/').pop()?.replace('.txt', '').toLowerCase().trim() || '';
                
                const isSelected = selectedFileNames.some(selected => 
                    (selected && file.toLowerCase().includes(selected)) || 
                    (selected && baseName.includes(selected))
                );

                if (isSelected || selectedFileNames.includes(baseName)) {
                    systemPrompt += `\n\n--- ДОКУМЕНТ: ${realName ? realName.toUpperCase() : file.toUpperCase()} ---\n` + getFileContent(file);
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
            const dsKey = process.env.DEEPSEEK_API_KEY || "sk-12f55266d8434b24be89a66e281d4c21";
            if (dsKey) {
                try {
                    const dsMessages = [
                        { role: "system", content: systemPrompt.substring(0, 300000) },
                        ...messages.map((msg: any) => ({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content }))
                    ];
                    
                    const dsRes = await fetch("https://api.deepseek.com/chat/completions", {
                        method: "POST", headers: { "Authorization": `Bearer ${dsKey}`, "Content-Type": "application/json" },
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
                        { role: "system", content: systemPrompt.substring(0, 300000) },
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

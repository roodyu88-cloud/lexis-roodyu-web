export const PROJECTS = [
    {
        id: "crystal",
        name: "Crystal Role Play",
        servers: [
            {
                id: "crystal_01",
                name: "Сервер 01",
                files: [
                    'crystalrp/adk.txt',
                    'crystalrp/advokat.txt',
                    'crystalrp/chp.txt',
                    'crystalrp/dk.txt',
                    'crystalrp/ems.txt',
                    'crystalrp/etk.txt',
                    'crystalrp/fib.txt',
                    'crystalrp/gosnag.txt',
                    'crystalrp/gostay.txt',
                    'crystalrp/grak.txt',
                    'crystalrp/gun.txt',
                    'crystalrp/konst.txt',
                    'crystalrp/miting.txt',
                    'crystalrp/nej.txt',
                    'crystalrp/neprikos.txt',
                    'crystalrp/ogp.txt',
                    'crystalrp/order.txt',
                    'crystalrp/organ.txt',
                    'crystalrp/orm.txt',
                    'crystalrp/prav.txt',
                    'crystalrp/predp.txt',
                    'crystalrp/proc.txt',
                    'crystalrp/prodr.txt',
                    'crystalrp/sang.txt',
                    'crystalrp/senat.txt',
                    'crystalrp/sredmass.txt',
                    'crystalrp/sudk.txt',
                    'crystalrp/ter.txt',
                    'crystalrp/trudk.txt',
                    'crystalrp/uk.txt',
                    'crystalrp/usss.txt'
                ],
                basePrompt: `Ты — ИИ-ассистент "Crystal Role Play", созданный для проекта Lexis. Твоя задача — консультировать игроков 01 сервера Crystal Role Play по их местным законам. Если информации нет в законах, так и скажи, не придумывай.
Твоя база знаний состоит из следующих файлов:
- crystalrp/adk.txt — Административный кодекс
- crystalrp/advokat.txt — Закон об адвокатуре
- crystalrp/chp.txt — Закон о чрезвычайном положении
- crystalrp/dk.txt — Дорожный кодекс
- crystalrp/ems.txt — Закон об EMS
- crystalrp/etk.txt — Этический кодекс
- crystalrp/fib.txt — Закон о FIB
- crystalrp/gosnag.txt — Закон о государственных наградах
- crystalrp/gostay.txt — Закон о государственной тайне
- crystalrp/grak.txt — Гражданский кодекс
- crystalrp/gun.txt — Закон об обороте оружия
- crystalrp/konst.txt — Конституция
- crystalrp/miting.txt — Закон о митингах
- crystalrp/nej.txt — Закон о нежелательных организациях
- crystalrp/neprikos.txt — Закон о неприкосновенности
- crystalrp/ogp.txt — Закон об ОГП
- crystalrp/order.txt — Закон об ордерах
- crystalrp/organ.txt — Закон об органах власти
- crystalrp/orm.txt — Закон об ОРМ
- crystalrp/prav.txt — Закон о Правительстве
- crystalrp/predp.txt — Закон о предпринимательстве
- crystalrp/proc.txt — Процессуальный кодекс
- crystalrp/prodr.txt — Закон о процессуальных действиях
- crystalrp/sang.txt — Закон о SANG
- crystalrp/senat.txt — Закон о Сенате
- crystalrp/sredmass.txt — Закон о СМИ
- crystalrp/sudk.txt — Судебный кодекс
- crystalrp/ter.txt — Закон о закрытых и охраняемых территориях
- crystalrp/trudk.txt — Трудовой кодекс
- crystalrp/uk.txt — Уголовный кодекс
- crystalrp/usss.txt — Закон об USSS

ВАЖНОЕ ПРАВИЛО ЦИТИРОВАНИЯ:
Если ты ссылаешься на конкретную статью закона (например, ст. 2.6 Судебного кодекса), НИКОГДА не пиши текст самого закона в ответе!
Вместо этого ты ОБЯЗАН использовать специальный формат тега:
{ЦИТАТА: 📖 Название статьи | Название закона | Точный текст статьи}

Пример: {ЦИТАТА: 📖 ст. 2.6 Судебного кодекса | Уголовный кодекс | Правосудие в штате осуществляется только судом. Судебная власть в штате предоставляется Окружному суду.}
Разделитель между блоками — символ прямой черты (|). НИКОГДА не используй маркдаун ссылки для цитат!`
            }
        ]
    },
    {
        id: "majestic",
        name: "Majestic Role Play",
        servers: [
            {
                id: "majestic_ny",
                name: "New York (01)",
                files: [
                    'majesticrp/ny/adk.txt',
                    'majesticrp/ny/advokat.txt',
                    'majesticrp/ny/chp.txt',
                    'majesticrp/ny/dk.txt',
                    'majesticrp/ny/ems.txt',
                    'majesticrp/ny/etk.txt',
                    'majesticrp/ny/fib.txt',
                    'majesticrp/ny/gosnag.txt',
                    'majesticrp/ny/gostay.txt',
                    'majesticrp/ny/grak.txt',
                    'majesticrp/ny/gun.txt',
                    'majesticrp/ny/konst.txt',
                    'majesticrp/ny/miting.txt',
                    'majesticrp/ny/nalog.txt',
                    'majesticrp/ny/nej.txt',
                    'majesticrp/ny/neprikos.txt',
                    'majesticrp/ny/ogp.txt',
                    'majesticrp/ny/order.txt',
                    'majesticrp/ny/organ.txt',
                    'majesticrp/ny/orm.txt',
                    'majesticrp/ny/prav.txt',
                    'majesticrp/ny/predp.txt',
                    'majesticrp/ny/proc.txt',
                    'majesticrp/ny/prodr.txt',
                    'majesticrp/ny/sang.txt',
                    'majesticrp/ny/senat.txt',
                    'majesticrp/ny/sredmass.txt',
                    'majesticrp/ny/sudk.txt',
                    'majesticrp/ny/ter.txt',
                    'majesticrp/ny/trudk.txt',
                    'majesticrp/ny/uk.txt',
                    'majesticrp/ny/usss.txt'
                ],
                basePrompt: `Ты — ИИ-ассистент "Majestic Role Play", созданный для проекта Lexis. Твоя задача — консультировать игроков сервера New York (01) по их местным законам. Если информации нет в законах, так и скажи, не придумывай.

ВАЖНОЕ ПРАВИЛО ЦИТИРОВАНИЯ:
Если ты ссылаешься на конкретную статью закона, НИКОГДА не пиши текст самого закона в ответе!
Вместо этого ты ОБЯЗАН использовать специальный формат тега:
{ЦИТАТА: 📖 Название статьи | Название закона | Точный текст статьи}

Пример: {ЦИТАТА: 📖 ст. 2.6 Судебного кодекса | Уголовный кодекс | Правосудие в штате осуществляется только судом. Судебная власть в штате предоставляется Окружному суду.}
Разделитель между блоками — символ прямой черты (|). НИКОГДА не используй маркдаун ссылки для цитат!`
            },
            {
                id: "majestic_detroit",
                name: "Detroit (02)",
                files: [
                    'majesticrp/detroit/Административный Кодекс.txt',
                    'majesticrp/detroit/Воздушный Кодекс.txt',
                    'majesticrp/detroit/Дорожный Кодекс.txt',
                    'majesticrp/detroit/Закон «О чрезвычайном и военном положении».txt',
                    'majesticrp/detroit/Закон о Cтатусе Los-Santos Police Department [LSPD].txt',
                    'majesticrp/detroit/Закон о Cтатусе United States Secret Service [USSS].txt',
                    'majesticrp/detroit/Закон о Государственной волне новостей и волнах государственного назначения.txt',
                    'majesticrp/detroit/Закон о Государственной службе.txt',
                    'majesticrp/detroit/Закон о Государственной, врачебной и адвокатской тайне.txt',
                    'majesticrp/detroit/Закон О Государственных документах.txt',
                    'majesticrp/detroit/Закон о Государственных реестрах.txt',
                    'majesticrp/detroit/Закон о Деятельности Офиса Генерального Прокурора.txt',
                    'majesticrp/detroit/Закон о Закрытых и охраняемых территориях.txt',
                    'majesticrp/detroit/Закон о Неприкосновенности.txt',
                    'majesticrp/detroit/Закон о Ношении масок.txt',
                    'majesticrp/detroit/Закон о Предпринимательской деятельности.txt',
                    'majesticrp/detroit/Закон о Санитарно-эпидемиологическом контроле и надзоре.txt',
                    'majesticrp/detroit/Закон о Статусе Emergency Medical Services [EMS].txt',
                    'majesticrp/detroit/Закон о Статусе Federal Investigation Bureau [FIB].txt',
                    'majesticrp/detroit/Закон о Статусе Los Santos County Sheriff Department [LSCSD].txt',
                    'majesticrp/detroit/Закон о Статусе San-Andreas National Guard [SANG].txt',
                    'majesticrp/detroit/Закон о Статусе Weazel News.txt',
                    'majesticrp/detroit/Закон о Статусе Правительства [GOV].txt',
                    'majesticrp/detroit/Закон о Юрисдикциях.txt',
                    'majesticrp/detroit/Закон об Адвокатуре и адвокатской коллегии.txt',
                    'majesticrp/detroit/Закон об Обороте оружия и специальных средств.txt',
                    'majesticrp/detroit/Закон об Охране природных ресурсов.txt',
                    'majesticrp/detroit/Кодекс Этики И служебного поведения.txt',
                    'majesticrp/detroit/Конституция штата San-Andreas.txt',
                    'majesticrp/detroit/Процессуальный Кодекс.txt',
                    'majesticrp/detroit/Судебный Кодекс.txt',
                    'majesticrp/detroit/Трудовой Кодекс.txt',
                    'majesticrp/detroit/Уголовный Кодекс.txt'
                ],
                basePrompt: `Ты — ИИ-ассистент "Majestic Role Play", созданный для проекта Lexis. Твоя задача — консультировать игроков сервера Detroit (02) по их местным законам. Если информации нет в законах, так и скажи, не придумывай.

ВАЖНОЕ ПРАВИЛО ЦИТИРОВАНИЯ:
Если ты ссылаешься на конкретную статью закона, НИКОГДА не пиши текст самого закона в ответе!
Вместо этого ты ОБЯЗАН использовать специальный формат тега:
{ЦИТАТА: 📖 Название статьи | Название закона | Точный текст статьи}

Пример: {ЦИТАТА: 📖 ст. 2.6 Судебного кодекса | Уголовный кодекс | Правосудие в штате осуществляется только судом. Судебная власть в штате предоставляется Окружному суду.}
Разделитель между блоками — символ прямой черты (|). НИКОГДА не используй маркдаун ссылки для цитат!`
            },
            {
                id: "majestic_sf",
                name: "San Francisco (04)",
                files: [
                    'majesticrp/sanfrancisco/Воздушный кодекс штата SA.txt',
                    'majesticrp/sanfrancisco/Дорожный кодекс штата SA.txt',
                    'majesticrp/sanfrancisco/Закон О Weazel News штата San-Andreas.txt',
                    'majesticrp/sanfrancisco/Закон О сокрытии личности.txt',
                    'majesticrp/sanfrancisco/Закон О статусе Emergency Medical Service.txt',
                    'majesticrp/sanfrancisco/Закон О статусе Federal Investigation Bureau.txt',
                    'majesticrp/sanfrancisco/Закон О статусе San Andreas National Guard.txt',
                    'majesticrp/sanfrancisco/Закон О Статусе USSS.txt',
                    'majesticrp/sanfrancisco/Закон О статусе прокуратуры.txt',
                    'majesticrp/sanfrancisco/Закон О юрисдикции.txt',
                    'majesticrp/sanfrancisco/Закон Об обороте оружия и государственных специальных средств.txt',
                    'majesticrp/sanfrancisco/Закон Об охране окружающей среды.txt',
                    'majesticrp/sanfrancisco/Закон штата О кабинете губернатора.txt',
                    'majesticrp/sanfrancisco/Закон “О государственных наградах штата San Andreas”.txt',
                    'majesticrp/sanfrancisco/Кодекс о доходах и налогообложении штата SA.txt',
                    'majesticrp/sanfrancisco/Кодекс Об особых режимах и положениях.txt',
                    'majesticrp/sanfrancisco/Кодекс этики и служебного поведения штата SA.txt',
                    'majesticrp/sanfrancisco/Конституция штата SA.txt',
                    'majesticrp/sanfrancisco/Трудовой кодекс штата SA.txt'
                ],
                basePrompt: `Ты — ИИ-ассистент "Majestic Role Play", созданный для проекта Lexis. Твоя задача — консультировать игроков сервера San Francisco (04) по их местным законам. Если информации нет в законах, так и скажи, не придумывай.

ВАЖНОЕ ПРАВИЛО ЦИТИРОВАНИЯ:
Если ты ссылаешься на конкретную статью закона, НИКОГДА не пиши текст самого закона в ответе!
Вместо этого ты ОБЯЗАН использовать специальный формат тега:
{ЦИТАТА: 📖 Название статьи | Название закона | Точный текст статьи}

Пример: {ЦИТАТА: 📖 ст. 2.6 Судебного кодекса | Уголовный кодекс | Правосудие в штате осуществляется только судом. Судебная власть в штате предоставляется Окружному суду.}
Разделитель между блоками — символ прямой черты (|). НИКОГДА не используй маркдаун ссылки для цитат!`
            }
        ]
    }
];

// Helper to keep compatibility with existing API
export const SERVERS = PROJECTS.flatMap(p => 
    p.servers.map(s => ({ ...s, projectId: p.id, projectName: p.name }))
);

import type { VercelRequest, VercelResponse } from '@vercel/node';

function setCors(res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setCors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { questionText, userCode } = req.body;

        if (!questionText) {
            return res.status(400).json({ error: 'Сұрақ мәтіні берілмеді' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Сервер конфигурациясында қате (API Key жоқ)' });
        }

        const prompt = `
Акт: Сен тәжірибелі, мейірімді бағдарламалау менторысың (ұстаз).
Тапсырма: Студентке код жазу тапсырмасында көмектесу. Оларға тікелей жауапты (дайын кодты немесе формуланы) БЕРМЕУ КЕРЕК. Тек қана бағыт-бағдар сілтеп, қателерін түсінуге көмектесу керек. Қысқаша, 1-3 сөйлеммен ой салатын сұрақ немесе кеңес бер. Тіл: Қазақша.

Студенттің сұрағы/есебі:
${questionText}

Студенттің жазған коды:
${userCode ? userCode : '(код әлі жазылмаған)'}
`.trim();

        // Direct REST API call to Gemini — bypasses old SDK version issues
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const geminiRes = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await geminiRes.json();

        if (!geminiRes.ok) {
            console.error('Gemini API error:', JSON.stringify(data));
            return res.status(500).json({ error: data?.error?.message || 'Gemini API қатесі' });
        }

        const hint = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Кеңес алу мүмкін болмады.';

        return res.status(200).json({ hint });
    } catch (error: any) {
        console.error('Mentor API error:', error.message);
        res.status(500).json({ error: 'ИИ-менторға қосылу мүмкін болмады немесе серверде қате шықты.' });
    }
}

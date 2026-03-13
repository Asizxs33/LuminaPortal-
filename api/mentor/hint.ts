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

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Сервер конфигурациясында қате (OPENAI_API_KEY жоқ)' });
        }

        const systemPrompt = `Сен тәжірибелі, мейірімді бағдарламалау менторысың (ұстаз). Студентке код жазу тапсырмасында көмектесу керек. Оларға тікелей жауапты (дайын кодты немесе формуланы) БЕРМЕУ КЕРЕК. Тек қана бағыт-бағдар сілтеп, қателерін түсінуге көмектесу керек. Қысқаша, 1-3 сөйлеммен ой салатын сұрақ немесе кеңес бер. Тіл: Қазақша.`;

        const userMessage = `Студенттің сұрағы/есебі:\n${questionText}\n\nСтуденттің жазған коды:\n${userCode ? userCode : '(код әлі жазылмаған)'}`;

        const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                max_tokens: 300,
                temperature: 0.7
            })
        });

        const data = await openaiRes.json();

        if (!openaiRes.ok) {
            console.error('OpenAI API error:', JSON.stringify(data));
            return res.status(500).json({ error: data?.error?.message || 'OpenAI API қатесі' });
        }

        const hint = data?.choices?.[0]?.message?.content || 'Кеңес алу мүмкін болмады.';

        return res.status(200).json({ hint });
    } catch (error: any) {
        console.error('Mentor API error:', error.message);
        res.status(500).json({ error: 'ИИ-менторға қосылу мүмкін болмады немесе серверде қате шықты.' });
    }
}

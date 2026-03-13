import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

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
        const { questionText, userCode, userId } = req.body;

        if (!questionText || !userId) {
            return res.status(400).json({ error: 'Сұрақ мәтіні немесе қолданушы ID берілмеді' });
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Сервер конфигурациясында қате (OPENAI_API_KEY жоқ)' });
        }

        // Check user coin balance
        const userRes = await pool.query('SELECT coins FROM users WHERE id = $1', [userId]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: 'Қолданушы табылмады' });
        }

        const coins = userRes.rows[0].coins;
        if (coins < 10) {
            return res.status(403).json({ error: 'Жеткілікті биткоин жоқ (10 қажет)' });
        }

        const systemPrompt = `Сен тәжірибелі, мейірімді бағдарламалау менторысың (ұстаз). Студентке код жазу тапсырмасында көмектесу керек. Бұл жолы толық дұрыс жауапты берместен, студентке нақты көмектесуің керек. Қажет болса формуланы, маңызды алгоритм қадамдарын көрсет.
МАҢЫЗДЫ ЕРЕЖЕЛЕР:
1. Көптеген оқушылар функцияларды жазуды әлі білмейді, сондықтан кодтарда "def" (функция құру) ҚОЛДАНБА. Тек қарапайым циклдерді (for/while), шарттарды (if/else) және енгізу/шығаруды (input/print) қолдан.
2. Артық түсініктемелер мен ұзын мәтіндерсіз, өте қысқа және нұсқаулық түрде жауап бер.
3. Код жазғанда бос орындарды (бос жолдар, enter) барынша азайт, барынша ықшамды және тығыз етіп жаз.
Студенттің қатесін нақты түсіндіріп, оны қалай түзеуге болатынын ғана айт. Тіл: Қазақша.`;

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
                max_tokens: 400,
                temperature: 0.7
            })
        });

        const data = await openaiRes.json();

        if (!openaiRes.ok) {
            console.error('OpenAI API error:', JSON.stringify(data));
            return res.status(500).json({ error: data?.error?.message || 'OpenAI API қатесі' });
        }

        const hint = data?.choices?.[0]?.message?.content || 'Кеңес алу мүмкін болмады.';

        // Deduct 10 coins after successful response
        await pool.query('UPDATE users SET coins = coins - 10 WHERE id = $1', [userId]);

        return res.status(200).json({ hint, coinsRemaining: coins - 10 });
    } catch (error: any) {
        console.error('Mentor API error:', error.message);
        res.status(500).json({ error: 'ИИ-менторға қосылу мүмкін болмады немесе серверде қате шықты.' });
    }
}

import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

// Initialize the Gemini API client
// Make sure you have GEMINI_API_KEY set in your .env file
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

router.post('/hint', async (req, res) => {
    try {
        if (!genAI) {
            return res.status(500).json({ error: 'Gemini API is not configured on the server. Please add GEMINI_API_KEY.' });
        }

        const { questionText, userCode } = req.body;

        if (!questionText) {
            return res.status(400).json({ error: 'questionText is required.' });
        }

        const systemInstruction = `
Ты — опытный, терпеливый и поддерживающий ИИ-наставник по Python. Твоя цель — помочь студенту научиться программировать и самому прийти к правильному решению.

СТРОГИЕ ПРАВИЛА:
1. НИКОГДА не пиши весь готовый код решения задачи за студента. Запрещено давать прямые ответы.
2. Если студент прислал нерабочий код, не переписывай его правильно. Укажи на строку с ошибкой и объясни суть проблемы (например: "Посмотри на цикл for, сколько раз он выполнится?").
3. Задавай наводящие вопросы, чтобы подтолкнуть к решению.
4. Разрешается писать короткие примеры кода (1-2 строки) для объяснения синтаксиса или концепции (например, как работает метод .split()), но не для решения самой задачи студента.
5. Действуй как учитель: хвали за правильные догадки и направляй при ошибках.
6. Отвечай кратко и по делу.
`;

        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: systemInstruction,
        });

        const prompt = `Задача студента:
${questionText}

Код студента сейчас:
${userCode || '(Код еще не написан)'}

Окажи помощь студенту, не давая прямого ответа.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ hint: text });
    } catch (err: any) {
        console.error('Mentor AI error:', err);
        res.status(500).json({ error: 'Failed to generate hint.', details: err.message });
    }
});

export default router;

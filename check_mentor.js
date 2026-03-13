require('dotenv').config();

async function check() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("API Key:", apiKey ? "Present" : "Missing");

    const prompt = "Сәлем! Мен Python тілінде массивтегі максимум элементті табу функциясын жазу керекпін. Қалай бастау керек?";

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("Gemini Error:", JSON.stringify(data, null, 2));
            return;
        }

        const hint = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log("SUCCESS! Hint:", hint);
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

check();

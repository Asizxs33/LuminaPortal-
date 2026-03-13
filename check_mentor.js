require('dotenv').config();

async function check() {
    const apiKey = process.env.OPENAI_API_KEY;
    console.log("OpenAI API Key:", apiKey ? "Present" : "Missing");

    try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'Сен бағдарламалау менторысың. Қазақша жауап бер.' },
                    { role: 'user', content: 'Python тілінде массивтегі максимум элементті қалай табамын?' }
                ],
                max_tokens: 200,
                temperature: 0.7
            })
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("OpenAI Error:", JSON.stringify(data, null, 2));
            return;
        }

        console.log("SUCCESS! Response:", data.choices[0].message.content);
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

check();

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function check() {
    console.log("Checking API Key...", process.env.GEMINI_API_KEY ? "Present" : "Missing");
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent("Сәлем, бұл тест.");
        console.log("API Result:", result.response.text());
    } catch(e) {
        console.error("API Error:", e);
    }
}
check();

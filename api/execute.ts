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
        const { code, language, test_id, question_index } = req.body;

        if (!code || !language || !test_id || question_index === undefined) {
             return res.status(400).json({ status: 'FAILED', output: 'Missing required parameters' });
        }

        const result = await pool.query(
            'SELECT * FROM questions WHERE test_id = $1 ORDER BY order_index ASC, id ASC',
            [test_id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'FAILED', output: 'Test or questions not found' });
        }

        const targetQuestion = result.rows[question_index];

        if (!targetQuestion || targetQuestion.type !== 'CODE' || !targetQuestion.test_cases) {
            return res.status(400).json({ status: 'FAILED', output: 'Invalid question or not a code question' });
        }

        const testCases = targetQuestion.test_cases;
        
        let passedCount = 0;
        let finalStatus = 'PASSED';
        let consoleOutput = '';

        // Run against Wandbox API for Vercel Serverless environment compatibility (Free, no keys needed)
        // Use python version cpython-3.10.15
        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];
            const fullCode = `${code}\n\n${tc.input}`;

            const wandboxRes = await fetch('https://wandbox.org/api/compile.json', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    compiler: 'cpython-3.10.15',
                    code: fullCode
                })
            });

            const wandboxData = await wandboxRes.json();
            
            let stdout = (wandboxData.program_output || wandboxData.program_message || '').trim();
            let stderr = (wandboxData.program_error || wandboxData.compiler_error || '').trim();

            if (wandboxData.status !== "0" && !stderr) {
                stderr = 'Execution failed with status ' + wandboxData.status;
            }

            if (stderr) {
                finalStatus = 'FAILED';
                consoleOutput = `Error on Test Case ${i + 1}:\n${stderr}`;
                break;
            }

            if (stdout !== tc.expected_output.trim()) {
                finalStatus = 'FAILED';
                consoleOutput = `Test Case ${i + 1} Failed.\nExpected:\n${tc.expected_output}\n\nGot:\n${stdout}`;
                break;
            } else {
                passedCount++;
            }
        }

        if (finalStatus === 'PASSED') {
            consoleOutput = `All ${testCases.length} test cases passed successfully!`;
        }

        return res.json({
            status: finalStatus,
            passed: passedCount,
            total: testCases.length,
            output: consoleOutput
        });

    } catch (error: any) {
        console.error('Execute API error:', error.message);
        res.status(500).json({ status: 'FAILED', output: 'Server error during code execution' });
    }
}

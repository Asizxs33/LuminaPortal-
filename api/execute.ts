import { secure } from './_lib/secure';
import jwt from 'jsonwebtoken';
import { createHash } from 'node:crypto';
import { session } from './_lib/session';
import type { VercelRequest, VercelResponse } from './_lib/http';
import { Pool } from './_lib/db';

const pool = new Pool({connectionTimeoutMillis:10000,
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: true },
});

function setCors(res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

async function handler(req: VercelRequest, res: VercelResponse) {
    setCors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const actor = session(req);
    if (!actor) return res.status(401).json({error:'Кіру қажет.'});
    try {
        const { code, language, test_id, question_index, question_id } = req.body;

        if (!code || !language || !test_id || (question_index === undefined && !question_id)) {
            return res.status(400).json({ status: 'FAILED', output: 'Missing required parameters' });
        }

        const test=(await pool.query('SELECT exam_mode,answers_released FROM tests WHERE id=$1',[test_id])).rows[0];
        if(!test)return res.status(404).end();
        if(test.exam_mode){
          const active=(await pool.query('SELECT questions FROM exam_attempts WHERE test_id=$1 AND user_id=$2 AND deadline>NOW() AND finished=false',[test_id,actor.id])).rows[0];
          if(test.answers_released||!active||!active.questions.some((q:any)=>String(q.id)===String(question_id)))return res.status(403).json({status:'FAILED',output:'Емтихан уақыты аяқталған.'});
        }
        const result = await pool.query(
            'SELECT * FROM questions WHERE test_id = $1 ORDER BY order_index ASC, id ASC',
            [test_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'FAILED', output: 'Test or questions not found' });
        }

        const targetQuestion = question_id ? result.rows.find(q=>String(q.id)===String(question_id)) : result.rows[question_index];

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

            // We pass the raw code as-is. The test input is passed via 'stdin' in wandbox API.
            // (Removed appending `tc.input` to code, because inputting numbers like '2 3' causes SyntaxError).
            const fullCode = code;

            const wandboxRes = await fetch('https://wandbox.org/api/compile.json', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    compiler: 'cpython-3.10.15',
                    code: fullCode,
                    stdin: tc.input // Added for competitive programming style input()
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

            const expected = tc.expected_output.trim();
            const actual = stdout;
            let isPassed = false;

            if (actual === expected) {
                isPassed = true;
            } else {
                // Try comparing as numbers
                const numExpected = Number(expected);
                const numActual = Number(actual);
                if (!isNaN(numExpected) && !isNaN(numActual) && Math.abs(numExpected - numActual) < 1e-6) {
                    isPassed = true;
                }
            }

            if (!isPassed) {
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
            proof: jwt.sign({purpose:'code-grade',user_id:actor.id,question_id:targetQuestion.id,code_hash:createHash('sha256').update(code).digest('hex'),passed:finalStatus==='PASSED'},process.env.JWT_SECRET!,{expiresIn:'7d'}),
            status: finalStatus,
            passed: passedCount,
            total: testCases.length,
            output: test.exam_mode ? (finalStatus==='PASSED'?'Тексерулер орындалды.':'Код тексеруден өтпеді.') : consoleOutput
        });

    } catch (error: any) {
        console.error('Execute API error:', error.message);
        res.status(500).json({ status: 'FAILED', output: 'Server error during code execution' });
    }
}

export default secure(handler, 'execute.ts');

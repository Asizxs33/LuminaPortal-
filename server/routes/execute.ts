import express from 'express';
import { pool as db } from '../db.js';
import { spawnSync } from 'child_process';

const router = express.Router();

interface TestCase {
  input: string;
  expected_output: string;
}

// POST /api/execute
// Body: { code: string, language: string, test_id: string, question_index: number }
router.post('/', async (req, res) => {
    console.log('[execute] POST /api/execute received');
    try {
        const { code, language, test_id, question_index } = req.body;
        console.log('[execute] params:', { language, test_id, question_index, codeLen: code?.length });

        if (!code || !language || !test_id || question_index === undefined) {
             return res.status(400).json({ message: 'Missing required parameters' });
        }

        // 1. Get the target question directly from the database
        console.log('[execute] querying DB...');
        const result = await db.query(`
            SELECT * FROM questions 
            WHERE test_id = $1 
            ORDER BY order_index ASC
        `, [test_id]);
        console.log('[execute] DB returned', result.rows.length, 'rows');
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Test or questions not found' });
        }

        const targetQuestion = result.rows[question_index];

        if (!targetQuestion || targetQuestion.type !== 'CODE' || !targetQuestion.test_cases) {
            return res.status(400).json({ message: 'Invalid question or not a code question' });
        }

        const testCases: TestCase[] = targetQuestion.test_cases;
        
        let passedCount = 0;
        let finalStatus = 'PASSED';
        let consoleOutput = '';

        // Run code for every test case
        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];
            let stdout = "";
            let stderr = "";
            
            console.log(`[execute] Running test case ${i + 1}/${testCases.length}`);

            try {
                // Build code: user code + test call appended
                const fullCode = `${code}\n\n${tc.input}`;

                // Execute Python locally using spawnSync
                const proc = spawnSync('python3', ['-c', fullCode], {
                    timeout: 5000,
                    encoding: 'utf-8',
                    stdio: ['pipe', 'pipe', 'pipe']
                });

                stdout = (proc.stdout || '').trim();
                stderr = (proc.stderr || '').trim();

                if (proc.error) {
                    stderr = proc.error.message || 'Execution error';
                }
                
                console.log(`[execute] TC ${i+1}: stdout="${stdout}", stderr="${stderr}"`);

            } catch (e: any) {
                stderr = e.message || 'Unknown error';
                console.error(`[execute] TC ${i+1} exception:`, stderr);
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

        console.log('[execute] Sending response:', finalStatus);
        return res.json({
            status: finalStatus,
            passed: passedCount,
            total: testCases.length,
            output: consoleOutput
        });

    } catch (error) {
        console.error('Execute route error:', error);
        res.status(500).json({ message: 'Server error during code execution' });
    }
});

router.post('/seed-olympiad', async (_req, res) => {
    try {
        const title = 'Олимпиада: Негізгі Алгоритмдер';
        const subject = 'Информатика';
        const desc = 'Екі санды қосу алгоритмі. Функция жазып, оны тексеріңіз.';
        const dur = 30;
        const pass = 100;

        // Insert Test
        const testRes = await db.query(`
            INSERT INTO tests (id, title, subject, description, duration_minutes, passing_score, is_published)
            VALUES ($1, $2, $3, $4, $5, $6, true)
            RETURNING id
        `, ['olympiad_1', title, subject, desc, dur, pass]);

        const testId = testRes.rows[0].id;

        // Insert CODE question with testcases
        const testCases = JSON.stringify([
          { input: 'print(add(1, 2))', expected_output: '3' },
          { input: 'print(add(10, -5))', expected_output: '5' },
          { input: 'print(add(0, 0))', expected_output: '0' }
        ]);

        await db.query(`
             INSERT INTO questions (test_id, type, text, initial_code, test_cases, order_index)
             VALUES ($1, $2, $3, $4, $5, 1)
        `, [testId, 'CODE', 'Екі санды қосатын функция жазыңыз. Функция атауы `add` болуы керек.', 'def add(a, b):\n    # Кодты осы жерге жазыңыз\n    pass', testCases]);

        res.json({ message: 'Seeded successfully' });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;

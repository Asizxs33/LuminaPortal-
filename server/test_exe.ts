import { pool as db } from './db.js';

async function testExecute() {
     try {
         const test_id = 'olympiad_1';
         const question_index = 0;
         const code = 'def add(a, b):\n    return a + b';

        const result = await db.query(`
            SELECT * FROM questions 
            WHERE test_id = $1 
            ORDER BY order_index ASC
        `, [test_id]);
        
        const targetQuestion = result.rows[question_index];
        const testCases = targetQuestion.test_cases;
        
        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];
            
            const execCode = `${code}\n\n${tc.input}`;
                     
             const fs = await import('fs/promises');
             const { exec } = await import('child_process');
             const path = await import('path');
             const os = await import('os');
             const util = await import('util');
             const execPromise = util.promisify(exec);

             const tempFile = path.join(os.tmpdir(), `test_${Date.now()}_${i}.py`);
             await fs.writeFile(tempFile, execCode);

             try {
                 const result = await execPromise(`python3 ${tempFile}`, { timeout: 3000 });
                 console.log("Success stdout:", result.stdout);
             } catch (e: any) {
                 console.log("Error stdout:", e.stdout);
             } finally {
                 await fs.unlink(tempFile).catch(() => {});
             }
        }
        process.exit(0);

     } catch(e) {
         console.error("FATAL ERROR", e);
     }
}

testExecute();

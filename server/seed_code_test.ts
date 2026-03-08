import { pool as db } from './db.js';

const seedCodeTest = async () => {
  try {
    const title = 'Олимпиада: Негізгі Алгоритмдер';
    const subject = 'Информатика';
    const desc = 'Екі санды қосу алгоритмі. Функция жазып, оны тексеріңіз.';
    const dur = 30;
    const pass = 100;

    const testRes = await db.query(`
        INSERT INTO tests (id, title, subject, description, duration_minutes, passing_score, is_published)
        VALUES ($1, $2, $3, $4, $5, $6, true)
        ON CONFLICT (id) DO NOTHING
        RETURNING id
    `, ['olympiad_1', title, subject, desc, dur, pass]);

    let testId = 'olympiad_1';
    if (testRes.rows.length > 0) {
        testId = testRes.rows[0].id;
    }

    const testCases = JSON.stringify([
      { input: 'console.log(add(1, 2));', expected_output: '3' },
      { input: 'console.log(add(10, -5));', expected_output: '5' },
      { input: 'console.log(add(0, 0));', expected_output: '0' }
    ]);

    await db.query(`
         INSERT INTO questions (test_id, type, text, initial_code, test_cases, order_index)
         VALUES ($1, $2, $3, $4, $5, 1)
    `, [testId, 'CODE', 'Екі санды қосатын функция жазыңыз. Функция атауы `add` болуы керек.', 'function add(a, b) {\n    // Кодты осы жерге жазыңыз\n\n    return a + b;\n}', testCases]);
    
    console.log('Test seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedCodeTest();

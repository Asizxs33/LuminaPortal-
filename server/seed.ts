/**
 * Seed script — run once to populate database
 * Usage: npx tsx server/seed.ts
 */
import { sql } from './db.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

async function seed() {
    console.log('🌱 Seeding database...');

    // Create tables
    await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      group_name TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

    await sql`
    CREATE TABLE IF NOT EXISTS tests (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subject TEXT,
      description TEXT,
      duration_minutes INT DEFAULT 30,
      passing_score INT DEFAULT 70,
      is_published BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

    await sql`
    CREATE TABLE IF NOT EXISTS questions (
      id SERIAL PRIMARY KEY,
      test_id TEXT REFERENCES tests(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      type TEXT DEFAULT 'single',
      order_index INT DEFAULT 0
    )
  `;

    await sql`
    CREATE TABLE IF NOT EXISTS options (
      id SERIAL PRIMARY KEY,
      question_id INT REFERENCES questions(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      is_correct BOOLEAN DEFAULT false
    )
  `;

    await sql`
    CREATE TABLE IF NOT EXISTS results (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      test_id TEXT REFERENCES tests(id) ON DELETE CASCADE,
      score INT NOT NULL,
      total INT NOT NULL,
      passed BOOLEAN,
      completed_at TIMESTAMP DEFAULT NOW()
    )
  `;

    console.log('✅ Tables created');

    // Seed users
    const adminPass = await bcrypt.hash('admin123', 10);
    const studentPass = await bcrypt.hash('student123', 10);

    await sql`
    INSERT INTO users (name, email, password, role, group_name) VALUES
      ('Әкімші', 'admin@lumina.edu', ${adminPass}, 'admin', NULL),
      ('Айгерім Бекова', 'student@lumina.edu', ${studentPass}, 'student', 'CS-201'),
      ('Нұрлан Сейтқали', 'nurlan@lumina.edu', ${studentPass}, 'student', 'CS-201'),
      ('Данияр Омаров', 'daniyar@lumina.edu', ${studentPass}, 'student', 'PH-102'),
      ('Сабина Касымова', 'sabina@lumina.edu', ${studentPass}, 'student', 'MT-305'),
      ('Ерлан Мұратов', 'erlan@lumina.edu', ${studentPass}, 'student', 'HI-110'),
      ('Асель Жанбекова', 'asel@lumina.edu', ${studentPass}, 'student', 'PH-102'),
      ('Меруерт Алиева', 'meruert@lumina.edu', ${studentPass}, 'student', 'HI-110')
    ON CONFLICT (email) DO NOTHING
  `;

    console.log('✅ Users seeded');

    // Seed tests
    await sql`
    INSERT INTO tests (id, title, subject, description, duration_minutes, passing_score, is_published) VALUES
      ('math', 'Жоғары математика', 'Математика', 'Математикалық анализ, алгебра және геометрия негіздері', 45, 70, true),
      ('physics', 'Жоғары физика', 'Физика', 'Классикалық механика, термодинамика және электродинамика', 40, 65, true),
      ('history', 'Дүниежүзі тарихы', 'Тарих', 'Ежелгі дүниеден қазіргі заманға дейінгі тарихи оқиғалар', 30, 60, true),
      ('kazakh', 'Қазақ тілі', 'Тіл', 'Қазақ тілінің грамматикасы және стилистикасы', 35, 70, true)
    ON CONFLICT (id) DO NOTHING
  `;

    console.log('✅ Tests seeded');

    // Seed math questions
    const [q1] = await sql`
    INSERT INTO questions (test_id, text, type, order_index) VALUES
      ('math', 'Туынды анықтамасы дегеніміз не?', 'single', 1)
    RETURNING id
  `;
    await sql`
    INSERT INTO options (question_id, text, is_correct) VALUES
      (${q1.id}, 'Функцияның өсімшесінің аргумент өсімшесіне қатынасының шегі', true),
      (${q1.id}, 'Функцияның барынша үлкен мәні', false),
      (${q1.id}, 'Функцияның белгілі бір нүктедегі мәні', false),
      (${q1.id}, 'Функцияның интегралы', false)
  `;

    const [q2] = await sql`
    INSERT INTO questions (test_id, text, type, order_index) VALUES
      ('math', 'sin²(x) + cos²(x) = ?', 'single', 2)
    RETURNING id
  `;
    await sql`
    INSERT INTO options (question_id, text, is_correct) VALUES
      (${q2.id}, '1', true),
      (${q2.id}, '0', false),
      (${q2.id}, '2', false),
      (${q2.id}, 'sin(2x)', false)
  `;

    const [q3] = await sql`
    INSERT INTO questions (test_id, text, type, order_index) VALUES
      ('math', 'Интеграл дегеніміз не?', 'single', 3)
    RETURNING id
  `;
    await sql`
    INSERT INTO options (question_id, text, is_correct) VALUES
      (${q3.id}, 'Туындының кері операциясы', true),
      (${q3.id}, 'Функцияның туындысы', false),
      (${q3.id}, 'Функцияның барынша кіші мәні', false),
      (${q3.id}, 'Функцияның нөлі', false)
  `;

    const [q4] = await sql`
    INSERT INTO questions (test_id, text, type, order_index) VALUES
      ('math', 'π (пи) санының мәні шамамен қандай?', 'single', 4)
    RETURNING id
  `;
    await sql`
    INSERT INTO options (question_id, text, is_correct) VALUES
      (${q4.id}, '3.14159', true),
      (${q4.id}, '2.71828', false),
      (${q4.id}, '1.41421', false),
      (${q4.id}, '1.61803', false)
  `;

    const [q5] = await sql`
    INSERT INTO questions (test_id, text, type, order_index) VALUES
      ('math', 'Матрица деп нені атайды?', 'single', 5)
    RETURNING id
  `;
    await sql`
    INSERT INTO options (question_id, text, is_correct) VALUES
      (${q5.id}, 'Тіктөртбұрышты орналасқан сандар кестесі', true),
      (${q5.id}, 'Санлар жиыны', false),
      (${q5.id}, 'Функциялар жүйесі', false),
      (${q5.id}, 'Теңдеу шешімі', false)
  `;

    // Seed physics questions  
    const [p1] = await sql`
    INSERT INTO questions (test_id, text, type, order_index) VALUES
      ('physics', 'Ньютонның бірінші заңы:', 'single', 1)
    RETURNING id
  `;
    await sql`
    INSERT INTO options (question_id, text, is_correct) VALUES
      (${p1.id}, 'Дене сыртқы күш болмаса тыныштық немесе бірқалыпты түзу сызықты қозғалысын сақтайды', true),
      (${p1.id}, 'Күш масса мен үдеу көбейтіндісіне тең', false),
      (${p1.id}, ' Әрбір әрекетке тең қарсы әрекет бар', false),
      (${p1.id}, 'Дене жылдамдығы уақытқа тікелей пропорционал', false)
  `;

    const [p2] = await sql`
    INSERT INTO questions (test_id, text, type, order_index) VALUES
      ('physics', 'Жарықтың вакуумдегі жылдамдығы:', 'single', 2)
    RETURNING id
  `;
    await sql`
    INSERT INTO options (question_id, text, is_correct) VALUES
      (${p2.id}, '3 × 10⁸ м/с', true),
      (${p2.id}, '3 × 10⁶ км/с', false),
      (${p2.id}, '340 м/с', false),
      (${p2.id}, '1500 м/с', false)
  `;

    const [p3] = await sql`
    INSERT INTO questions (test_id, text, type, order_index) VALUES
      ('physics', 'Қай физика заңы: F = ma ?', 'single', 3)
    RETURNING id
  `;
    await sql`
    INSERT INTO options (question_id, text, is_correct) VALUES
      (${p3.id}, 'Ньютонның 2-ші заңы', true),
      (${p3.id}, 'Ньютонның 1-ші заңы', false),
      (${p3.id}, 'Ньютонның 3-ші заңы', false),
      (${p3.id}, 'Архимед заңы', false)
  `;

    console.log('✅ Questions and options seeded');

    // Seed some results
    const students = await sql`SELECT id FROM users WHERE role = 'student' LIMIT 5`;
    for (const student of students) {
        await sql`
      INSERT INTO results (user_id, test_id, score, total, passed) VALUES
        (${student.id}, 'math', ${Math.floor(Math.random() * 3) + 2}, 5, ${Math.random() > 0.3})
      ON CONFLICT DO NOTHING
    `;
    }

    console.log('✅ Results seeded');
    console.log('\n🎉 Database seeded successfully!');
    console.log('\nDefault accounts:');
    console.log('  Admin:   admin@lumina.edu / admin123');
    console.log('  Student: student@lumina.edu / student123');
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});

import {readFile} from 'node:fs/promises';
import {Pool} from 'pg';
import {config} from 'dotenv';
import {audioKey, audioLabel} from '../../api/_lib/question-audio';
import {parseTest, type TestFile} from '../../desktop/src/model';

type AudioExport = TestFile & {audio?: Record<string, {
  labels: string[];
  questions: Record<string, {question: string; options: Record<string, string>}>;
}>};

async function main() {
  const source = process.argv[2];
  if (!source) throw Error('Provide the local .lumina-test file containing the generated audio.');
  const {audio: recordings, ...testFile} = JSON.parse(await readFile(source, 'utf8')) as AudioExport;
  const file = parseTest(JSON.stringify(testFile));
  const clips = new Map<string, Buffer>();
  for (const test of file.package.tests) {
    const audio = recordings?.[test.id];
    if (!audio || test.language !== 'kk') continue;
    function add(text: string, clip: string) {
      if (typeof clip !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(clip)) throw Error('Invalid recording.');
      const data = Buffer.from(clip, 'base64');
      if (!data.length || data.length > 300_000) throw Error('Invalid recording size.');
      clips.set(audioKey(test.language, text), data);
    }
    for (const question of test.questions) {
      const record = audio.questions?.[question.id];
      if (!record) continue;
      add(question.text, record.question);
      question.options.forEach((option, i) => {
        add(audioLabel(i), audio.labels[i]);
        add(option.text, record.options[option.id]);
      });
    }
  }
  if (!clips.size) throw Error('No Kazakh recordings found.');

  config({path: '.env.local', quiet: true});
  if (!process.env.DATABASE_URL) throw Error('DATABASE_URL is missing.');
  const pool = new Pool({connectionString: process.env.DATABASE_URL, ssl: {rejectUnauthorized: true}});
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(await readFile('server/migrations/20261110-question-audio.sql', 'utf8'));
      await client.query(await readFile('server/migrations/20261110-question-audio-size.sql', 'utf8'));
      const entries = [...clips];
      for (let offset = 0; offset < entries.length; offset += 64) {
        const batch = entries.slice(offset, offset + 64);
        await client.query(
          'INSERT INTO question_audio(hash,audio) SELECT * FROM unnest($1::text[], $2::bytea[]) ON CONFLICT(hash) DO UPDATE SET audio=EXCLUDED.audio',
          [batch.map(([hash]) => hash), batch.map(([, audio]) => `\\x${audio.toString('hex')}`)],
        );
      }
      await client.query('COMMIT');
      console.log(`Stored ${clips.size} recordings for the website.`);
    } catch {
      await client.query('ROLLBACK');
      throw Error('Audio import failed. No recordings were changed.');
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

void main().catch(error => {
  console.error(error instanceof Error ? error.message : 'Audio import failed.');
  process.exitCode = 1;
});

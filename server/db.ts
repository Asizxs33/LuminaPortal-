import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

/** Tagged template literal helper — mirrors neon() API so routes work unchanged */
export async function sql(strings: TemplateStringsArray, ...values: any[]): Promise<any[]> {
    let text = '';
    strings.forEach((s, i) => {
        text += s;
        if (i < values.length) text += `$${i + 1}`;
    });
    const result = await pool.query(text, values);
    return result.rows;
}

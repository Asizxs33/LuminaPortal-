import express from 'express';
import dotenv from 'dotenv';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// Run from the repository root. Keep credentials on the server.
dotenv.config({ path: '.env.local', quiet: true });
dotenv.config({ quiet: true });
if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
  throw new Error('DATABASE_URL and JWT_SECRET are required in .env.local');
}

const app = express();
app.use(express.json({ limit: '10mb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

const routes = [
  ['/auth/:action', 'auth/[action].ts'],
  ['/tests', 'tests/index.ts'],
  ['/tests/:id', 'tests/[id].ts'],
  ['/students', 'students/index.ts'],
  ['/students/:id', 'students/[id].ts'],
  ['/results/user/:userId', 'results/user/[userId].ts'],
  ['/results', 'results/index.ts'],
  ['/questions', 'questions/index.ts'],
  ['/users/coins', 'users/coins.ts'],
  ['/admin/users/grant-coins', 'admin/users/grant-coins.ts'],
  ['/mentor/hint', 'mentor/hint.ts'],
  ['/execute', 'execute.ts'],
];
for (const [route, file] of routes) {
  app.all(`/api${route}`, async (req, res) => {
    try {
      // Vercel places dynamic route parameters in query; Express keeps them separate.
      Object.defineProperty(req, 'query', { value: { ...req.query, ...req.params }, configurable: true });
      const module = await import(pathToFileURL(path.resolve('api', file)).href);
      await module.default(req, res);
    } catch {
      if (!res.headersSent) res.status(500).json({ error: 'Local API request failed' });
    }
  });
}
app.use('/api', (_req, res) => res.status(404).json({ error: 'Endpoint not found' }));

const webRoot = path.resolve('react-native-app/dist');
app.use(express.static(webRoot, { extensions: ['html'] }));
app.use((req, res) => {
  if (req.method !== 'GET') return res.sendStatus(405);
  const match = req.path.match(/^\/test\/[^/]+\/(start|take|result|edit|results)$/);
  const file = match ? path.join(webRoot, 'test', '[id]', `${match[1]}.html`) : path.join(webRoot, '+not-found.html');
  if (!existsSync(file)) return res.sendStatus(404);
  return res.status(match ? 200 : 404).sendFile(file);
});
app.listen(4189, '127.0.0.1', () => {
  console.log('Local site and API ready: http://127.0.0.1:4189');
});

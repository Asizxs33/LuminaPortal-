// Non-destructive checks: deliberately nonexistent object IDs, no login attempts.
const assert = require('node:assert/strict');
const base = 'http://127.0.0.1:4189';
const routes = [
  ['/api/students/2147483647', 'DELETE'],
  ['/api/students/2147483647', 'PATCH'],
  ['/api/students', 'GET'],
  ['/api/tests', 'POST'],
  ['/api/tests/nonexistent-security-check', 'DELETE'],
  ['/api/tests/nonexistent-security-check', 'PATCH'],
  ['/api/tests?history=true', 'GET'],
  ['/api/questions', 'POST'],
  ['/api/questions?id=2147483647', 'DELETE'],
  ['/api/results', 'DELETE'],
  ['/api/admin/users/grant-coins', 'POST'],
  ['/api/execute', 'POST'],
  ['/api/mentor/hint', 'POST'],
  ['/api/results/user/2147483647', 'GET'],
];
(async () => {
  let checked = 0;
  for (const [path, method] of routes) {
    for (const token of [null, 'invalid-security-check-token']) {
      const response = await fetch(base + path, {
        method, signal: AbortSignal.timeout(15000),
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
        ...(['POST', 'PATCH', 'DELETE'].includes(method) ? { body: '{}' } : {}),
      });
      await response.body?.cancel();
      assert.equal(response.status, 401, `${method} ${path}, ${token ? 'forged' : 'anonymous'}`);
      checked++;
    }
  }
  const page = await fetch(base + '/login');
  assert.equal(page.headers.get('x-frame-options'), 'DENY');
  assert.equal(page.headers.get('x-content-type-options'), 'nosniff');
  assert.ok(page.headers.get('content-security-policy')?.includes("frame-ancestors 'none'"));
  await page.body?.cancel();
  console.log(`PASS: ${checked} anonymous/forged-token checks returned 401; clickjacking and MIME-sniffing headers present.`);
})().catch(error => { console.error(error.message); process.exitCode = 1; });

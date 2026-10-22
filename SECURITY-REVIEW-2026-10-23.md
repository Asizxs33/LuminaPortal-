# Local security review — 2026-10-23

## Strix setup and execution status

Installed the nine official skills from https://github.com/usestrix/strix using the Codex skill installer into the user's local skill directory. Read and applied the scoping and verification guidance in `penetration-testing-with-strix`, `api-security-testing`, and `find-security-vulnerabilities-in-code`.

**The Strix scanning engine was NOT run.** Docker, `strix`, and `uv` were not available on PATH. A managed Strix Cloud connection has not been authorized/configured. No source code, database credentials, or authentication tokens were uploaded to Strix. The checks below are local regression tests and a limited manual code review, not a Strix-generated penetration test report.

## Verified checks

Target: local API at `http://127.0.0.1:4189`; current uncommitted working tree. These results do not verify the deployed production version.

1. `node server/scripts/check-anonymous-access.cjs`: **28 passed**. Anonymous requests and forged bearer tokens received HTTP 401 on user deletion/role changes, test creation/edit/deletion, backup history, question mutations, result deletion, coin grants, code execution, mentor, and user result routes. Requests used deliberately nonexistent object IDs.
2. Login response contained `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and CSP `frame-ancestors 'none'`.
3. `node server/scripts/check-teacher.cjs`: **36 passed**. Teacher ownership boundaries, foreign test/result access denial, user/role/coin/backup restrictions, student restrictions, result snapshot before deletion, admin assignment of teacher role, and old-session revocation passed. Temporary QA accounts and tests were removed by the fixture cleanup. Existing user accounts and tests were not mutation targets.
4. Root `npm audit --json`: **0 advisories**.
5. Frontend `npm audit --json`: **26 high-severity dependency entries, 0 critical**. Includes transitive chains through Expo/Metro/Jest/Tailwind, notably `braces` and `node-forge`. Entries count affected packages and propagated dependencies, not 26 independently exploitable website bugs. Runtime reachability was not established. Do not apply `npm audit fix --force` blindly: suggested fixes include incompatible major versions/downgrades.

## Code observations and subsequent local fixes

These were source-level concerns, not Strix-validated exploit findings. Subsequently patched locally and verified with isolated fixtures and stubbed external providers:

- `api/mentor/hint.ts`: balance is read before an external AI call, then decremented unconditionally. Concurrent requests may overspend the same balance. Use an atomic conditional debit/reservation, idempotency, and refund on provider failure. No paid provider calls were made to reproduce this.
- `api/execute.ts`: outbound compilation requests have no explicit timeout and iterate over stored test cases. Add bounded code/input/test-case sizes, total execution deadlines, and bounded provider output. The existing per-user request rate limit does not bound the cost of an individual request. No resource-exhaustion traffic was generated.
- `api/execute.ts`: non-exam execution checks test existence but does not independently enforce publication or assigned-question access. Recheck authorization consistently before sending stored test inputs to the compiler. No private real test inputs were requested to validate this concern.

### Remediation verification

`node node_modules/tsx/dist/cli.mjs server/scripts/check-provider-security.ts`: **15 checks passed**, including concurrent requests against a 10-coin fixture balance (one succeeds, one is denied, only one provider call), rollback on AI failure, rejection of closed/unassigned questions, oversized code rejection, valid code execution with grading proof, provider error handling, and bounded streamed response parsing. External provider calls were stubbed; temporary QA database records were removed.

- Mentor debit now uses a conditional `UPDATE ... WHERE coins >= 10` inside a transaction, committed only after a nonempty successful provider result. Failures roll back. Provider timeout: 20 seconds; lock timeout: 5 seconds.
- Execution enforces teacher ownership, publication for learners, assignment for practice questions, a 50,000-byte code cap, 1–20 test cases with bounded inputs/expected outputs, a shared 25-second provider deadline, and a 256,000-byte streamed response cap.
- Targeted backend TypeScript validation passed. Frontend dependency advisories remain outstanding. These changes have not been pushed or deployed to production.

## Coverage limits and next step

This review does not certify the site as secure. No autonomous exploitation, load/DDoS testing, hosting review, exhaustive XSS/SSRF testing, backup recovery drill, or production scan was performed in this run. The subsequent fixes above are local; no deployment or push was performed.

For an actual Strix engine run, configure either Docker plus a user-selected LLM/key or a user-authorized Strix Cloud account. Use an isolated staging database and a clean source snapshot that excludes secrets. The Strix skills warn that local code targets are writable; do not scan the dirty development checkout directly. Define a spend cap, exclude real-user destructive routes and paid email/AI operations, and verify the resulting report, coverage, and run status before drawing conclusions.

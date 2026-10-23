# Question counts, language versions, shared tests, and retakes

## Setup

Run `node server/scripts/migrate-test-versions.cjs` before deploying this version. The additive migration preserves existing questions, results, and exam attempts. It was applied to the configured development database on 2026-10-23.

## Teacher workflow

- Creation: choose questions per learner (for example, 30 out of a 500-question bank). `0` means the entire bank. If the bank is smaller than the selected size, all available questions are used. Applies to practice and server-managed exams.
- Choose the main language: Kazakh, Russian, or English. Optionally upload a second Word file in another language. Both files are parsed before a single database transaction creates both versions; an invalid second file leaves neither version created. The preview lists counts per language. The files must contain their own correct-answer keys; this does not translate or validate the factual answer key.
- Each language is independently editable and published. Publish both versions to offer the learner a choice on the start page. Cards show language, round, and bank/attempt counts.
- All teachers can read administrator-owned and legacy administrator-managed tests and their results/event journals. They cannot change questions, publish/close these tests, end their exams, create retakes, or delete their results. Ownership checks remain enforced on the API. A teacher's own tests retain existing management permissions.
- “Қайта тапсыру” creates a new draft round, copying every language version and its questions/options/code setup/images. Publish the drafts after review. Existing test IDs, exam attempts/events, results, and answer reviews remain unchanged. The new round gets new IDs and fresh learner attempts. Old and new rounds appear separately in the test/results lists.

## Verification

- `node server/scripts/check-test-versions.cjs`: 28 checks passed, covering atomic bilingual import, preview, count selection in exam/practice, read-only sharing and API denial of modifications/deletion, retake copy and old result/attempt preservation.
- `node server/scripts/check-teacher.cjs`: 36 role/ownership checks passed.
- Frontend/backend TypeScript checks and web export passed.
- UI checked on an isolated fixture origin with no database connection: creation fields, main/second-language choices, and shared teacher cards without edit/publish controls.

These changes are local until committed/pushed and deployed. The Strix engine was not used for this feature verification.

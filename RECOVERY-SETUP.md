# Password recovery and learning data

Run `node server/scripts/migrate-learning.cjs` once for each database. This additive migration retains existing accounts and results; old attempts have no answer review.

Configure these server-only environment variables locally in `.env.local` and in the deployment environment:

- `RESEND_API_KEY`: API key from Resend.
- `EMAIL_FROM`: sender on a domain verified by Resend, e.g. `LuminaPortal <accounts@example.com>`.
- `APP_URL`: public origin used in password-reset links. Use the deployed HTTPS origin in production.
- Existing `DATABASE_URL` and `JWT_SECRET` remain required.

The reset link expires in 30 minutes, is single-use, and is stored only as a hash. Requests for the same account are limited to one email per five minutes. Without email configuration the UI reports that recovery is unavailable. No fake success message or reset token is returned to the client.

Question and creation drafts are saved on the current device per account. Test attempts retain their question order, answers, marked questions, and original deadline across refreshes. Clearing browser storage removes local drafts. Results and answer reviews are saved in the database after submission. Server grading validates choice answers and signed code-check proofs.

Local preview: export the web build from `react-native-app`, then run `npm run preview` from the repository root. After API changes restart this server.

# Exam mode

Apply `node server/scripts/migrate-exams.cjs` for each database before deploying the API and frontend together. Existing and new tests default to exam mode. Switch a test to training in its editor before the first exam attempt.

One server attempt per account/test stores an immutable random question/option snapshot and deadline. Reloads and device clock changes cannot create extra time. Answers sync 300 ms after edits and every five seconds. At expiry, only answers received before the deadline are graded. An offline student can reconnect and submit the last server snapshot; unsent changes after expiry are not accepted. Results are materialized on submission/reconnection, not by a background scheduler.

The student is informed before entering. Supported web browsers request fullscreen. Blur, page hiding and fullscreen exit are logged with server receipt times; events within two seconds are deduplicated. Three violations end the server deadline. Unsupported fullscreen is recorded separately, without penalty. These browser events are signals for teacher review, not proof of cheating. A normal website cannot block other applications, detect another device, or make client telemetry tamper-proof.

Teachers open the test editor or test results to inspect the journal. **End exam and release answers** closes the test, ends remaining deadlines and releases answer reviews to everyone. This is permanent for this test; create another test for another exam session. The question bank remains available to teachers. Students cannot retrieve question keys, code test expectations or answer reviews before release. Mentor requests are blocked by the API for exams and while another exam attempt is ongoing.

Verification: `node server/scripts/check-exams.cjs` runs local API checks with isolated disposable fixtures and removes them afterwards. It verifies immutable deadlines/order, late answer rejection, review locking, access restrictions, event deduplication, three-event closure and teacher release.

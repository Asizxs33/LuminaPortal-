# Teacher role

Run `node server/scripts/migrate-teacher.cjs` before starting the updated API.

- Public registration always creates a student. Only administrators assign roles.
- Teacher (`teacher`): create/import tests, edit their own question banks, publish or close their own tests, inspect and delete results for their own tests.
- Teachers cannot delete tests, access other teachers' question banks/results, manage users or roles, grant coins, or access global history/backups.
- `tests.created_by` is assigned by the server; callers cannot choose the owner. Legacy tests stay unowned and administrator managed.
- Result deletion captures a history snapshot in the same transaction. Administrators can inspect archived results in History.
- Changing a role invalidates previous sessions and requires signing in again.
- The admin Students page offers Student / Teacher / Administrator with confirmation. No existing account is promoted by the migration.

# CMA API — Security Review

Status below describes the code on the `hardening/validation-auth` branch. Review and run the full application tests before merging or deploying.

## Implemented in this branch

- [x] **Registration role assignment:** public registration accepts only name, email, and password; the server assigns `DEFAULT_ROLE_ID` and rejects configured role names commonly used for administrators.
- [x] **Request validation:** common payload validation checks object shape, required fields, unexpected fields, string lengths, and email formats; resource IDs must be positive integers.
- [x] **Update allowlists:** resource updates can change only the columns explicitly declared in `utils/resourceSchemas.js`.
- [x] **Record ownership:** resource list/read/update/delete queries are scoped to the authenticated user's `user_id`; create requests take ownership from the verified token rather than the request body.
- [x] **Safe API errors:** API responses no longer include raw database error details; logs include only error codes/names.
- [x] **JWT secret checks:** token helpers require secrets of at least 32 characters.
- [x] **Unit tests:** validation and resource-schema tests are included and `npm test` runs Node's built-in test runner.

## Still required before production

- [ ] **Verify default role configuration:** set `DEFAULT_ROLE_ID` to an existing least-privilege role in the local `roles` table and confirm registration works.
- [ ] **Integration tests:** test registration, login, token refresh, CRUD success/failure, and cross-user access against a dedicated test database.
- [ ] **Rate limiting:** limit login, registration, and refresh endpoints.
- [ ] **Refresh-token lifecycle:** implement rotation, revocation, and replay protection if required by the deployment threat model.
- [ ] **Database transport:** review `ssl: false` in `db.js` before using a hosted database; configure TLS as required by the provider.
- [ ] **Role-based permissions:** confirm whether roles such as finance or employee need different permissions. Current resource isolation is per-user; this branch does not implement a full role-permission matrix.
- [ ] **Input-specific validation:** add format/range checks for dates, phone numbers, and domain-specific fields.
- [ ] **Privacy:** use synthetic data for screenshots and seed files, never real patient or client information.

Do not describe any remaining item as implemented until code and tests confirm it.

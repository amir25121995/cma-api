# CMA API — Security Review

This checklist records issues to verify before presenting the API as production-ready.

- [ ] **Registration roles:** remove public control over privileged role assignment. First confirm the intended default role from the database schema; do not guess a numeric role ID.
- [ ] **Validation:** validate required fields, formats, IDs, and permitted update fields.
- [ ] **SQL updates:** use an explicit column allowlist for dynamic updates.
- [ ] **Error handling:** return generic client-facing errors; keep safe diagnostic details in server logs.
- [ ] **Rate limiting:** add limits for login, registration, and refresh endpoints.
- [ ] **JWT secrets:** fail startup if required secrets are missing or weak; use distinct secrets.
- [ ] **Refresh tokens:** consider rotation, revocation, and replay protection.
- [ ] **Database transport:** review `ssl: false` in `db.js` before using a hosted database.
- [ ] **Authorization:** confirm role/ownership rules for every resource route.
- [ ] **Tests:** add success, validation-failure, unauthorized, forbidden, and not-found cases.
- [ ] **Privacy:** use synthetic data for screenshots and seed files.

Do not describe any checklist item as implemented until code and tests confirm it.

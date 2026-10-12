# CMA API

A REST API built with Node.js, Express, and PostgreSQL for managing CMA resources.

## Technology stack

- Node.js 22
- Express 5
- PostgreSQL via `pg`
- JWT access and refresh tokens
- `bcrypt` password hashing
- `dotenv` configuration
- Node's built-in test runner

## API surface

The API includes authentication routes, a health endpoint, and user-scoped CRUD routes for clients, cases, hospitals, and providers. Resource access is protected by bearer access tokens.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Register with the configured default role |
| POST | `/auth/login` | Verify credentials and issue tokens |
| POST | `/auth/refresh` | Verify a refresh token and issue new tokens |
| GET | `/health` | Health response |
| GET, POST | `/clients` | List or create current user's clients |
| GET, PUT, DELETE | `/clients/:id` | Read, update, or delete a current user's client |
| GET, POST | `/cases` | List or create current user's cases |
| GET, PUT, DELETE | `/cases/:id` | Read, update, or delete a current user's case |
| GET, POST | `/hospitals` | List or create current user's hospitals |
| GET, PUT, DELETE | `/hospitals/:id` | Read, update, or delete a current user's hospital |
| GET, POST | `/providers` | List or create current user's providers |
| GET, PUT, DELETE | `/providers/:id` | Read, update, or delete a current user's provider |

## Local setup

Requirements: Node.js 22 and PostgreSQL.

```bash
git clone https://github.com/amir25121995/cma-api.git
cd cma-api
npm install
```

Copy `.env.example` to `.env`. Configure `DATABASE_URL`, token secrets, and `DEFAULT_ROLE_ID`. The default role ID must already exist in the `roles` table and must be a least-privilege role appropriate for self-registration. Never configure a privileged administrator role for public registration.

Apply the SQL schema from `sql/create_tables.sql` to a local development database, then start the server:

```bash
npm run dev
```

Check `http://localhost:3000/health`.

## Tests

Run the built-in Node test suite:

```bash
npm test
```

Tests currently cover shared payload validation, ID validation, resource schema allowlists, and nullable optional case dates. Run tests locally and add integration tests against a dedicated test database before treating the API as production-ready.

## Security notes

- Registration ignores caller-supplied role fields and uses the server-configured `DEFAULT_ROLE_ID`.
- Request payloads are validated against explicit field allowlists.
- Resource queries are scoped to the authenticated user's `user_id`.
- Database error details are not returned to API clients.
- JWT secrets must be at least 32 characters and should be distinct.
- Public deployment still needs rate limiting, review of PostgreSQL TLS configuration, refresh-token rotation/revocation, and integration tests.
- Never use real patient or client data in screenshots or sample fixtures.

These protections should be tested in a real environment before deployment.

## Related repository

- [CMA Laravel web application](https://github.com/amir25121995/cma)

The integration between the Laravel application and this API should be documented only after it is verified in the application code.

## Author

**Amir Ali** · [GitHub profile](https://github.com/amir25121995)

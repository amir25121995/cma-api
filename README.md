# CMA API

A REST API built with Node.js, Express, and PostgreSQL for managing CMA resources.

## Technology stack

- Node.js (the repository specifies version 22.14.0)
- Express 5
- PostgreSQL via `pg`
- JSON Web Tokens via `jsonwebtoken`
- `bcrypt` for password hashing
- `dotenv` for environment configuration
- `nodemon` for development

## Current API surface

The entry point mounts authentication routes and resource routers for clients, cases, hospitals, and providers.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Register a user |
| POST | `/auth/login` | Authenticate and issue tokens |
| POST | `/auth/refresh` | Verify a refresh token and issue new tokens |
| GET | `/health` | Health response |
| GET | `/clients` | List clients |
| GET | `/clients/:id` | Fetch one client |
| POST | `/clients` | Create a client |
| PUT | `/clients/:id` | Update a client |
| DELETE | `/clients/:id` | Delete a client |
| GET | `/cases` | List cases |
| GET | `/cases/:id` | Fetch one case |
| POST | `/cases` | Create a case |
| PUT | `/cases/:id` | Update a case |
| DELETE | `/cases/:id` | Delete a case |
| GET | `/hospitals` | List hospitals |
| GET | `/hospitals/:id` | Fetch one hospital |
| POST | `/hospitals` | Create a hospital |
| PUT | `/hospitals/:id` | Update a hospital |
| DELETE | `/hospitals/:id` | Delete a hospital |
| GET | `/providers` | List providers |
| GET | `/providers/:id` | Fetch one provider |
| POST | `/providers` | Create a provider |
| PUT | `/providers/:id` | Update a provider |
| DELETE | `/providers/:id` | Delete a provider |

Resource routes are mounted behind access-token middleware in the current entry point. Verify authorization rules, request schemas, and all response shapes before treating this table as a complete API contract.

## Getting started

### Requirements

- Node.js 22.14.0 or a compatible Node 22 release
- npm
- PostgreSQL

### Install

```bash
git clone https://github.com/amir25121995/cma-api.git
cd cma-api
npm install
```

Create a local `.env` file with the variable names expected by the code:

```dotenv
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE_NAME
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=15m
REFRESH_SECRET=use_a_different_long_random_secret
REFRESH_EXPIRES_IN=7d
```

The expiry values are examples. Use strong, distinct secrets and choose token lifetimes deliberately. Never commit the real `.env` file.

Inspect the SQL files in `sql/` and apply them to your local database in the required order. Then start the server:

```bash
npm run dev
```

For a normal start:

```bash
npm start
```

The API defaults to port 3000 unless `PORT` is configured. Check `http://localhost:3000/health`.

## Authentication example

Send login credentials to `POST /auth/login` as JSON:

```json
{
  "email": "demo@example.com",
  "password": "your-local-demo-password"
}
```

Use the returned access token in protected requests:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Confirm the exact request and response fields against the running implementation before publishing examples for registration, login, or refresh.

## Security review before deployment

The current implementation needs a security review before public production deployment:

- Do not trust a client-supplied `role_id` during public registration; assign a safe default server-side and restrict privileged role changes.
- Validate request bodies, email addresses, IDs, and allowed update fields.
- Avoid returning raw database error details to clients.
- Add rate limiting to authentication endpoints.
- Validate required JWT secrets and expiry settings at startup.
- Consider refresh-token rotation and revocation.
- Review PostgreSQL TLS settings for hosted environments; `db.js` currently sets `ssl: false`.
- Verify role and record-ownership authorization for every resource operation.
- Add automated tests for authentication, validation, and authorization.
- Never use real client, patient, or other sensitive data in demo screenshots or seed files.

These are recommendations to implement and verify, not claims that the protections are already in place.

## Related repository

- [CMA Laravel web application](https://github.com/amir25121995/cma)

The relationship between the web application and API should be described after the actual integration has been verified.

## Author

**Amir Ali** · [GitHub profile](https://github.com/amir25121995)

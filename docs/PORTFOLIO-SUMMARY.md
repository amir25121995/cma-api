# CMA API — Portfolio Summary

## Project overview

CMA API is a Node.js/Express REST API backed by PostgreSQL. The current implementation includes token-based authentication and resource routers for clients, cases, hospitals, and providers.

## Technology

- Node.js and Express 5
- PostgreSQL and the `pg` client
- JWT access/refresh tokens
- bcrypt password hashing
- dotenv configuration

## Current capabilities to demonstrate after local verification

- User registration and login
- Access-token protected resource routes
- Refresh-token endpoint
- CRUD endpoints for client, case, hospital, and provider resources
- PostgreSQL-backed persistence

## Architecture

```text
API Client
   |
   | JSON over HTTP
   v
Express Application (index.js)
   |
   +--> Authentication endpoints
   |       +--> bcrypt password hashing
   |       +--> JWT access/refresh tokens
   |
   +--> Access-token middleware
           |
           +--> /clients   --> clients router   --+
           +--> /cases     --> cases router     --+
           +--> /hospitals --> hospitals router --+--> PostgreSQL
           +--> /providers --> providers router --+
```

This diagram represents the current API repository structure. It does not assert that the Laravel web app currently calls this API.

## Important production-readiness work

- Enforce server-side role assignment at registration.
- Validate all request fields and identifiers.
- Use allowlisted columns for updates.
- Add rate limiting and security headers.
- Review PostgreSQL TLS settings for hosted deployments.
- Avoid leaking database error details.
- Add automated tests for auth and authorization.
- Verify role/record-level access control on every resource.
- Add OpenAPI documentation and sanitized demo data.

## Demo and screenshots

Add screenshots and a public demo URL only after testing a deployment. Do not publish real client or patient information.

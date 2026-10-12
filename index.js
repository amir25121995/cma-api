require('dotenv').config();
const express = require('express');
const {
  hashPassword,
  verifyPassword,
  generateTokens,
  verifyRefresh,
  verifyAccess
} = require('./auth');
const db = require('./db');
const { validatePayload } = require('./utils/validation');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });

  try {
    req.user = verifyAccess(token);
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function validateAuthBody(body, options, res) {
  const result = validatePayload(body, options);
  if (!result.valid) {
    res.status(400).json({ error: 'Validation failed', details: result.errors });
    return false;
  }
  return true;
}

app.post('/auth/register', async (req, res) => {
  const config = {
    required: ['name', 'email', 'password'],
    allowed: ['name', 'email', 'password'],
    emailFields: ['email'],
    maxLengths: { name: 120, email: 255, password: 1024 }
  };
  if (!validateAuthBody(req.body, config, res)) return;

  const name = req.body.name.trim();
  const email = req.body.email.trim().toLowerCase();
  const password = req.body.password;

  if (name.length > 120) {
    return res.status(400).json({ error: 'name must be 120 characters or fewer' });
  }
  if (Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({ error: 'password must be 72 bytes or fewer' });
  }
  if (password.length < 12) {
    return res.status(400).json({ error: 'password must be at least 12 characters long' });
  }

  const defaultRoleId = process.env.DEFAULT_ROLE_ID;
  if (!defaultRoleId || defaultRoleId === 'SET_TO_AN_EXISTING_ROLE_ID_FROM_ROLES_TABLE') {
    return res.status(503).json({ error: 'Registration is not configured' });
  }

  try {
    const roleResult = await db.query(
      "SELECT role_id FROM roles WHERE role_id = $1 AND LOWER(name) NOT IN ('admin', 'administrator', 'superadmin', 'system admin') LIMIT 1",
      [defaultRoleId]
    );
    if (!roleResult.rows.length) {
      console.error('Registration disabled: configured default role does not exist');
      return res.status(503).json({ error: 'Registration is not configured' });
    }

    const passwordHash = await hashPassword(password);
    const { rows } = await db.query(
      `INSERT INTO users (role_id, name, email, password)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role_id`,
      [defaultRoleId, name, email, passwordHash]
    );
    return res.status(201).json({ user: rows[0] });
  } catch (err) {
    console.error('Registration failed:', err.code || err.name);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    return res.status(500).json({ error: 'Unable to register user' });
  }
});

app.post('/auth/login', async (req, res) => {
  if (!validateAuthBody(req.body, {
    required: ['email', 'password'],
    allowed: ['email', 'password'],
    emailFields: ['email'],
    maxLengths: { email: 255, password: 1024 }
  }, res)) return;

  const email = req.body.email.trim().toLowerCase();
  const password = req.body.password;
  try {
    const { rows } = await db.query(
      'SELECT id, password FROM users WHERE email = $1 LIMIT 1',
      [email]
    );
    if (!rows.length || !(await verifyPassword(password, rows[0].password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!process.env.JWT_SECRET || !process.env.REFRESH_SECRET) {
      console.error('Login unavailable: token secrets are not configured');
      return res.status(503).json({ error: 'Authentication is not configured' });
    }
    return res.json(generateTokens({ userId: rows[0].id }));
  } catch (err) {
    console.error('Login failed:', err.code || err.name);
    return res.status(500).json({ error: 'Unable to log in' });
  }
});

app.post('/auth/refresh', async (req, res) => {
  if (!validateAuthBody(req.body, {
    required: ['refreshToken'],
    allowed: ['refreshToken'],
    maxLengths: { refreshToken: 5000 }
  }, res)) return;

  try {
    if (!process.env.JWT_SECRET || !process.env.REFRESH_SECRET) {
      return res.status(503).json({ error: 'Authentication is not configured' });
    }
    const payload = verifyRefresh(req.body.refreshToken);
    if (!payload || !payload.userId) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    return res.json(generateTokens({ userId: payload.userId }));
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/clients', authenticate, require('./routers/clients'));
app.use('/cases', authenticate, require('./routers/cases'));
app.use('/hospitals', authenticate, require('./routers/hospitals'));
app.use('/providers', authenticate, require('./routers/providers'));

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 500
    ? err.status
    : 500;
  if (status >= 500) console.error('Unhandled request error:', err.code || err.name);
  return res.status(status).json({
    error: status === 400 ? 'Invalid request body' : 'Request could not be completed'
  });
});

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => console.log(`CMA API listening on port ${port}`));
}

module.exports = app;

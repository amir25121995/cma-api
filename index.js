// index.js
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

const app = express();
app.use(express.json());

// auth middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ error: 'Missing token' });
  const token = authHeader.split(' ')[1];
  try {
    req.user = verifyAccess(token);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ─── AUTH ROUTES ──────────────────────────────────────────────────────────
// REGISTER
app.post('/auth/register', async (req, res) => {
  const { role_id, name, email, password } = req.body;
  try {
    const pwHash = await hashPassword(password);
    const { rows } = await db.query(
      `INSERT INTO users(role_id, name, email, password)
       VALUES($1, $2, $3, $4) RETURNING id, email`,
      [role_id, name, email, pwHash]
    );
    return res.status(201).json({ user: rows[0] });
  } catch (err) {
    console.error('🚨 registration error:', err);
    return res
      .status(400)
      .json({ 
        error: err.message || 'Unknown error', 
        detail: err.detail || null 
      });
  }
});


// LOGIN
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await db.query(
      'SELECT id,password FROM users WHERE email=$1', [email]
    );
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const user = rows[0];
    const valid = await verifyPassword(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const tokens = generateTokens({ userId: user.id });
    res.json(tokens);
  } catch (err) {
    res.status(500).json({ error: 'Login error' });
  }
});

// REFRESH
app.post('/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const payload = verifyRefresh(refreshToken);
    const tokens = generateTokens({ userId: payload.userId });
    res.json(tokens);
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// health check
app.get('/health', (_req, res) => res.json({ status: 'ok Rehan' }));

// ─── MOUNT CRUD ROUTERS ────────────────────────────────────────────────────
app.use('/clients',   authenticate, require('./routers/clients'));
app.use('/cases',      authenticate, require('./routers/cases'));
app.use('/hospitals',  authenticate, require('./routers/hospitals'));
app.use('/providers',  authenticate, require('./routers/providers'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

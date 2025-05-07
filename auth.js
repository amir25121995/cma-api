// auth.js
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;
const { JWT_SECRET, JWT_EXPIRES_IN, REFRESH_SECRET, REFRESH_EXPIRES_IN } = process.env;

// hash a plaintext password
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// compare plaintext vs hash
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// generate access + refresh tokens
function generateTokens(payload) {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
  return { accessToken, refreshToken };
}

// verify access token
function verifyAccess(token) {
  return jwt.verify(token, JWT_SECRET);
}

// verify refresh token
function verifyRefresh(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

module.exports = {
  hashPassword, verifyPassword,
  generateTokens, verifyAccess, verifyRefresh
};

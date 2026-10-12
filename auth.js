require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;
const {
  JWT_SECRET,
  JWT_EXPIRES_IN = '15m',
  REFRESH_SECRET,
  REFRESH_EXPIRES_IN = '7d'
} = process.env;

function assertSecret(secret, name) {
  if (typeof secret !== 'string' || secret.length < 32) {
    throw new Error(`${name} must be configured with at least 32 characters`);
  }
}

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function generateTokens(payload) {
  assertSecret(JWT_SECRET, 'JWT_SECRET');
  assertSecret(REFRESH_SECRET, 'REFRESH_SECRET');
  return {
    accessToken: jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN }),
    refreshToken: jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN })
  };
}

function verifyAccess(token) {
  assertSecret(JWT_SECRET, 'JWT_SECRET');
  return jwt.verify(token, JWT_SECRET);
}

function verifyRefresh(token) {
  assertSecret(REFRESH_SECRET, 'REFRESH_SECRET');
  return jwt.verify(token, REFRESH_SECRET);
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateTokens,
  verifyAccess,
  verifyRefresh
};

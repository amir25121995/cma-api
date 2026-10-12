process.env.JWT_SECRET = 'access-secret-for-unit-tests-0123456789';
process.env.REFRESH_SECRET = 'refresh-secret-for-unit-tests-9876543210';
process.env.JWT_EXPIRES_IN = '15m';
process.env.REFRESH_EXPIRES_IN = '7d';

const test = require('node:test');
const assert = require('node:assert/strict');
const { generateTokens, verifyAccess, verifyRefresh } = require('../auth');

test('access and refresh tokens verify only with their own secret', () => {
  const tokens = generateTokens({ userId: 123 });
  assert.equal(verifyAccess(tokens.accessToken).userId, 123);
  assert.equal(verifyRefresh(tokens.refreshToken).userId, 123);
  assert.throws(() => verifyRefresh(tokens.accessToken));
  assert.throws(() => verifyAccess(tokens.refreshToken));
});

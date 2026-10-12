const test = require('node:test');
const assert = require('node:assert/strict');
const { validatePayload, validatePositiveId, isPlainObject } = require('../utils/validation');

test('rejects non-object and array request bodies', () => {
  assert.equal(isPlainObject(null), false);
  assert.equal(isPlainObject([]), false);
  assert.equal(validatePayload([], { allowed: [] }).valid, false);
});

test('requires configured fields to be non-empty strings', () => {
  const result = validatePayload({ name: '  ' }, { required: ['name'], allowed: ['name'] });
  assert.equal(result.valid, false);
  assert.match(result.errors[0], /name is required/);
});

test('rejects unexpected fields such as role_id or user_id', () => {
  const result = validatePayload(
    { name: 'Demo', role_id: 'admin', user_id: '99' },
    { required: ['name'], allowed: ['name'] }
  );
  assert.equal(result.valid, false);
  assert.equal(result.errors.some((error) => error.includes('role_id')), true);
  assert.equal(result.errors.some((error) => error.includes('user_id')), true);
});

test('validates email fields', () => {
  assert.equal(validatePayload({ email: 'person@example.com' }, {
    required: ['email'], allowed: ['email'], emailFields: ['email']
  }).valid, true);
  assert.equal(validatePayload({ email: 'not-an-email' }, {
    required: ['email'], allowed: ['email'], emailFields: ['email']
  }).valid, false);
});

test('validates positive integer IDs', () => {
  assert.equal(validatePositiveId('12'), true);
  assert.equal(validatePositiveId('0'), false);
  assert.equal(validatePositiveId('-1'), false);
  assert.equal(validatePositiveId('1abc'), false);
});

test('enforces field-specific maximum lengths', () => {
  const result = validatePayload(
    { email: 'a'.repeat(250) + '@example.com' },
    { allowed: ['email'], maxLengths: { email: 255 } }
  );
  assert.equal(result.valid, false);
  assert.match(result.errors[0], /255 characters or fewer/);
});

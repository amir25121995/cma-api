const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validatePayload(body, { required = [], allowed = [], emailFields = [] } = {}) {
  const errors = [];
  if (!isPlainObject(body)) {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  const allowedSet = new Set(allowed);
  for (const key of Object.keys(body)) {
    if (!allowedSet.has(key)) errors.push(`Unexpected field: ${key}`);
  }

  for (const field of required) {
    if (!(field in body) || typeof body[field] !== 'string' || body[field].trim() === '') {
      errors.push(`${field} is required and must be a non-empty string`);
    }
  }

  for (const field of Object.keys(body)) {
    const value = body[field];
    if (value === null && !required.includes(field)) continue;
    if (typeof value !== 'string') {
      errors.push(`${field} must be a string`);
      continue;
    }
    if (value.length > 5000) errors.push(`${field} is too long`);
    if (emailFields.includes(field) && value.trim() !== '' && !EMAIL_RE.test(value.trim())) {
      errors.push(`${field} must be a valid email address`);
    }
  }

  return { valid: errors.length === 0, errors };
}

function validatePositiveId(value) {
  return typeof value === 'string' && /^[1-9]\d*$/.test(value);
}

function buildUpdateStatement({ table, allowedFields, body, id, userId }) {
  const fields = Object.keys(body);
  const setClause = fields.map((field, index) => `"${field}" = $${index + 1}`).join(', ');
  const values = fields.map((field) => body[field]);
  values.push(id, userId);
  return {
    text: `UPDATE "${table}" SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} AND user_id = $${fields.length + 2} RETURNING *`,
    values
  };
}

module.exports = { isPlainObject, validatePayload, validatePositiveId };

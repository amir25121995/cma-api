const test = require('node:test');
const assert = require('node:assert/strict');
const schemas = require('../utils/resourceSchemas');
const { validatePayload } = require('../utils/validation');

test('resource schemas use fixed table names and exclude ownership fields from client input', () => {
  for (const schema of Object.values(schemas)) {
    assert.match(schema.table, /^[a-z_]+$/);
    assert.equal(schema.fields.includes('user_id'), false);
    assert.equal(schema.fields.includes('role_id'), false);
  }
});

test('client schema rejects caller-supplied user_id and unknown columns', () => {
  const schema = schemas.clients;
  const result = validatePayload(
    { company_name: 'Example', user_id: '900', admin: 'true' },
    { allowed: schema.fields, required: schema.required, emailFields: schema.emailFields }
  );
  assert.equal(result.valid, false);
  assert.equal(result.errors.some((error) => error.includes('user_id')), true);
  assert.equal(result.errors.some((error) => error.includes('admin')), true);
});

test('case schema permits nullable optional dates but requires database non-null fields', () => {
  const schema = schemas.cases;
  const valid = validatePayload({
    case_ref_no: 'CASE-001', date_of_assistance: null, country: 'IN', city: 'Kolkata',
    patient_name: 'Demo Patient', insurance: 'Example', ic_ref_no: 'IC-1',
    hospital_doctors: 'Demo Hospital', invoice_status: 'Pending',
    service_type: 'Assistance', final_invoice: null, mr_status: 'Open', remarks: null
  }, { allowed: schema.fields, required: schema.required, emailFields: schema.emailFields });
  assert.equal(valid.valid, true);
});

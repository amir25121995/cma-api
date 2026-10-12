const express = require('express');
const db = require('../db');
const { validatePayload, validatePositiveId } = require('../utils/validation');

function createResourceRouter({ table, fields, required, emailFields = [], defaultMaxLength = 255, maxLengths = {} }) {
  const router = express.Router();
  const config = { allowed: fields, required, emailFields, defaultMaxLength, maxLengths };
  const updateConfig = { allowed: fields, nonEmptyFields: required, emailFields, defaultMaxLength, maxLengths };

  function invalidId(req, res) {
    if (!validatePositiveId(req.params.id)) {
      res.status(400).json({ error: 'id must be a positive integer' });
      return true;
    }
    return false;
  }

  function invalidPayload(body, options, res) {
    const result = validatePayload(body, options);
    if (!result.valid) {
      res.status(400).json({ error: 'Validation failed', details: result.errors });
      return true;
    }
    return false;
  }

  // Every resource is scoped to the authenticated user.
  router.get('/', async (req, res) => {
    try {
      const { rows } = await db.query(
        `SELECT * FROM "${table}" WHERE user_id = $1 ORDER BY id`,
        [req.user.userId]
      );
      res.json(rows);
    } catch (err) {
      console.error(`GET /${table} failed:`, err.code || err.name);
      res.status(500).json({ error: 'Unable to retrieve records' });
    }
  });

  router.get('/:id', async (req, res) => {
    if (invalidId(req, res)) return;
    try {
      const { rows } = await db.query(
        `SELECT * FROM "${table}" WHERE id = $1 AND user_id = $2`,
        [req.params.id, req.user.userId]
      );
      if (!rows.length) return res.status(404).json({ error: 'Record not found' });
      res.json(rows[0]);
    } catch (err) {
      console.error(`GET /${table}/:id failed:`, err.code || err.name);
      res.status(500).json({ error: 'Unable to retrieve record' });
    }
  });

  router.post('/', async (req, res) => {
    if (invalidPayload(req.body, config, res)) return;
    const payload = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => fields.includes(key))
    );
    payload.user_id = req.user.userId;
    const columns = Object.keys(payload);
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    try {
      const { rows } = await db.query(
        `INSERT INTO "${table}" (${columns.map((column) => `"${column}"`).join(', ')})
         VALUES (${placeholders}) RETURNING *`,
        columns.map((column) => payload[column])
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error(`POST /${table} failed:`, err.code || err.name);
      if (err.code === '23505') return res.status(409).json({ error: 'A record with these unique values already exists' });
      res.status(500).json({ error: 'Unable to create record' });
    }
  });

  router.put('/:id', async (req, res) => {
    if (invalidId(req, res)) return;
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Request body must be a JSON object' });
    }
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'At least one field is required for an update' });
    }
    if (invalidPayload(req.body, updateConfig, res)) return;

    const columns = Object.keys(req.body);
    try {
      const setClause = columns.map((column, index) => `"${column}" = $${index + 1}`).join(', ');
      const values = columns.map((column) => req.body[column]);
      values.push(req.params.id, req.user.userId);
      const { rows } = await db.query(
        `UPDATE "${table}" SET ${setClause}, updated_at = NOW()
         WHERE id = $${columns.length + 1} AND user_id = $${columns.length + 2}
         RETURNING *`,
        values
      );
      if (!rows.length) return res.status(404).json({ error: 'Record not found' });
      res.json(rows[0]);
    } catch (err) {
      console.error(`PUT /${table}/:id failed:`, err.code || err.name);
      res.status(500).json({ error: 'Unable to update record' });
    }
  });

  router.delete('/:id', async (req, res) => {
    if (invalidId(req, res)) return;
    try {
      const { rows } = await db.query(
        `DELETE FROM "${table}" WHERE id = $1 AND user_id = $2 RETURNING id`,
        [req.params.id, req.user.userId]
      );
      if (!rows.length) return res.status(404).json({ error: 'Record not found' });
      res.status(204).end();
    } catch (err) {
      console.error(`DELETE /${table}/:id failed:`, err.code || err.name);
      res.status(500).json({ error: 'Unable to delete record' });
    }
  });

  return router;
}

module.exports = createResourceRouter;

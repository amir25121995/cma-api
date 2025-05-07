// routers/clients.js
const express = require('express');
const db = require('../db');
const router = express.Router();

// List all clients
router.get('/', async (_req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM client_details ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error('DB error [GET /clients]:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Get one client by id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM client_details WHERE id = $1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('DB error [GET /clients/:id]:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Create a new client
router.post('/', async (req, res) => {
  const {
    company_name, billing_address, contact_person,
    contact_email, finance_email, ops_email,
    contact_no, status_of_collab, remarks, user_id
  } = req.body;
  try {
    const { rows } = await db.query(
      `INSERT INTO client_details
        (company_name,billing_address,contact_person,contact_email,finance_email,ops_email,contact_no,status_of_collab,remarks,user_id)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [company_name, billing_address, contact_person, contact_email,
       finance_email, ops_email, contact_no, status_of_collab, remarks, user_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('DB error [POST /clients]:', err);
    res.status(500).json({ error: 'DB error', detail: err.message });
  }
});

// Update a client
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const fields = Object.keys(req.body);
  const values = Object.values(req.body);
  const setString = fields.map((f,i) => `"${f}"=$${i+1}`).join(', ');
  try {
    const { rows } = await db.query(
      `UPDATE client_details SET ${setString} WHERE id=$${fields.length+1} RETURNING *`,
      [...values, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('DB error [PUT /clients/:id]:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Delete a client
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM client_details WHERE id=$1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    console.error('DB error [DELETE /clients/:id]:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;

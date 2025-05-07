// routers/providers.js
const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM provider_details ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error('DB error [GET /providers]:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM provider_details WHERE id=$1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('DB error [GET /providers/:id]:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

router.post('/', async (req, res) => {
  const {
    provider_name, regions_covered, service_type, case_fee,
    contact_person, contact_no, contact_email, ops_email,
    finance_email, remarks, user_id
  } = req.body;
  try {
    const { rows } = await db.query(
      `INSERT INTO provider_details
        (provider_name,regions_covered,service_type,case_fee,contact_person,contact_no,
         contact_email,ops_email,finance_email,remarks,user_id)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [provider_name, regions_covered, service_type, case_fee, contact_person,
       contact_no, contact_email, ops_email, finance_email, remarks, user_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('DB error [POST /providers]:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const fields = Object.keys(req.body);
  const values = Object.values(req.body);
  const setString = fields.map((f,i)=>`"${f}"=$${i+1}`).join(', ');
  try {
    const { rows } = await db.query(
      `UPDATE provider_details SET ${setString} WHERE id=$${fields.length+1} RETURNING *`,
      [...values, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('DB error [PUT /providers/:id]:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM provider_details WHERE id=$1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    console.error('DB error [DELETE /providers/:id]:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;

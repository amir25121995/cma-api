// routers/cases.js
const express = require('express');
const db = require('../db');
const router = express.Router();

// List all cases
router.get('/', async (_req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM case_details ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error('DB error [GET /cases]:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Get one case
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM case_details WHERE id=$1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('DB error [GET /cases/:id]:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Create case
router.post('/', async (req, res) => {
  const {
    case_ref_no, date_of_assistance, country, city,
    patient_name, insurance, ic_ref_no, hospital_doctors,
    invoice_status, service_type, final_invoice, mr_status,
    remarks, user_id
  } = req.body;
  try {
    const { rows } = await db.query(
      `INSERT INTO case_details
        (case_ref_no,date_of_assistance,country,city,patient_name,insurance,ic_ref_no,
         hospital_doctors,invoice_status,service_type,final_invoice,mr_status,remarks,user_id)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [case_ref_no, date_of_assistance, country, city, patient_name, insurance,
       ic_ref_no, hospital_doctors, invoice_status, service_type, final_invoice,
       mr_status, remarks, user_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('DB error [POST /cases]:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Update case
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const fields = Object.keys(req.body);
  const values = Object.values(req.body);
  const setString = fields.map((f,i)=>`"${f}"=$${i+1}`).join(', ');
  try {
    const { rows } = await db.query(
      `UPDATE case_details SET ${setString} WHERE id=$${fields.length+1} RETURNING *`,
      [...values, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('DB error [PUT /cases/:id]:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Delete case
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM case_details WHERE id=$1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    console.error('DB error [DELETE /cases/:id]:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;

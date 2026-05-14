const { run, get, all } = require('../config/db');
const { validationResult, body, param } = require('express-validator');

const RECORD_SELECT = `
  SELECT mr.*, p.full_name AS patient_name,
    d.full_name AS doctor_name, d.specialization AS doctor_specialization,
    di.icd_code, di.name AS disease_name,
    cu.full_name AS created_by_name
  FROM medical_records mr
  JOIN patients p ON p.id = mr.patient_id
  JOIN doctors d ON d.id = mr.doctor_id
  JOIN diseases di ON di.id = mr.disease_id
  LEFT JOIN users cu ON cu.id = mr.created_by`;

async function listRecords(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    if (req.query.patient_id) { conditions.push('mr.patient_id = ?'); params.push(parseInt(req.query.patient_id, 10)); }
    if (req.query.doctor_id) { conditions.push('mr.doctor_id = ?'); params.push(parseInt(req.query.doctor_id, 10)); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRow = await get(`SELECT COUNT(*) AS c FROM medical_records mr ${where}`, params);
    const rows = await all(`${RECORD_SELECT} ${where} ORDER BY mr.visit_date DESC, mr.id DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
    res.json({ data: rows, total: countRow.c, page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getRecord(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const row = await get(`${RECORD_SELECT} WHERE mr.id = ?`, [id]);
    if (!row) return res.status(404).json({ error: 'Record not found' });
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const createValidators = [
  body('patient_id').isInt(),
  body('doctor_id').isInt(),
  body('disease_id').isInt(),
  body('visit_date').isISO8601().toDate(),
  body('symptoms').optional({ nullable: true }).trim().isLength({ max: 4000 }),
  body('treatment_notes').optional({ nullable: true }).trim().isLength({ max: 4000 }),
  body('prescription').optional({ nullable: true }).trim().isLength({ max: 4000 }),
];

async function createRecord(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { patient_id, doctor_id, disease_id, visit_date, symptoms, treatment_notes, prescription } = req.body;
    const vd = typeof visit_date === 'string' ? visit_date.slice(0, 10) : new Date(visit_date).toISOString().slice(0, 10);
    const patient = await get('SELECT id FROM patients WHERE id = ?', [patient_id]);
    if (!patient) return res.status(400).json({ error: 'Invalid patient' });
    const doctor = await get('SELECT id FROM doctors WHERE id = ?', [doctor_id]);
    if (!doctor) return res.status(400).json({ error: 'Invalid doctor' });
    const disease = await get('SELECT id FROM diseases WHERE id = ?', [disease_id]);
    if (!disease) return res.status(400).json({ error: 'Invalid disease' });
    const info = await run(
      `INSERT INTO medical_records (patient_id, doctor_id, disease_id, visit_date, symptoms, treatment_notes, prescription, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [patient_id, doctor_id, disease_id, vd, symptoms || null, treatment_notes || null, prescription || null, req.user.id]
    );
    const row = await get(`${RECORD_SELECT} WHERE mr.id = ?`, [info.lastID]);
    res.status(201).json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const updateValidators = [
  param('id').isInt(),
  body('patient_id').optional().isInt(),
  body('doctor_id').optional().isInt(),
  body('disease_id').optional().isInt(),
  body('visit_date').optional().isISO8601().toDate(),
  body('symptoms').optional({ nullable: true }).trim().isLength({ max: 4000 }),
  body('treatment_notes').optional({ nullable: true }).trim().isLength({ max: 4000 }),
  body('prescription').optional({ nullable: true }).trim().isLength({ max: 4000 }),
];

async function updateRecord(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const id = parseInt(req.params.id, 10);
    const existing = await get('SELECT * FROM medical_records WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Record not found' });
    const patient_id = req.body.patient_id ?? existing.patient_id;
    const doctor_id = req.body.doctor_id ?? existing.doctor_id;
    const disease_id = req.body.disease_id ?? existing.disease_id;
    let visit_date = existing.visit_date;
    if (req.body.visit_date) {
      const vd = req.body.visit_date;
      visit_date = typeof vd === 'string' ? vd.slice(0, 10) : new Date(vd).toISOString().slice(0, 10);
    }
    if (!await get('SELECT id FROM patients WHERE id = ?', [patient_id])) return res.status(400).json({ error: 'Invalid patient' });
    if (!await get('SELECT id FROM doctors WHERE id = ?', [doctor_id])) return res.status(400).json({ error: 'Invalid doctor' });
    if (!await get('SELECT id FROM diseases WHERE id = ?', [disease_id])) return res.status(400).json({ error: 'Invalid disease' });
    const symptoms = req.body.symptoms !== undefined ? req.body.symptoms : existing.symptoms;
    const treatment_notes = req.body.treatment_notes !== undefined ? req.body.treatment_notes : existing.treatment_notes;
    const prescription = req.body.prescription !== undefined ? req.body.prescription : existing.prescription;
    await run(
      `UPDATE medical_records SET patient_id = ?, doctor_id = ?, disease_id = ?, visit_date = ?, symptoms = ?, treatment_notes = ?, prescription = ? WHERE id = ?`,
      [patient_id, doctor_id, disease_id, visit_date, symptoms, treatment_notes, prescription, id]
    );
    const row = await get(`${RECORD_SELECT} WHERE mr.id = ?`, [id]);
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { listRecords, getRecord, createRecord, updateRecord, createValidators, updateValidators };
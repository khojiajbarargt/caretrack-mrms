const { run, get, all } = require('../config/db');
const { validationResult, body, param } = require('express-validator');

async function listPatients(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;
    const search = (req.query.search || '').trim();
    const idFilter = (req.query.patient_id || '').trim();
    const conditions = [];
    const params = [];
    if (idFilter && /^\d+$/.test(idFilter)) {
      conditions.push('p.id = ?');
      params.push(parseInt(idFilter, 10));
    } else if (search) {
      if (/^\d+$/.test(search)) {
        conditions.push('(p.id = ? OR p.full_name LIKE ?)');
        params.push(parseInt(search, 10), `%${search}%`);
      } else {
        conditions.push('p.full_name LIKE ?');
        params.push(`%${search}%`);
      }
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRow = await get(`SELECT COUNT(*) AS c FROM patients p ${where}`, params);
    const total = countRow.c;
    const rows = await all(
      `SELECT p.*, u.full_name AS registered_by_name FROM patients p LEFT JOIN users u ON u.id = p.registered_by ${where} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    res.json({ data: rows, total, page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getPatient(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const p = await get(
      `SELECT p.*, u.full_name AS registered_by_name FROM patients p LEFT JOIN users u ON u.id = p.registered_by WHERE p.id = ?`,
      [id]
    );
    if (!p) return res.status(404).json({ error: 'Patient not found' });
    if (req.user.role === 'receptionist') {
      return res.json({ ...p, medical_records: [], _restricted: true, message: 'Medical history is available to clinical staff only.' });
    }
    const records = await all(
      `SELECT mr.*, d.full_name AS doctor_name, d.specialization AS doctor_specialization, di.icd_code, di.name AS disease_name, di.category AS disease_category, cu.full_name AS created_by_name FROM medical_records mr JOIN doctors d ON d.id = mr.doctor_id JOIN diseases di ON di.id = mr.disease_id LEFT JOIN users cu ON cu.id = mr.created_by WHERE mr.patient_id = ? ORDER BY mr.visit_date DESC, mr.id DESC`,
      [id]
    );
    res.json({ ...p, medical_records: records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const createValidators = [
  body('full_name').trim().isLength({ min: 2, max: 200 }),
  body('date_of_birth').isISO8601().toDate(),
  body('gender').isIn(['male', 'female', 'other', 'unknown']),
  body('phone').optional({ nullable: true }).trim().isLength({ max: 50 }),
  body('email').optional({ checkFalsy: true }).trim().isEmail().normalizeEmail(),
  body('address').optional({ nullable: true }).trim().isLength({ max: 500 }),
  body('emergency_contact').optional({ nullable: true }).trim().isLength({ max: 200 }),
];

async function createPatient(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { full_name, date_of_birth, gender, phone, email, address, emergency_contact } = req.body;
    const dob = typeof date_of_birth === 'string' ? date_of_birth.slice(0, 10) : new Date(date_of_birth).toISOString().slice(0, 10);
    const info = await run(
      `INSERT INTO patients (full_name, date_of_birth, gender, phone, email, address, emergency_contact, registered_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [full_name, dob, gender, phone || null, email || null, address || null, emergency_contact || null, req.user.id]
    );
    const row = await get(
      `SELECT p.*, u.full_name AS registered_by_name FROM patients p LEFT JOIN users u ON u.id = p.registered_by WHERE p.id = ?`,
      [info.lastID]
    );
    res.status(201).json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const updateValidators = [
  param('id').isInt(),
  body('full_name').optional().trim().isLength({ min: 2, max: 200 }),
  body('date_of_birth').optional().isISO8601().toDate(),
  body('gender').optional().isIn(['male', 'female', 'other', 'unknown']),
  body('phone').optional({ nullable: true }).trim().isLength({ max: 50 }),
  body('email').optional({ checkFalsy: true }).trim().isEmail().normalizeEmail(),
  body('address').optional({ nullable: true }).trim().isLength({ max: 500 }),
  body('emergency_contact').optional({ nullable: true }).trim().isLength({ max: 200 }),
];

async function updatePatient(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const id = parseInt(req.params.id, 10);
    const existing = await get('SELECT * FROM patients WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Patient not found' });
    let dob = existing.date_of_birth;
    if (req.body.date_of_birth) {
      const d = req.body.date_of_birth;
      dob = typeof d === 'string' ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10);
    }
    await run(
      `UPDATE patients SET full_name = COALESCE(?, full_name), date_of_birth = ?, gender = COALESCE(?, gender), phone = COALESCE(?, phone), email = COALESCE(?, email), address = COALESCE(?, address), emergency_contact = COALESCE(?, emergency_contact) WHERE id = ?`,
      [req.body.full_name ?? null, dob, req.body.gender ?? null, req.body.phone !== undefined ? req.body.phone : null, req.body.email !== undefined ? req.body.email : null, req.body.address !== undefined ? req.body.address : null, req.body.emergency_contact !== undefined ? req.body.emergency_contact : null, id]
    );
    const row = await get(
      `SELECT p.*, u.full_name AS registered_by_name FROM patients p LEFT JOIN users u ON u.id = p.registered_by WHERE p.id = ?`,
      [id]
    );
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { listPatients, getPatient, createPatient, updatePatient, createValidators, updateValidators };
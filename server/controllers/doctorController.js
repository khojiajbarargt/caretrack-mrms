const { run, get, all } = require('../config/db');
const { validationResult, body, param } = require('express-validator');

function parseSchedule(raw) {
  if (typeof raw === 'string') {
    try { return JSON.parse(raw || '{}'); } catch { return {}; }
  }
  return raw && typeof raw === 'object' ? raw : {};
}

async function listDoctors(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;
    const search = (req.query.search || '').trim();
    const department = (req.query.department || '').trim();
    const specialization = (req.query.specialization || '').trim();
    const status = (req.query.status || '').trim();
    const conditions = [];
    const params = [];
    if (search) {
      conditions.push('(d.full_name LIKE ? OR d.email LIKE ? OR d.phone LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    if (department) { conditions.push('d.department = ?'); params.push(department); }
    if (specialization) { conditions.push('d.specialization LIKE ?'); params.push(`%${specialization}%`); }
    if (status && ['active', 'inactive'].includes(status)) { conditions.push('d.status = ?'); params.push(status); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRow = await get(`SELECT COUNT(*) AS c FROM doctors d ${where}`, params);
    const total = countRow.c;
    const rows = await all(`SELECT d.* FROM doctors d ${where} ORDER BY d.full_name COLLATE NOCASE LIMIT ? OFFSET ?`, [...params, limit, offset]);
    const deps = await all(`SELECT DISTINCT department FROM doctors ORDER BY department`, []);
    const departments = deps.map(r => r.department);
    res.json({ data: rows.map(d => ({ ...d, schedule: parseSchedule(d.schedule) })), total, page, limit, departments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getDoctor(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const d = await get('SELECT * FROM doctors WHERE id = ?', [id]);
    if (!d) return res.status(404).json({ error: 'Doctor not found' });
    res.json({ ...d, schedule: parseSchedule(d.schedule) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const createValidators = [
  body('full_name').trim().isLength({ min: 2, max: 200 }),
  body('specialization').trim().isLength({ min: 1, max: 150 }),
  body('department').trim().isLength({ min: 1, max: 150 }),
  body('phone').optional({ nullable: true }).trim().isLength({ max: 50 }),
  body('email').optional({ checkFalsy: true }).trim().isEmail().normalizeEmail(),
  body('status').optional().isIn(['active', 'inactive']),
  body('schedule').optional().isObject(),
];

async function createDoctor(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { full_name, specialization, phone, email, department, status, schedule } = req.body;
    const schedJson = JSON.stringify(schedule || {});
    const st = status || 'active';
    const info = await run(
      `INSERT INTO doctors (full_name, specialization, phone, email, department, schedule, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [full_name, specialization, phone || null, email || null, department, schedJson, st]
    );
    const row = await get('SELECT * FROM doctors WHERE id = ?', [info.lastID]);
    res.status(201).json({ ...row, schedule: parseSchedule(row.schedule) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const updateValidators = [
  param('id').isInt(),
  body('full_name').optional().trim().isLength({ min: 2, max: 200 }),
  body('specialization').optional().trim().isLength({ min: 1, max: 150 }),
  body('department').optional().trim().isLength({ min: 1, max: 150 }),
  body('phone').optional({ nullable: true }).trim().isLength({ max: 50 }),
  body('email').optional({ checkFalsy: true }).trim().isEmail().normalizeEmail(),
  body('status').optional().isIn(['active', 'inactive']),
  body('schedule').optional().isObject(),
];

async function updateDoctor(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const id = parseInt(req.params.id, 10);
    const existing = await get('SELECT * FROM doctors WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Doctor not found' });
    const schedule = req.body.schedule !== undefined ? JSON.stringify(req.body.schedule) : existing.schedule;
    await run(
      `UPDATE doctors SET full_name = COALESCE(?, full_name), specialization = COALESCE(?, specialization), phone = COALESCE(?, phone), email = COALESCE(?, email), department = COALESCE(?, department), schedule = ?, status = COALESCE(?, status) WHERE id = ?`,
      [req.body.full_name ?? null, req.body.specialization ?? null, req.body.phone !== undefined ? req.body.phone : null, req.body.email !== undefined ? req.body.email : null, req.body.department ?? null, schedule, req.body.status ?? null, id]
    );
    const row = await get('SELECT * FROM doctors WHERE id = ?', [id]);
    res.json({ ...row, schedule: parseSchedule(row.schedule) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const deleteValidators = [param('id').isInt()];

async function deleteDoctor(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const id = parseInt(req.params.id, 10);
    const inUse = await get('SELECT id FROM medical_records WHERE doctor_id = ? LIMIT 1', [id]);
    if (inUse) return res.status(400).json({ error: 'Doctor has medical records; deactivate instead' });
    const info = await run('DELETE FROM doctors WHERE id = ?', [id]);
    if (info.changes === 0) return res.status(404).json({ error: 'Doctor not found' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { listDoctors, getDoctor, createDoctor, updateDoctor, deleteDoctor, createValidators, updateValidators, deleteValidators };
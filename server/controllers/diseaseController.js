const { run, get, all } = require('../config/db');
const { validationResult, body, param } = require('express-validator');

const SEVERITY = ['mild', 'moderate', 'severe', 'critical'];

async function listDiseases(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;
    const search = (req.query.search || '').trim();
    const category = (req.query.category || '').trim();
    const icd = (req.query.icd || '').trim();
    const conditions = [];
    const params = [];
    if (search) {
      conditions.push('(name LIKE ? OR icd_code LIKE ? OR description LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    if (category) { conditions.push('category = ?'); params.push(category); }
    if (icd) { conditions.push('icd_code LIKE ?'); params.push(`%${icd}%`); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRow = await get(`SELECT COUNT(*) AS c FROM diseases ${where}`, params);
    const rows = await all(`SELECT * FROM diseases ${where} ORDER BY icd_code COLLATE NOCASE LIMIT ? OFFSET ?`, [...params, limit, offset]);
    const cats = await all(`SELECT DISTINCT category FROM diseases ORDER BY category`, []);
    const categories = cats.map(r => r.category);
    res.json({ data: rows, total: countRow.c, page, limit, categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function lookupIcd(req, res) {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ data: [] });
    const like = `%${q}%`;
    const rows = await all(
      `SELECT id, icd_code, name, category, severity FROM diseases WHERE icd_code LIKE ? OR name LIKE ? ORDER BY icd_code LIMIT 25`,
      [like, like]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const createValidators = [
  body('icd_code').trim().isLength({ min: 2, max: 20 }),
  body('name').trim().isLength({ min: 2, max: 300 }),
  body('description').optional({ nullable: true }).trim().isLength({ max: 2000 }),
  body('category').trim().isLength({ min: 1, max: 120 }),
  body('severity').isIn(SEVERITY),
];

async function createDisease(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { icd_code, name, description, category, severity } = req.body;
    const info = await run(
      `INSERT INTO diseases (icd_code, name, description, category, severity) VALUES (?, ?, ?, ?, ?)`,
      [icd_code, name, description || null, category, severity]
    );
    const row = await get('SELECT * FROM diseases WHERE id = ?', [info.lastID]);
    res.status(201).json(row);
  } catch (err) {
    if (String(err.message).includes('UNIQUE')) return res.status(409).json({ error: 'ICD code already exists' });
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const updateValidators = [
  param('id').isInt(),
  body('icd_code').optional().trim().isLength({ min: 2, max: 20 }),
  body('name').optional().trim().isLength({ min: 2, max: 300 }),
  body('description').optional({ nullable: true }).trim().isLength({ max: 2000 }),
  body('category').optional().trim().isLength({ min: 1, max: 120 }),
  body('severity').optional().isIn(SEVERITY),
];

async function updateDisease(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const id = parseInt(req.params.id, 10);
    const existing = await get('SELECT * FROM diseases WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Disease not found' });
    const icd = req.body.icd_code ?? existing.icd_code;
    if (req.body.icd_code && req.body.icd_code !== existing.icd_code) {
      const taken = await get('SELECT id FROM diseases WHERE icd_code = ? AND id != ?', [icd, id]);
      if (taken) return res.status(409).json({ error: 'ICD code already in use' });
    }
    await run(
      `UPDATE diseases SET icd_code = ?, name = ?, description = ?, category = ?, severity = ? WHERE id = ?`,
      [icd, req.body.name ?? existing.name, req.body.description !== undefined ? req.body.description : existing.description, req.body.category ?? existing.category, req.body.severity ?? existing.severity, id]
    );
    const row = await get('SELECT * FROM diseases WHERE id = ?', [id]);
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const deleteValidators = [param('id').isInt()];

async function deleteDisease(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const id = parseInt(req.params.id, 10);
    const inUse = await get('SELECT id FROM medical_records WHERE disease_id = ? LIMIT 1', [id]);
    if (inUse) return res.status(400).json({ error: 'Disease is referenced by medical records' });
    const info = await run('DELETE FROM diseases WHERE id = ?', [id]);
    if (info.changes === 0) return res.status(404).json({ error: 'Disease not found' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { listDiseases, lookupIcd, createDisease, updateDisease, deleteDisease, createValidators, updateValidators, deleteValidators };
const bcrypt = require('bcryptjs');
const { run, get, all } = require('../config/db');
const { validationResult, body, param } = require('express-validator');

const ROLES = ['admin', 'clinician', 'receptionist'];

async function listUsers(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;
    const q = (req.query.search || '').trim();
    let rows, countRow;
    if (q) {
      const like = `%${q}%`;
      countRow = await get(`SELECT COUNT(*) AS c FROM users WHERE full_name LIKE ? OR email LIKE ?`, [like, like]);
      rows = await all(`SELECT id, full_name, email, role, created_at FROM users WHERE full_name LIKE ? OR email LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?`, [like, like, limit, offset]);
    } else {
      countRow = await get('SELECT COUNT(*) AS c FROM users', []);
      rows = await all(`SELECT id, full_name, email, role, created_at FROM users ORDER BY id DESC LIMIT ? OFFSET ?`, [limit, offset]);
    }
    res.json({ data: rows, total: countRow.c, page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const createValidators = [
  body('full_name').trim().isLength({ min: 2, max: 200 }),
  body('email').trim().isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 8, max: 200 }),
  body('role').isIn(ROLES),
];

async function createUser(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { full_name, email, password, role } = req.body;
    const exists = await get('SELECT id FROM users WHERE email = ?', [email]);
    if (exists) return res.status(409).json({ error: 'Email already registered' });
    const hash = bcrypt.hashSync(password, 10);
    const info = await run(`INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)`, [full_name, email, hash, role]);
    const user = await get('SELECT id, full_name, email, role, created_at FROM users WHERE id = ?', [info.lastID]);
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const updateValidators = [
  param('id').isInt(),
  body('full_name').optional().trim().isLength({ min: 2, max: 200 }),
  body('email').optional().trim().isEmail().normalizeEmail(),
  body('password').optional().isString().isLength({ min: 8, max: 200 }),
  body('role').optional().isIn(ROLES),
];

async function updateUser(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const id = parseInt(req.params.id, 10);
    const existing = await get('SELECT * FROM users WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'User not found' });
    const { full_name, email, password, role } = req.body;
    if (email && email !== existing.email) {
      const taken = await get('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
      if (taken) return res.status(409).json({ error: 'Email already in use' });
    }
    const nextName = full_name ?? existing.full_name;
    const nextEmail = email ?? existing.email;
    const nextRole = role ?? existing.role;
    let nextHash = existing.password_hash;
    if (password) nextHash = bcrypt.hashSync(password, 10);
    await run(`UPDATE users SET full_name = ?, email = ?, password_hash = ?, role = ? WHERE id = ?`, [nextName, nextEmail, nextHash, nextRole, id]);
    const user = await get('SELECT id, full_name, email, role, created_at FROM users WHERE id = ?', [id]);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const deleteValidators = [param('id').isInt()];

async function deleteUser(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const id = parseInt(req.params.id, 10);
    if (id === req.user.id) return res.status(400).json({ error: 'Cannot delete your own account' });
    const info = await run('DELETE FROM users WHERE id = ?', [id]);
    if (info.changes === 0) return res.status(404).json({ error: 'User not found' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { listUsers, createUser, updateUser, deleteUser, createValidators, updateValidators, deleteValidators };
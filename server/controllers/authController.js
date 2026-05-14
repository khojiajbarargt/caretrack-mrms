const bcrypt = require('bcryptjs');
const { run, get, all } = require('../config/db');
const { signToken } = require('../middleware/auth');
const { validationResult, body } = require('express-validator');

const loginValidators = [
  body('email').trim().isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 1, max: 200 }),
];

async function login(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email, password } = req.body;
    const user = await get('SELECT id, full_name, email, password_hash, role FROM users WHERE email = ?', [email]);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = signToken(user);
    res.json({ token, user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function me(req, res) {
  try {
    const user = await get('SELECT id, full_name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { login, me, loginValidators };
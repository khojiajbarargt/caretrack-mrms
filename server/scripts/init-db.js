const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3');

const root = path.join(__dirname, '..', '..');
const schemaPath = path.join(root, 'database', 'schema.sql');
const seedPath = path.join(root, 'database', 'seed.sql');
const dbDir = path.join(__dirname, '..', 'data');
const dbPath = process.env.DB_PATH
  ? path.isAbsolute(process.env.DB_PATH)
    ? process.env.DB_PATH
    : path.join(__dirname, '..', process.env.DB_PATH)
  : path.join(dbDir, 'caretrack.sqlite');

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

sqlite3.verbose();
const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function exec(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

async function syncAutoIncrement(table) {
  const row = await get(`SELECT MAX(id) AS m FROM ${table}`);
  const m = row?.m ?? 0;
  if (m === 0) return;
  const existing = await get(`SELECT seq FROM sqlite_sequence WHERE name = ?`, [table]);
  if (existing) await run(`UPDATE sqlite_sequence SET seq = ? WHERE name = ?`, [m, table]);
  else await run(`INSERT INTO sqlite_sequence (name, seq) VALUES (?, ?)`, [table, m]);
}

async function main() {
  await exec('PRAGMA foreign_keys = ON;');

  await exec(fs.readFileSync(schemaPath, 'utf8'));

  const hash = bcrypt.hashSync('password123', 10);
  await run(
    `INSERT INTO users (id, full_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
    [1, 'Alex Morgan', 'admin@caretrack.local', hash, 'admin']
  );
  await run(
    `INSERT INTO users (id, full_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
    [2, 'Dr. Sarah Chen', 'clinician@caretrack.local', hash, 'clinician']
  );
  await run(
    `INSERT INTO users (id, full_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
    [3, 'Jamie Rivera', 'reception@caretrack.local', hash, 'receptionist']
  );

  await exec(fs.readFileSync(seedPath, 'utf8'));

  for (const t of ['users', 'doctors', 'patients', 'diseases', 'medical_records']) {
    // eslint-disable-next-line no-await-in-loop
    await syncAutoIncrement(t);
  }

  await new Promise((resolve, reject) => db.close((err) => (err ? reject(err) : resolve())));

  console.log('Database initialized at', dbPath);
  console.log('Demo logins (password: password123):');
  console.log('  admin@caretrack.local');
  console.log('  clinician@caretrack.local');
  console.log('  reception@caretrack.local');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

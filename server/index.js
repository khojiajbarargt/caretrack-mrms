require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

const dbDir = path.join(__dirname, 'data');
const dbPath = path.join(dbDir, 'caretrack.sqlite');

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
if (!fs.existsSync(dbPath) || fs.statSync(dbPath).size === 0) {
  console.log('Initializing database...');
  execSync('node ' + path.join(__dirname, 'scripts', 'init-db.js'), { stdio: 'inherit' });
}

require('./config/db');

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/diseases', require('./routes/diseaseRoutes'));
app.use('/api/medical-records', require('./routes/recordRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

app.get('/api/health', (req, res) => res.json({ ok: true, name: 'CareTrack Clinic API' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`CareTrack API listening on http://localhost:${PORT}`);
});
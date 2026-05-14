require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Auto-init database if missing
const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

require('./config/db');

// Auto-run init-db if database is empty
const dbPath = path.join(__dirname, 'data', 'caretrack.sqlite');
if (!fs.existsSync(dbPath) || fs.statSync(dbPath).size === 0) {
  try {
    require('./scripts/init-db');
  } catch (e) {
    console.error('DB init error:', e.message);
  }
}

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

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
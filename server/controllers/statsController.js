const { run, get, all } = require('../config/db');

async function dashboardStats(req, res) {
  try {
    const r1 = await get('SELECT COUNT(*) AS c FROM patients', []);
    const r2 = await get(`SELECT COUNT(*) AS c FROM doctors WHERE status = 'active'`, []);
    const r3 = await get(`SELECT COUNT(*) AS c FROM medical_records WHERE date(visit_date) = date('now')`, []);
    const r4 = await get('SELECT COUNT(*) AS c FROM medical_records', []);
    const r5 = await get('SELECT COUNT(*) AS c FROM diseases', []);

    res.json({
      totalPatients: r1.c,
      totalDoctors: r2.c,
      recordsToday: r3.c,
      totalRecords: r4.c,
      totalDiseases: r5.c,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { dashboardStats };
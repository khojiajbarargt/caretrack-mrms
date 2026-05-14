const express = require('express');
const router = express.Router();
const { authRequired } = require('../middleware/auth');
const { requireRoles } = require('../middleware/rbac');
const statsCtrl = require('../controllers/statsController');

router.get(
  '/dashboard',
  authRequired,
  requireRoles('admin', 'clinician', 'receptionist'),
  statsCtrl.dashboardStats
);

module.exports = router;

const express = require('express');
const router = express.Router();
const { authRequired } = require('../middleware/auth');
const { requireRoles, requireAdmin } = require('../middleware/rbac');
const doctorCtrl = require('../controllers/doctorController');

router.get('/', authRequired, requireRoles('admin', 'clinician', 'receptionist'), doctorCtrl.listDoctors);
router.get(
  '/:id',
  authRequired,
  requireRoles('admin', 'clinician', 'receptionist'),
  doctorCtrl.getDoctor
);
router.post('/', authRequired, requireAdmin, doctorCtrl.createValidators, doctorCtrl.createDoctor);
router.patch(
  '/:id',
  authRequired,
  requireAdmin,
  doctorCtrl.updateValidators,
  doctorCtrl.updateDoctor
);
router.delete(
  '/:id',
  authRequired,
  requireAdmin,
  doctorCtrl.deleteValidators,
  doctorCtrl.deleteDoctor
);

module.exports = router;

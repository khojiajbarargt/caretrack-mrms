const express = require('express');
const router = express.Router();
const { authRequired } = require('../middleware/auth');
const { requireRoles } = require('../middleware/rbac');
const patientCtrl = require('../controllers/patientController');

const allStaff = requireRoles('admin', 'clinician', 'receptionist');

router.get('/', authRequired, allStaff, patientCtrl.listPatients);
router.get('/:id', authRequired, allStaff, patientCtrl.getPatient);
router.post('/', authRequired, allStaff, patientCtrl.createValidators, patientCtrl.createPatient);
router.patch('/:id', authRequired, allStaff, patientCtrl.updateValidators, patientCtrl.updatePatient);

module.exports = router;

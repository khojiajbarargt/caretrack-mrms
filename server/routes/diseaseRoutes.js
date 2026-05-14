const express = require('express');
const router = express.Router();
const { authRequired } = require('../middleware/auth');
const { requireClinical } = require('../middleware/rbac');
const diseaseCtrl = require('../controllers/diseaseController');

router.get('/lookup', authRequired, requireClinical, diseaseCtrl.lookupIcd);
router.get('/', authRequired, requireClinical, diseaseCtrl.listDiseases);
router.post('/', authRequired, requireClinical, diseaseCtrl.createValidators, diseaseCtrl.createDisease);
router.patch(
  '/:id',
  authRequired,
  requireClinical,
  diseaseCtrl.updateValidators,
  diseaseCtrl.updateDisease
);
router.delete(
  '/:id',
  authRequired,
  requireClinical,
  diseaseCtrl.deleteValidators,
  diseaseCtrl.deleteDisease
);

module.exports = router;

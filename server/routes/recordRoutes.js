const express = require('express');
const router = express.Router();
const { authRequired } = require('../middleware/auth');
const { requireClinical } = require('../middleware/rbac');
const recordCtrl = require('../controllers/recordController');

router.use(authRequired, requireClinical);

router.get('/', recordCtrl.listRecords);
router.get('/:id', recordCtrl.getRecord);
router.post('/', recordCtrl.createValidators, recordCtrl.createRecord);
router.patch('/:id', recordCtrl.updateValidators, recordCtrl.updateRecord);

module.exports = router;

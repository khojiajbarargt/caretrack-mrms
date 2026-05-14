const express = require('express');
const router = express.Router();
const { authRequired } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');
const userCtrl = require('../controllers/userController');

router.use(authRequired, requireAdmin);

router.get('/', userCtrl.listUsers);
router.post('/', userCtrl.createValidators, userCtrl.createUser);
router.patch('/:id', userCtrl.updateValidators, userCtrl.updateUser);
router.delete('/:id', userCtrl.deleteValidators, userCtrl.deleteUser);

module.exports = router;

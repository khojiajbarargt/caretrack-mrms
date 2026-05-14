const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const { authRequired } = require('../middleware/auth');

router.post('/login', authCtrl.loginValidators, authCtrl.login);
router.get('/me', authRequired, authCtrl.me);

module.exports = router;

const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').notEmpty().trim().isLength({ min: 2 }),
    body('email').customSanitizer((value) => String(value || '').toLowerCase().trim()).isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').optional().isIn(['tenant']),
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  [
    body('email').customSanitizer((value) => String(value || '').toLowerCase().trim()).isEmail(),
    body('password').notEmpty(),
  ],
  validate,
  authController.login
);

router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);
router.put('/password', verifyToken, authController.changePassword);
router.post('/logout', verifyToken, authController.logout);

module.exports = router;

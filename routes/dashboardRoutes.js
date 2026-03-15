const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const verifyToken = require('../middleware/verifyToken');
const verifyRole = require('../middleware/verifyRole');

const router = express.Router();

router.get('/admin', verifyToken, verifyRole('admin'), dashboardController.getAdminDashboard);
router.get('/owner', verifyToken, verifyRole('owner'), dashboardController.getOwnerDashboard);
router.get('/manager', verifyToken, verifyRole('manager'), dashboardController.getManagerDashboard);
router.get('/tenant', verifyToken, verifyRole('tenant'), dashboardController.getTenantDashboard);

module.exports = router;

const express = require('express');
const tenantController = require('../controllers/tenantController');
const verifyToken = require('../middleware/verifyToken');
const verifyRole = require('../middleware/verifyRole');

const router = express.Router();

router.get('/', verifyToken, verifyRole('owner', 'admin', 'manager'), tenantController.getAllTenants);
router.get('/:id', verifyToken, tenantController.getTenantById);
router.post('/', verifyToken, verifyRole('owner', 'admin', 'manager'), tenantController.createTenant);
router.put('/:id', verifyToken, verifyRole('owner', 'admin', 'manager'), tenantController.updateTenant);
router.delete('/:id', verifyToken, verifyRole('owner', 'admin'), tenantController.deleteTenant);

module.exports = router;

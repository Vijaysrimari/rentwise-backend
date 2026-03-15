const express = require('express');
const supportController = require('../controllers/supportController');
const verifyToken = require('../middleware/verifyToken');
const verifyRole = require('../middleware/verifyRole');

const router = express.Router();

router.get('/', verifyToken, supportController.getAllRequests);
router.post('/', verifyToken, verifyRole('tenant'), supportController.createRequest);
router.put('/:id', verifyToken, verifyRole('manager', 'admin', 'owner'), supportController.updateRequest);
router.delete('/:id', verifyToken, verifyRole('admin'), supportController.deleteRequest);

module.exports = router;

const express = require('express');
const { body } = require('express-validator');
const rentalController = require('../controllers/rentalController');
const verifyToken = require('../middleware/verifyToken');
const verifyRole = require('../middleware/verifyRole');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', verifyToken, rentalController.getAllRentals);
router.get('/my', verifyToken, verifyRole('tenant'), rentalController.getMyRental);
router.get('/pending', verifyToken, verifyRole('owner', 'manager', 'admin'), rentalController.getPendingRentals);
router.post('/request', verifyToken, verifyRole('tenant'), rentalController.requestRental);

router.post(
  '/',
  verifyToken,
  verifyRole('owner', 'admin', 'manager'),
  [
    body('asset').isMongoId(),
    body('tenant').isMongoId(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
  ],
  validate,
  rentalController.createRental
);

router.get('/:id', verifyToken, rentalController.getRentalById);
router.put('/:id/approve', verifyToken, verifyRole('owner', 'manager', 'admin'), rentalController.approveRental);
router.put('/:id/reject', verifyToken, verifyRole('owner', 'manager', 'admin'), rentalController.rejectRental);
router.put('/:id/terminate', verifyToken, verifyRole('owner', 'admin', 'manager'), rentalController.terminateRental);
router.put('/:id', verifyToken, verifyRole('owner', 'admin', 'manager'), rentalController.updateRental);
router.delete('/:id', verifyToken, verifyRole('admin'), rentalController.deleteRental);

module.exports = router;

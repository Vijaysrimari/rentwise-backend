const express = require('express');
const { body } = require('express-validator');
const assetController = require('../controllers/assetController');
const verifyToken = require('../middleware/verifyToken');
const verifyRole = require('../middleware/verifyRole');
const validate = require('../middleware/validate');
const upload = require('../config/multer');

const router = express.Router();

router.get('/', assetController.getAllAssets);
router.get('/:id', assetController.getAssetById);

router.post(
  '/',
  verifyToken,
  verifyRole('owner', 'admin', 'manager'),
  [
    body('title').notEmpty().trim(),
    body('category').isIn(['House', 'Furniture', 'Tools', 'Vehicles', 'Tech Asset', 'Electronics']),
    body('rentAmount').isNumeric().isFloat({ min: 1 }),
  ],
  validate,
  assetController.createAsset
);

router.put('/:id', verifyToken, verifyRole('owner', 'admin', 'manager'), assetController.updateAsset);
router.delete('/:id', verifyToken, verifyRole('owner', 'admin'), assetController.deleteAsset);
router.post(
  '/:id/upload',
  verifyToken,
  verifyRole('owner', 'admin', 'manager'),
  upload.array('images', 5),
  assetController.uploadAssetImage
);

module.exports = router;

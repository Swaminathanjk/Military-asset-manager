const express = require('express');
const router = express.Router();
const assetTypeController = require('../controllers/assetTypeController');

// Basic CRUD
router.post('/', assetTypeController.createAssetType);
router.get('/', assetTypeController.getAssetTypes);
router.get('/:id', assetTypeController.getAssetTypeById);
router.put('/:id', assetTypeController.updateAssetType);
router.delete('/:id', assetTypeController.deleteAssetType);

module.exports = router;

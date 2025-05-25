const express = require('express');
const router = express.Router();
const assetTransactionController = require('../controllers/assetTransactionController');

router.get('/', assetTransactionController.getFilteredTransactions);

module.exports = router;

// routes/purchaseRoutes.js
const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const verifyToken = require('../middleware/verifyToken');

router.post('/', verifyToken, purchaseController.createPurchase);
router.get('/', verifyToken, purchaseController.getPurchases);

module.exports = router; 

const express = require('express');
const router = express.Router();
const controller = require('../controllers/transferController');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);

router.post('/', controller.createTransfer);
router.get('/', controller.getTransfers);
 
module.exports = router;

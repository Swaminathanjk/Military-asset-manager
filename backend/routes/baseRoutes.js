const express = require('express');
const router = express.Router();
const controller = require('../controllers/baseController');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);

router.post('/', controller.createBase);
router.get('/', controller.getAllBases);
router.get('/:id', controller.getBase);
router.put('/:id', controller.updateBase);
router.delete('/:id', controller.deleteBase);

module.exports = router;

const express = require('express');
const router = express.Router();
const controller = require('../controllers/assignmentController');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);

router.post('/', controller.createAssignment);
router.get('/', controller.getAllAssignments);
router.put('/:id/status', controller.updateAssignmentStatus);

module.exports = router;

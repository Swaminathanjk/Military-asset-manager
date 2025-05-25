const express = require('express');
const router = express.Router();
const controller = require('../controllers/assignmentController');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);

router.post('/', controller.createAssignment);
router.get('/', controller.getAllAssignments);
router.get("/personnel/:serviceId", controller.getPersonnelAssignments);


module.exports = router;

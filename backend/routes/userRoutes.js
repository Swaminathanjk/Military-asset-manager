const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController");
const verifyToken = require("../middleware/verifyToken");

// All routes below require authentication
router.use(verifyToken);

// Place '/me' route **before** '/:id' to avoid route conflicts
router.get('/me', controller.getMe);

router.post("/", controller.createUser);
router.get("/", controller.getAllUsers);
router.get("/:id", controller.getUser);
router.put("/:id", controller.updateUser);
router.delete("/:id", controller.deleteUser);

module.exports = router;

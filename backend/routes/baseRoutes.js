const express = require("express");
const router = express.Router();
const controller = require("../controllers/baseController");
const verifyToken = require("../middleware/verifyToken");

// Public: anyone can get all bases without token
router.get("/", controller.getAllBases);

// Protected routes: require token
router.post("/", verifyToken, controller.createBase);
router.get("/:id", verifyToken, controller.getBase);
router.put("/:id", verifyToken, controller.updateBase);
router.delete("/:id", verifyToken, controller.deleteBase);

module.exports = router;

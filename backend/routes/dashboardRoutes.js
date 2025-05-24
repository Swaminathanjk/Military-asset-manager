const express = require("express");
const router = express.Router();
const controller = require("../controllers/dashboardController");
const verifyToken = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles");

router.use(verifyToken);

// Allow roles: Admin, BaseCommander, LogisticsOfficer, Personnel
router.get(
  "/",
  authorizeRoles("admin", "base commander", "logistics officer", "personnel"),
  controller.getDashboardData
);

module.exports = router;

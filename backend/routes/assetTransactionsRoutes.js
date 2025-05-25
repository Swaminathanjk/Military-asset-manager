const express = require("express");
const router = express.Router();
const {
  getDetailedTransactions,
} = require("../controllers/assetTransactionController");

router.get("/", getDetailedTransactions);

module.exports = router;

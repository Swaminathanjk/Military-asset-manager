const mongoose = require("mongoose");
const AssetTransaction = require("../models/AssetTransaction");

exports.getFilteredTransactions = async (req, res) => {
  try {
    const { type, base, assetType, startDate, endDate } = req.query;

    const filter = {};

    if (type) filter.type = type;

    if (base) {
      if (!mongoose.Types.ObjectId.isValid(base)) {
        return res.status(400).json({ error: "Invalid base ID" });
      }
      filter.base = new mongoose.Types.ObjectId(base);
    }

    if (assetType) {
      if (!mongoose.Types.ObjectId.isValid(assetType)) {
        return res.status(400).json({ error: "Invalid assetType ID" });
      }
      filter.assetType = new mongoose.Types.ObjectId(assetType);
    }

    // ✅ Normalize date filtering
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        const start = new Date(startDate);
        if (!isNaN(start)) {
          filter.timestamp.$gte = start;
        }
      }
      if (endDate) {
        // Extend endDate to end of day
        const end = new Date(new Date(endDate).setHours(23, 59, 59, 999));
        if (!isNaN(end)) {
          filter.timestamp.$lte = end;
        }
      }
    }

    const transactions = await AssetTransaction.find(filter)
      .populate("assetType")
      .populate("base")
      .populate("reference");

    res.json({ success: true, data: transactions });
  } catch (err) {
    console.error("Error fetching asset transactions:", err);
    res.status(500).json({ error: "Server error" });
  }
};

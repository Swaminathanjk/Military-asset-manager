const mongoose = require("mongoose");
const AssetTransaction = require("../models/AssetTransaction");
const User = require("../models/User");

exports.createPurchase = async (req, res) => {
  try {
    const { assetType, base, quantity, purchasedBy } = req.body;

    // Basic validations
    if (!assetType || !quantity || !purchasedBy) {
      return res.status(400).json({
        message: "assetType, quantity, and purchasedBy fields are required",
      });
    }

    // Validate purchasedBy as ObjectId
    if (!mongoose.Types.ObjectId.isValid(purchasedBy)) {
      return res.status(400).json({ message: "Invalid purchasedBy user ID" });
    }

    // Fetch purchaser user
    const purchaser = await User.findById(purchasedBy);
    if (!purchaser) {
      return res.status(404).json({ message: "Purchasing user not found" });
    }

    // Role authorization check
    if (!["admin", "logistics officer"].includes(purchaser.role)) {
      return res
        .status(403)
        .json({ message: "User not authorized to purchase assets" });
    }

    // For non-admin users, base is mandatory and must match user's baseId
    if (purchaser.role !== "admin") {
      if (!base) {
        return res
          .status(400)
          .json({ message: "Base is required for this user role" });
      }
      if (!mongoose.Types.ObjectId.isValid(base)) {
        return res.status(400).json({ message: "Invalid base ID" });
      }
      if (!purchaser.baseId || purchaser.baseId.toString() !== base) {
        return res
          .status(403)
          .json({ message: "Base mismatch for purchasing user" });
      }
    }

    // Create ObjectId for base if present (admin may have no base)
    const baseId = base ? new mongoose.Types.ObjectId(base) : null;

    const newPurchase = new AssetTransaction({
      assetType: new mongoose.Types.ObjectId(assetType),
      base: baseId,
      quantity,
      type: "purchase",
      purchasedBy: purchaser._id,
    });

    await newPurchase.save();

    res
      .status(201)
      .json({ message: "Purchase recorded successfully", data: newPurchase });
  } catch (err) {
    console.error("Error creating purchase:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPurchasesByBase = async (req, res) => {
  try {
    const { baseId } = req.params;

    if (!baseId || !mongoose.Types.ObjectId.isValid(baseId)) {
      return res.status(400).json({ message: "Valid Base ID is required" });
    }

    const purchases = await AssetTransaction.find({
      type: "purchase",
      base: baseId,
    })
      .populate("assetType")
      .populate("base")
      .populate("purchasedBy", "name role")
      .sort({ timestamp: -1 });

    res.json({ data: purchases });
  } catch (err) {
    console.error("Error fetching purchases by base:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPurchases = async (req, res) => {
  try {
    const { base, assetType, startDate, endDate } = req.query;

    const filter = { type: "purchase" };

    if (base && mongoose.Types.ObjectId.isValid(base)) filter.base = base;
    if (assetType && mongoose.Types.ObjectId.isValid(assetType))
      filter.assetType = assetType;

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const purchases = await AssetTransaction.find(filter)
      .populate("assetType")
      .populate("base")
      .populate("purchasedBy", "name role")
      .sort({ timestamp: -1 });

    res.json({ data: purchases });
  } catch (err) {
    console.error("Error fetching purchases:", err);
    res.status(500).json({ message: "Server error" });
  }
};

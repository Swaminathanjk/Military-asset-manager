const mongoose = require("mongoose");
const Transfer = require("../models/Transfer");
const User = require("../models/User");
const AssetTransaction = require("../models/AssetTransaction");

exports.createTransfer = async (req, res) => {
  try {
    const { assetType, fromBase, toBase, quantity, initiatedBy } = req.body;

    // Validate required fields
    if (!assetType || !fromBase || !toBase || !quantity || !initiatedBy) {
      return res.status(400).json({
        message:
          "assetType, fromBase, toBase, quantity, and initiatedBy are required",
      });
    }

    // Validate user
    const user = await User.findById(initiatedBy);
    if (!user) {
      return res.status(404).json({ message: "Initiating user not found" });
    }

    // Only admin or logistics officer allowed
    if (!(user.role === "admin" || user.role === "logistics officer")) {
      return res.status(403).json({
        message: "Only admin or logistics officer can perform transfers",
      });
    }

    // If logistics officer, fromBase must match their base
    let actualFromBase = fromBase;
    if (user.role === "logistics officer") {
      if (!user.baseId) {
        return res
          .status(400)
          .json({ message: "Officer has no assigned base" });
      }
      if (!user.baseId.equals(fromBase)) {
        return res.status(403).json({
          message: "Logistics officer can only transfer from their base",
        });
      }
      actualFromBase = user.baseId;
    }

    // Calculate available quantity
    const transactions = await AssetTransaction.find({
      assetType,
      base: actualFromBase,
    });

    const totalIn = transactions
      .filter((t) => ["purchase", "transfer-in"].includes(t.type))
      .reduce((sum, t) => sum + t.quantity, 0);

    const totalOut = transactions
      .filter((t) =>
        ["transfer-out", "assignment", "expenditure"].includes(t.type)
      )
      .reduce((sum, t) => sum + t.quantity, 0);

    const available = totalIn - totalOut;

    if (available < quantity) {
      return res.status(400).json({
        message: `Insufficient quantity in base. Available: ${available}, requested: ${quantity}`,
      });
    }

    // Save the transfer
    const transfer = new Transfer({
      assetType,
      fromBase: actualFromBase,
      toBase,
      quantity,
      initiatedBy,
    });

    await transfer.save();

    // Log the asset transactions (transfer-out from fromBase, transfer-in to toBase)
    await AssetTransaction.insertMany([
      {
        assetType,
        base: actualFromBase,
        quantity,
        type: "transfer-out",
        reference: transfer._id,
        referenceModel: "Transfer",
        date: new Date(),
      },
      {
        assetType,
        base: toBase,
        quantity,
        type: "transfer-in",
        reference: transfer._id,
        referenceModel: "Transfer",
        date: new Date(),
      },
    ]);

    res.status(201).json({ message: "Transfer recorded", data: transfer });
  } catch (err) {
    console.error("Error creating transfer:", err);
    res.status(500).json({
      message: "Error creating transfer",
      error: err.message || err,
    });
  }
};

// Get transfers visible to current user based on role
// controllers/transferController.js
exports.getTransfers = async (req, res) => {
  try {
    const { fromBase, toBase, assetType, startDate, endDate } = req.query;

    const filter = {};

    if (fromBase && mongoose.Types.ObjectId.isValid(fromBase)) {
      filter.fromBase = fromBase;
    }

    if (toBase && mongoose.Types.ObjectId.isValid(toBase)) {
      filter.toBase = toBase;
    }

    if (assetType && mongoose.Types.ObjectId.isValid(assetType)) {
      filter.assetType = assetType;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transfers = await Transfer.find(filter)
      .populate("fromBase")
      .populate("toBase")
      .populate("assetType")
      .populate("initiatedBy", "name role")
      .sort({ date: -1 });

    res.json({ data: transfers });
  } catch (err) {
    console.error("Error fetching transfers:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get transfers filtered by base and optionally by type (sent or received)
exports.getTransfersByBase = async (req, res) => {
  try {
    const user = req.user;
    const { base, type } = req.query;

    if (!base) {
      return res.status(400).json({ message: "Base ID is required" });
    }

    // Convert user.baseId and base to strings for safe comparison
    const userBaseIdStr = user.baseId ? user.baseId.toString() : null;

    // Role-based authorization check:
    // Admin can query any base,
    // Logistics officer and commander only their own base allowed
    if (user.role !== "admin" && userBaseIdStr !== base) {
      return res
        .status(403)
        .json({ message: "Unauthorized to view transfers for this base" });
    }

    let transfersSent = [];
    let transfersReceived = [];

    if (type === "sent") {
      transfersSent = await Transfer.find({ fromBase: base })
        .populate("assetType")
        .populate("fromBase")
        .populate("toBase")
        .populate("initiatedBy")
        .sort({ createdAt: -1 });

      return res.json({ transfersSent });
    }

    if (type === "received") {
      transfersReceived = await Transfer.find({ toBase: base })
        .populate("assetType")
        .populate("fromBase")
        .populate("toBase")
        .populate("initiatedBy")
        .sort({ createdAt: -1 });

      return res.json({ transfersReceived });
    }

    // If no type specified, return both sent and received
    transfersSent = await Transfer.find({ fromBase: base })
      .populate("assetType")
      .populate("fromBase")
      .populate("toBase")
      .populate("initiatedBy")
      .sort({ createdAt: -1 });

    transfersReceived = await Transfer.find({ toBase: base })
      .populate("assetType")
      .populate("fromBase")
      .populate("toBase")
      .populate("initiatedBy")
      .sort({ createdAt: -1 });

    return res.json({ transfersSent, transfersReceived });
  } catch (err) {
    console.error("Error fetching transfers by base:", err);
    return res
      .status(500)
      .json({ message: "Error fetching transfers by base" });
  }
};

exports.getAllTransfers = async (req, res) => {
  try {
    const { assetType, startDate, endDate } = req.query;

    const filter = {};

    if (assetType && mongoose.Types.ObjectId.isValid(assetType)) {
      filter.assetType = assetType;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transfers = await Transfer.find(filter)
      .populate("fromBase")
      .populate("toBase")
      .populate("assetType")
      .populate("initiatedBy", "name role")
      .sort({ date: -1 });

    res.json({ data: transfers });
  } catch (err) {
    console.error("Error fetching all transfers:", err);
    res.status(500).json({ message: "Server error" });
  }
};

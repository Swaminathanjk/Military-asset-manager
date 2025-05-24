const Transfer = require("../models/Transfer");

exports.createTransfer = async (req, res) => {
  try {
    const user = req.user; // from verifyToken middleware
    const { assetType, toBase, quantity } = req.body;

    // Role check: only admin or logistics officer can create transfers
    if (!(user.role === "admin" || user.role === "logistics officer")) {
      return res
        .status(403)
        .json({ message: "Unauthorized to create transfer" });
    }

    // Freeze fromBase to user's base if logistics officer
    let fromBase = req.body.fromBase;
    if (user.role === "logistics officer") {
      if (!user.baseId) {
        return res.status(400).json({ message: "User base is required" });
      }
      fromBase = user.baseId;
    }

    if (!assetType || !fromBase || !toBase || !quantity) {
      return res.status(400).json({
        message: "assetType, fromBase, toBase, and quantity are required",
      });
    }

    const transfer = new Transfer({
      assetType,
      fromBase,
      toBase,
      quantity,
      initiatedBy: user._id,
    });

    await transfer.save();

    res.status(201).json({ message: "Transfer recorded", data: transfer });
  } catch (err) {
    console.error("Error creating transfer:", err);
    res
      .status(500)
      .json({ message: "Error creating transfer", error: err.message || err });
  }
};

exports.getTransfers = async (req, res) => {
  try {
    const user = req.user;
    const userRole = user.role;
    const userBaseId = user.baseId;

    let transfersMade = [];
    let transfersReceived = [];

    if (userRole === "admin") {
      // Admin sees all transfers made and received
      transfersMade = await Transfer.find({})
        .populate("assetType")
        .populate("fromBase")
        .populate("toBase")
        .populate("initiatedBy")
        .sort({ createdAt: -1 });

      transfersReceived = transfersMade; // same for admin
    } else if (
      userRole === "logistics officer" ||
      userRole === "base commander"
    ) {
      if (!userBaseId) {
        return res
          .status(400)
          .json({ message: "User base is required for this role" });
      }

      // Transfers made from user's base
      transfersMade = await Transfer.find({ fromBase: userBaseId })
        .populate("assetType")
        .populate("fromBase")
        .populate("toBase")
        .populate("initiatedBy")
        .sort({ createdAt: -1 });

      // Transfers received at user's base
      transfersReceived = await Transfer.find({ toBase: userBaseId })
        .populate("assetType")
        .populate("fromBase")
        .populate("toBase")
        .populate("initiatedBy")
        .sort({ createdAt: -1 });
    } else {
      return res
        .status(403)
        .json({ message: "Unauthorized to view transfers" });
    }

    return res.json({
      transfersMade,
      transfersReceived,
    });
  } catch (err) {
    console.error("Error fetching transfers:", err);
    res.status(500).json({ message: "Error fetching transfers" });
  }
};

exports.getTransfersByBase = async (req, res) => {
  try {
    const user = req.user;
    const { base, type } = req.query;

    if (!base) {
      return res.status(400).json({ message: "Base ID is required" });
    }

    // Role-based authorization check:
    // Admin can query any base,
    // Logistics and commander only their own base allowed
    if (
      user.role !== "admin" &&
      (!user.baseId || user.baseId.toString() !== base)
    ) {
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

    // If no type specified, return both:
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
    res.status(500).json({ message: "Error fetching transfers by base" });
  }
};

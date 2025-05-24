const mongoose = require("mongoose");
const User = require("../models/User");
const Assignment = require("../models/Assignment");
const AssetTransaction = require("../models/AssetTransaction");

exports.createAssignment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { assetType, base, quantity, assignedTo, assignedBy } = req.body;

    if (!assetType || !base || !quantity || !assignedTo || !assignedBy) {
      await session.abortTransaction();
      return res.status(400).json({ message: "All fields are required" });
    }

    const baseId = new mongoose.Types.ObjectId(base);

    // Validate commander
    const commander = await User.findOne({ serviceId: assignedBy }).session(
      session
    );
    if (!commander) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Commander not found" });
    }

    if (commander.role === "logistics officer") {
      await session.abortTransaction();
      return res
        .status(403)
        .json({ message: "Logistics officers cannot assign assets" });
    }

    if (!commander.baseId || !commander.baseId.equals(baseId)) {
      await session.abortTransaction();
      return res
        .status(403)
        .json({ message: "Provided base does not match commander's base" });
    }

    // Validate personnel
    const personnel = await User.findOne({ serviceId: assignedTo }).session(
      session
    );
    if (!personnel) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Assigned personnel not found" });
    }

    if (!personnel.baseId || !personnel.baseId.equals(baseId)) {
      await session.abortTransaction();
      return res
        .status(403)
        .json({ message: "Assigned personnel is not part of this base" });
    }

    // Check asset availability
    const transactions = await AssetTransaction.find({
      assetType,
      base: baseId,
    }).session(session);

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
      await session.abortTransaction();
      return res.status(400).json({
        message: `Not enough quantity available. Only ${available} left.`,
      });
    }

    // Create assignment
    const assignment = new Assignment({
      assetType,
      base: baseId,
      quantity,
      assignedTo,
      assignedBy,
    });

    await assignment.save({ session });

    // Record asset transaction
    const assetTx = new AssetTransaction({
      assetType,
      base: baseId,
      quantity,
      type: "assignment",
      reference: assignment._id,
      referenceModel: "Assignment",
    });

    await assetTx.save({ session });

    await session.commitTransaction();
    res
      .status(201)
      .json({ message: "Asset assigned successfully", data: assignment });
  } catch (err) {
    await session.abortTransaction();
    console.error("Assignment error:", err);
    res
      .status(500)
      .json({ message: "Error assigning asset", error: err.message });
  } finally {
    session.endSession();
  }
};

exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate("assetType", "name")
      .populate("base", "name")
      .populate("assignedTo", "name serviceId")
      .populate("assignedBy", "name serviceId")
      .sort({ createdAt: -1 });

    // Send the array directly without wrapping in an object
    res.json(assignments);
  } catch (err) {
    console.error("Error fetching assignments:", err);
    res.status(500).json({ message: "Error fetching assignments" });
  }
};

exports.getPersonnelAssignments = async (req, res) => {
  try {
    const { serviceId } = req.params;

    if (!serviceId) {
      return res.status(400).json({ message: "Missing personnel service ID" });
    }

    const personnel = await User.findOne({ serviceId });
    if (!personnel) {
      return res.status(404).json({ message: "Personnel not found" });
    }

    const assignments = await Assignment.find({ assignedTo: personnel._id })
      .populate("assetType", "name")
      .populate("base", "name")
      .populate("assignedBy", "name serviceId")
      .sort({ createdAt: -1 });

    res.json({ data: assignments });
  } catch (err) {
    console.error("Error fetching personnel assignments:", err);
    res.status(500).json({ message: "Error fetching assigned assets" });
  }
};

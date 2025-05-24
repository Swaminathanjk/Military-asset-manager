const AssetTransaction = require("../models/AssetTransaction");
const Assignment = require("../models/Assignment");
const Transfer = require("../models/Transfer");
const mongoose = require("mongoose");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.getDashboardData = async (req, res) => {
  console.log("Inside getDashboardData");
  console.log("User from token:", req.user);

  try {
    const { base, assetType, startDate, endDate } = req.query;
    const { role, base: userBase, id: userId } = req.user;

    const normalizedRole = role.toLowerCase(); // 🔑 Convert to lowercase

    const baseId =
      base && isValidObjectId(base) ? new mongoose.Types.ObjectId(base) : null;
    const assetTypeId =
      assetType && isValidObjectId(assetType)
        ? new mongoose.Types.ObjectId(assetType)
        : null;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const addDateFilter = (filter, field = "timestamp") => {
      if (startDate || endDate) {
        filter[field] = dateFilter;
      }
    };

    const purchaseFilter = { type: "purchase" };
    const transfersInFilter = {};
    const transfersOutFilter = {};
    const assignedFilter = { isExpended: false };
    const expendedFilter = { isExpended: true };

    // ✅ Lowercase role comparison
    if (normalizedRole === "admin") {
      if (baseId) {
        purchaseFilter.base = baseId;
        transfersInFilter.toBase = baseId;
        transfersOutFilter.fromBase = baseId;
        assignedFilter.base = baseId;
        expendedFilter.base = baseId;
      }
    } else if (
      ["base commander", "logistics officer"].includes(normalizedRole)
    ) {
      const effectiveBaseId = baseId || new mongoose.Types.ObjectId(userBase); // allow override from query
      purchaseFilter.base = effectiveBaseId;
      transfersInFilter.toBase = effectiveBaseId;
      transfersOutFilter.fromBase = effectiveBaseId;
      assignedFilter.base = effectiveBaseId;
      expendedFilter.base = effectiveBaseId;
    } else if (normalizedRole === "personnel") {
      assignedFilter.assignedTo = userId;
      expendedFilter.assignedTo = userId;
    } else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    if (assetTypeId) {
      purchaseFilter.assetType = assetTypeId;
      transfersInFilter.assetType = assetTypeId;
      transfersOutFilter.assetType = assetTypeId;
      assignedFilter.assetType = assetTypeId;
      expendedFilter.assetType = assetTypeId;
    }

    addDateFilter(purchaseFilter);
    addDateFilter(transfersInFilter, "date");
    addDateFilter(transfersOutFilter, "date");
    addDateFilter(assignedFilter, "date");
    addDateFilter(expendedFilter, "date");

    const purchases = await AssetTransaction.aggregate([
      { $match: purchaseFilter },
      { $group: { _id: "$assetType", total: { $sum: "$quantity" } } },
    ]);

    const transfersIn = await Transfer.aggregate([
      { $match: transfersInFilter },
      { $group: { _id: "$assetType", total: { $sum: "$quantity" } } },
    ]);

    const transfersOut = await Transfer.aggregate([
      { $match: transfersOutFilter },
      { $group: { _id: "$assetType", total: { $sum: "$quantity" } } },
    ]);

    const assigned = await Assignment.aggregate([
      { $match: assignedFilter },
      { $group: { _id: "$assetType", total: { $sum: "$quantity" } } },
    ]);

    const expended = await Assignment.aggregate([
      { $match: expendedFilter },
      { $group: { _id: "$assetType", total: { $sum: "$quantity" } } },
    ]);

    const sumTotals = (arr) => arr.reduce((acc, item) => acc + item.total, 0);

    const data = {
      purchases,
      transfersIn,
      transfersOut,
      assigned,
      expended,
      netMovement:
        sumTotals(purchases) + sumTotals(transfersIn) - sumTotals(transfersOut),
      closingBalance:
        sumTotals(purchases) +
        sumTotals(transfersIn) -
        sumTotals(transfersOut) -
        sumTotals(assigned) -
        sumTotals(expended),
    };
    console.log("purchaseFilter:", purchaseFilter);
    console.log("transfersInFilter:", transfersInFilter);
    console.log("transfersOutFilter:", transfersOutFilter);
    console.log("assignedFilter:", assignedFilter);
    console.log("expendedFilter:", expendedFilter);

    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating dashboard data" });
  }
};

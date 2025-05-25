const AssetTransaction = require("../models/AssetTransaction");

exports.getDetailedTransactions = async (req, res) => {
  try {
    const { type, base, assetType, startDate, endDate } = req.query;

    // Build dynamic filter
    const filter = {};
    if (type) filter.type = type;
    if (base) filter.base = base;
    if (assetType) filter.assetType = assetType;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);

      if (endDate) {
        const end = new Date(endDate);
        // Extend endDate to include entire day till 23:59:59.999
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    // Base populate array (common)
    const basePopulate = [
      { path: "assetType" },
      { path: "base" },
      {
        path: "purchasedBy",
        select: "name email role",
      },
    ];

    // Conditional populate for reference depending on type
    let referencePopulate = null;

    switch (type) {
      case "transfer-in":
      case "transfer-out":
        referencePopulate = {
          path: "reference",
          populate: [
            { path: "fromBase", select: "name" },
            { path: "toBase", select: "name" },
            { path: "initiatedBy", select: "name email role" },
          ],
        };
        break;

      case "assignment":
        referencePopulate = {
          path: "reference",
          populate: [
            { path: "assignedTo", select: "name email role" },
            { path: "assignedBy", select: "name email role" },
          ],
        };
        break;

      case "purchase":
        // Purchases may not need reference population or adjust as needed
        referencePopulate = {
          path: "reference",
          // populate whatever fields exist on purchase references if any
        };
        break;

      default:
        // If no type or unknown type, don't populate reference or populate minimally
        referencePopulate = {
          path: "reference",
        };
        break;
    }

    if (referencePopulate) basePopulate.push(referencePopulate);

    // Execute query
    const transactions = await AssetTransaction.find(filter)
      .populate(basePopulate)
      .sort({ date: -1 });

    res.status(200).json({ data: transactions });
  } catch (error) {
    console.error("Error fetching detailed transactions:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching transactions." });
  }
};

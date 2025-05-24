const AssetType = require("../models/AssetType");
const AssetTransaction = require("../models/AssetTransaction");
const mongoose = require("mongoose");

exports.getAssetTypeByBase = async (req, res) => {
  const { baseId } = req.params;

  try {
    const assets = await AssetTransaction.aggregate([
      // Match transactions only for the specified base
      { $match: { base: new mongoose.Types.ObjectId(baseId) } },

      // Group by assetType, calculate net quantity
      {
        $group: {
          _id: "$assetType",
          netQuantity: {
            $sum: {
              $switch: {
                branches: [
                  // Add quantities for purchases and transfer-ins
                  {
                    case: { $in: ["$type", ["purchase", "transfer-in"]] },
                    then: "$quantity",
                  },

                  // Subtract quantities for assignments, transfer-outs, expenditures
                  {
                    case: {
                      $in: [
                        "$type",
                        ["assignment", "transfer-out", "expenditure"],
                      ],
                    },
                    then: { $multiply: ["$quantity", -1] },
                  },
                ],
                default: 0,
              },
            },
          },
        },
      },

      // Filter only assetTypes with positive net quantity
      { $match: { netQuantity: { $gt: 0 } } },

      // Join with assetType collection to get asset details (like name)
      {
        $lookup: {
          from: "assettypes", // Make sure your collection name is correct (check MongoDB)
          localField: "_id",
          foreignField: "_id",
          as: "assetTypeDetails",
        },
      },

      // Unwind the array from lookup
      { $unwind: "$assetTypeDetails" },

      // Project only the fields you want to return
      {
        $project: {
          assetTypeId: "$_id",
          name: "$assetTypeDetails.name",
          netQuantity: 1,
        },
      },
    ]);

    res.json(assets);
  } catch (error) {
    console.error("Error fetching assets by base:", error);
    res.status(500).json({ message: "Failed to fetch assets for base" });
  }
};

// @desc Create a new AssetType
exports.createAssetType = async (req, res) => {
  try {
    const { name, category, unit } = req.body;

    const exists = await AssetType.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "Asset type already exists" });
    }

    const newAssetType = new AssetType({ name, category, unit });
    await newAssetType.save();

    res.status(201).json(newAssetType);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get all asset types
exports.getAssetTypes = async (req, res) => {
  try {
    const assetTypes = await AssetType.find();
    res.status(200).json(assetTypes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get a single asset type by ID
exports.getAssetTypeById = async (req, res) => {
  try {
    const assetType = await AssetType.findById(req.params.id);
    if (!assetType) return res.status(404).json({ message: "Not found" });
    res.status(200).json(assetType);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Update an asset type
exports.updateAssetType = async (req, res) => {
  try {
    const updated = await AssetType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Delete an asset type
exports.deleteAssetType = async (req, res) => {
  try {
    const deleted = await AssetType.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Asset type deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

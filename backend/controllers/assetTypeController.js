const AssetType = require('../models/AssetType');

// @desc Create a new AssetType
exports.createAssetType = async (req, res) => {
  try {
    const { name, category, unit } = req.body;

    const exists = await AssetType.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: 'Asset type already exists' });
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
    if (!assetType) return res.status(404).json({ message: 'Not found' });
    res.status(200).json(assetType);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Update an asset type
exports.updateAssetType = async (req, res) => {
  try {
    const updated = await AssetType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Delete an asset type
exports.deleteAssetType = async (req, res) => {
  try {
    const deleted = await AssetType.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.status(200).json({ message: 'Asset type deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// controllers/purchaseController.js
const AssetTransaction = require('../models/AssetTransaction');

exports.createPurchase = async (req, res) => {
  try {
    const { assetType, base, quantity } = req.body;

    const newPurchase = new AssetTransaction({
      assetType,
      base,
      quantity,
      type: 'purchase' 
    });

    await newPurchase.save();
    res.status(201).json({ message: 'Purchase recorded successfully', data: newPurchase });
  } catch (err) {
    console.error('Error creating purchase:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPurchases = async (req, res) => {
  try {
    const { base, assetType, startDate, endDate } = req.query;

    const filter = { type: 'purchase' };

    if (base) filter.base = base;
    if (assetType) filter.assetType = assetType;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const purchases = await AssetTransaction.find(filter)
      .populate('assetType')
      .populate('base')
      .sort({ timestamp: -1 });

    res.json({ data: purchases });
  } catch (err) {
    console.error('Error fetching purchases:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

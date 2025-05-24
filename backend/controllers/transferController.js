const Transfer = require('../models/Transfer');

exports.createTransfer = async (req, res) => {
  try {
    const { assetType, fromBase, toBase, quantity } = req.body;

    const transfer = new Transfer({ assetType, fromBase, toBase, quantity });
    await transfer.save();

    res.status(201).json({ message: 'Transfer recorded', data: transfer });
  } catch (err) {
    res.status(500).json({ message: 'Error creating transfer', error: err });
  }
};

exports.getTransfers = async (req, res) => {
  try {
    const { base } = req.query;

    const filter = {};
    if (base) {
      filter.$or = [{ fromBase: base }, { toBase: base }];
    }

    const transfers = await Transfer.find(filter)
      .populate('assetType')
      .populate('fromBase')
      .populate('toBase')
      .sort({ timestamp: -1 });

    res.json({ data: transfers });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching transfers' });
  }
};

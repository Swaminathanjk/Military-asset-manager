// models/Transfer.js
const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  assetType: { type: mongoose.Schema.Types.ObjectId, ref: 'AssetType', required: true },
  fromBase: { type: mongoose.Schema.Types.ObjectId, ref: 'Base', required: true },
  toBase: { type: mongoose.Schema.Types.ObjectId, ref: 'Base', required: true },
  quantity: { type: Number, required: true },
  initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Transfer', transferSchema);

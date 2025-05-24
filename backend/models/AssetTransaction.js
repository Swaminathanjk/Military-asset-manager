// models/AssetTransaction.js
const mongoose = require('mongoose');

const assetTransactionSchema = new mongoose.Schema({
  assetType: { type: mongoose.Schema.Types.ObjectId, ref: 'AssetType', required: true },
  base: { type: mongoose.Schema.Types.ObjectId, ref: 'Base', required: true },
  quantity: { type: Number, required: true },
  type: {
    type: String,
    enum: ['purchase', 'transfer-in', 'transfer-out', 'assignment', 'expenditure'], 
    required: true
  },
  reference: { type: mongoose.Schema.Types.ObjectId, refPath: 'referenceModel' },
  referenceModel: { type: String }, // e.g., 'Transfer', 'Assignment'
  purchasedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ✅ NEW
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });


module.exports = mongoose.model('AssetTransaction', assetTransactionSchema);

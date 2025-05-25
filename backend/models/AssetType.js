// models/AssetType.js
const mongoose = require('mongoose');

const assetTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String ,required: true }, // e.g., weapon, vehicle, ammunition
  unit: { type: String }, // e.g., pieces, liters
}, { timestamps: true });

module.exports = mongoose.model('AssetType', assetTypeSchema);

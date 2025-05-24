// models/Assignment.js
const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  assetType: { type: mongoose.Schema.Types.ObjectId, ref: 'AssetType', required: true },
  base: { type: mongoose.Schema.Types.ObjectId, ref: 'Base', required: true },
  assignedTo: { type: String, required: true }, 
  assignedBy: { type: String, required: true }, 
  quantity: { type: Number, required: true },  
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);

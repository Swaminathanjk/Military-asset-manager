const Base = require('../models/Base');

exports.createBase = async (req, res) => {
  try {
    const base = await Base.create(req.body);
    res.status(201).json({ message: 'Base created', data: base });
  } catch (err) {
    res.status(500).json({ message: 'Error creating base' });
  }
};

exports.getAllBases = async (req, res) => {
  try {
    const bases = await Base.find();
    res.json({ data: bases });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bases' });
  }
};

exports.getBase = async (req, res) => {
  try {
    const base = await Base.findById(req.params.id);
    if (!base) return res.status(404).json({ message: 'Base not found' });
    res.json({ data: base });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching base' });
  }
};

exports.updateBase = async (req, res) => {
  try {
    const updated = await Base.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Base updated', data: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error updating base' });
  }
};

exports.deleteBase = async (req, res) => {
  try {
    await Base.findByIdAndDelete(req.params.id);
    res.json({ message: 'Base deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting base' });
  }
};

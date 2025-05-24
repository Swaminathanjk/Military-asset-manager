const Assignment = require('../models/Assignment');

exports.createAssignment = async (req, res) => {
  try {
    const { assetType, base, quantity, assignedTo, status } = req.body;

    const assignment = new Assignment({
      assetType,
      base,
      quantity,
      assignedTo,
      status: status || 'assigned',
    });

    await assignment.save();
    res.status(201).json({ message: 'Asset assigned successfully', data: assignment });
  } catch (err) {
    res.status(500).json({ message: 'Error assigning asset', error: err });
  }
};

exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('assetType')
      .populate('base');
    res.json({ data: assignments });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching assignments' });
  }
};

exports.updateAssignmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Assignment.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ message: 'Assignment updated', data: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error updating assignment' });
  }
};

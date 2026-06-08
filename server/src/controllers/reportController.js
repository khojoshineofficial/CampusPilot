const Report = require('../models/Report');
const User = require('../models/User');

exports.createReport = async (req, res) => {
  try {
    const { reason, details, onModel, onDocument } = req.body;
    const report = await Report.create({ reporter: req.user._id, reason, details, onModel, onDocument });
    res.status(201).json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [reports, total] = await Promise.all([
      Report.find({ status }).sort('-createdAt').skip(skip).limit(Number(limit))
        .populate('reporter', 'name email avatar'),
      Report.countDocuments({ status }),
    ]);
    res.json({ success: true, reports, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resolveReport = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, adminNote, resolvedBy: req.user._id, resolvedAt: Date.now() },
      { new: true }
    );
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.suspendUser = async (req, res) => {
  try {
    const { isBanned, banReason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isBanned, banReason: isBanned ? banReason : undefined },
      { new: true }
    ).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

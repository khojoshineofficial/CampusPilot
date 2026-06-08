const Announcement = require('../models/Announcement');

exports.getAnnouncements = async (req, res) => {
  try {
    const { role, department, level, page = 1, limit = 20 } = req.query;
    const filter = { isPublished: true };
    if (role) filter.targetRole = { $in: [role, 'all'] };
    if (department) filter.targetDepartment = { $in: [department, 'all'] };
    if (level) filter.targetLevel = { $in: [level, 'all'] };
    const announcements = await Announcement.find(filter)
      .populate('createdBy', 'fullname role')
      .skip((page - 1) * limit)
      .limit(+limit)
      .sort({ isPinned: -1, createdAt: -1 });
    const total = await Announcement.countDocuments(filter);
    res.json({ success: true, announcements, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user._id };
    if (req.file) data.attachmentUrl = req.file.path;
    const announcement = await Announcement.create(data);
    res.status(201).json({ success: true, announcement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, announcement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.viewAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

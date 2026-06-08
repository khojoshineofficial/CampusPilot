const Announcement = require('../models/Announcement');
const createNotification = require('../utils/notify');
const User = require('../models/User');

exports.createAnnouncement = async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user._id };
    if (req.files) {
      data.attachments = req.files.map((f) => ({ name: f.originalname, url: f.path, type: f.mimetype }));
    }

    if (data.isPublished && !data.scheduledFor) {
      data.publishedAt = new Date();
    }

    const announcement = await Announcement.create(data);
    res.status(201).json({ success: true, announcement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, priority, search } = req.query;
    const query = { isPublished: true };
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (search) query.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [announcements, total] = await Promise.all([
      Announcement.find(query).sort('-publishedAt').skip(skip).limit(Number(limit))
        .populate('createdBy', 'name avatar role department faculty'),
      Announcement.countDocuments(query),
    ]);

    res.json({ success: true, announcements, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAnnouncement = async (req, res) => {
  try {
    const a = await Announcement.findById(req.params.id).populate('createdBy', 'name avatar role');
    if (!a) return res.status(404).json({ success: false, message: 'Announcement not found' });
    a.views += 1;
    await a.save();
    res.json({ success: true, announcement: a });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const a = await Announcement.findById(req.params.id);
    if (!a) return res.status(404).json({ success: false, message: 'Announcement not found' });
    if (a.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (req.body.isPublished && !a.publishedAt) req.body.publishedAt = new Date();
    const updated = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, announcement: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const a = await Announcement.findById(req.params.id);
    if (!a) return res.status(404).json({ success: false, message: 'Announcement not found' });
    if (a.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    await a.deleteOne();
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

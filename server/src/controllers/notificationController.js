const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const { role, department, level } = req.user;
    const filter = {
      $or: [
        { recipientRole: 'all' },
        { recipientRole: role },
      ],
    };
    const notifications = await Notification.find(filter)
      .sort('-createdAt')
      .limit(50);
    const withRead = notifications.map(n => ({
      ...n.toObject(),
      isRead: n.readBy.includes(req.user._id),
    }));
    res.json({ success: true, notifications: withRead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const notification = await Notification.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { $addToSet: { readBy: req.user._id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    const { role } = req.user;
    await Notification.updateMany(
      { $or: [{ recipientRole: 'all' }, { recipientRole: role }] },
      { $addToSet: { readBy: req.user._id } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

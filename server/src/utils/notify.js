const Notification = require('../models/Notification');

const createNotification = async ({ recipient, sender, type, title, message, link, onModel, onDocument, io }) => {
  try {
    const notification = await Notification.create({
      recipient, sender, type, title, message, link, onModel, onDocument,
    });

    if (io) {
      io.to(`user:${recipient}`).emit('notification', {
        ...notification.toObject(),
        sender: sender ? { _id: sender } : null,
      });
    }

    return notification;
  } catch (err) {
    console.error('Notification error:', err.message);
  }
};

module.exports = createNotification;

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: [
      'event_approved', 'event_rejected', 'project_approved', 'announcement_published',
      'like', 'comment', 'reply', 'follow', 'event_reminder', 'deadline_reminder',
      'registration_confirmed', 'new_message', 'system'
    ],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String },
  onModel: { type: String, enum: ['Event', 'Project', 'CommunityPost', 'Announcement', 'Comment', 'User'] },
  onDocument: { type: mongoose.Schema.Types.ObjectId },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });

module.exports = mongoose.model('Notification', notificationSchema);

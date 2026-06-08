const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: {
    type: String,
    enum: ['spam', 'fraudulent', 'inappropriate', 'fake_event', 'misleading_advertisement', 'harassment', 'other'],
    required: true,
  },
  details: { type: String },
  onModel: { type: String, required: true, enum: ['CommunityPost', 'Project', 'Event', 'Announcement', 'Advertisement', 'Comment', 'User'] },
  onDocument: { type: mongoose.Schema.Types.ObjectId, required: true },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending',
  },
  adminNote: { type: String },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date },
}, { timestamps: true });

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reporter: 1 });
reportSchema.index({ onDocument: 1, onModel: 1 });

module.exports = mongoose.model('Report', reportSchema);

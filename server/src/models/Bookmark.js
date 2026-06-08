const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  onModel: { type: String, required: true, enum: ['CommunityPost', 'Project', 'Event', 'Announcement'] },
  onDocument: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'onModel' },
}, { timestamps: true });

bookmarkSchema.index({ user: 1, onDocument: 1, onModel: 1 }, { unique: true });
bookmarkSchema.index({ user: 1, onModel: 1, createdAt: -1 });

module.exports = mongoose.model('Bookmark', bookmarkSchema);

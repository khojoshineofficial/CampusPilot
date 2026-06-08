const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  onModel: { type: String, required: true, enum: ['CommunityPost', 'Project', 'Event', 'Comment'] },
  onDocument: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'onModel' },
}, { timestamps: true });

likeSchema.index({ user: 1, onDocument: 1, onModel: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);

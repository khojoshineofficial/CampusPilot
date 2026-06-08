const mongoose = require('mongoose');

const featuredContentSchema = new mongoose.Schema({
  onModel: { type: String, required: true, enum: ['Event', 'Project', 'CommunityPost', 'Announcement', 'Advertisement'] },
  onDocument: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'onModel' },
  placement: [{ type: String, enum: ['homepage', 'dashboard', 'events_section', 'projects_section', 'feed'] }],
  priority: { type: Number, default: 0 },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  isActive: { type: Boolean, default: true },
  featuredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

featuredContentSchema.index({ placement: 1, isActive: 1, priority: -1 });

module.exports = mongoose.model('FeaturedContent', featuredContentSchema);

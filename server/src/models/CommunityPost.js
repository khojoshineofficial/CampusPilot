const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'event', 'project', 'announcement', 'scholarship', 'internship',
      'competition', 'research', 'club_activity', 'student_association',
      'campus_news', 'startup', 'opportunity', 'general'
    ],
    required: true,
  },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  image: { type: String },
  tags: [{ type: String }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  relatedEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  relatedProject: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  relatedAnnouncement: { type: mongoose.Schema.Types.ObjectId, ref: 'Announcement' },
  isPublished: { type: Boolean, default: true },
  isTrending: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 },
  bookmarkCount: { type: Number, default: 0 },
  trendingScore: { type: Number, default: 0 },
  externalLink: { type: String },
  deadline: { type: Date },
  location: { type: String },
}, { timestamps: true });

communityPostSchema.index({ type: 1, isPublished: 1, createdAt: -1 });
communityPostSchema.index({ isTrending: 1, trendingScore: -1 });
communityPostSchema.index({ author: 1 });
communityPostSchema.index({ tags: 1 });
communityPostSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('CommunityPost', communityPostSchema);

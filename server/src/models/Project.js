const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  coverImage: { type: String },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: [
      'final_year', 'startup', 'mobile_app', 'website', 'business',
      'research', 'innovation', 'community', 'other'
    ],
    required: true,
  },
  department: { type: String },
  faculty: { type: String },
  teamMembers: [{
    name: { type: String },
    role: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
  projectLink: { type: String },
  demoLink: { type: String },
  githubRepo: { type: String },
  contactInfo: {
    email: { type: String },
    phone: { type: String },
  },
  socialLinks: {
    twitter: { type: String },
    linkedin: { type: String },
    instagram: { type: String },
    website: { type: String },
  },
  tags: [{ type: String }],
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'pending',
  },
  isFeatured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 },
  bookmarkCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  followersCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

projectSchema.index({ status: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ tags: 1 });
projectSchema.index({ createdBy: 1 });
projectSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Project', projectSchema);

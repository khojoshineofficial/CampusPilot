const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title:            { type: String, required: true, trim: true },
  content:          { type: String, required: true },
  createdBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetRole:       { type: String, enum: ['all','student','lecturer'], default: 'all' },
  targetDepartment: { type: String, default: 'all' },
  targetLevel:      { type: String, default: 'all' },
  priority:         { type: String, enum: ['normal','high','urgent'], default: 'normal' },
  isPublished:      { type: Boolean, default: true },
  isPinned:         { type: Boolean, default: false },
  expiresAt:        { type: Date },
  views:            { type: Number, default: 0 },
  attachmentUrl:    { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);

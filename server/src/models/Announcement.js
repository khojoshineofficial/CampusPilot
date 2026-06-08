const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  category: {
    type: String,
    enum: [
      'academic', 'registration', 'timetable', 'examination',
      'emergency', 'faculty', 'department', 'student_association', 'general'
    ],
    default: 'general',
  },
  attachments: [{ name: String, url: String, type: String }],
  images: [{ type: String }],
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
  scheduledFor: { type: Date },
  expiresAt: { type: Date },
  targetAudience: [{ type: String }],
  views: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: String },
  faculty: { type: String },
  isPinned: { type: Boolean, default: false },
}, { timestamps: true });

announcementSchema.index({ isPublished: 1, publishedAt: -1 });
announcementSchema.index({ category: 1 });
announcementSchema.index({ priority: 1 });
announcementSchema.index({ createdBy: 1 });
announcementSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Announcement', announcementSchema);

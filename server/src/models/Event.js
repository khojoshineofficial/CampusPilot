const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  bannerImage: { type: String },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: [
      'academic', 'seminar', 'workshop', 'conference', 'religious',
      'sports', 'entertainment', 'club', 'student_association',
      'technology', 'business', 'other'
    ],
    required: true,
  },
  venue: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  endDate: { type: Date },
  organizer: {
    name: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  registrationLink: { type: String },
  contactInfo: {
    email: { type: String },
    phone: { type: String },
  },
  socialLinks: {
    twitter: { type: String },
    instagram: { type: String },
    facebook: { type: String },
    website: { type: String },
  },
  tags: [{ type: String }],
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'expired'],
    default: 'pending',
  },
  isFeatured: { type: Boolean, default: false },
  featuredPlacement: [{ type: String, enum: ['homepage', 'dashboard', 'events_section'] }],
  rejectionReason: { type: String },
  views: { type: Number, default: 0 },
  registrationCount: { type: Number, default: 0 },
  attendanceCount: { type: Number, default: 0 },
  qrCode: { type: String },
  calendarIntegration: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
}, { timestamps: true });

eventSchema.index({ status: 1, date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ isFeatured: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Event', eventSchema);

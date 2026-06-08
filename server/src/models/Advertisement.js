const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  image: { type: String },
  link: { type: String, required: true },
  category: {
    type: String,
    enum: ['event', 'startup', 'student_business', 'service', 'project', 'competition', 'other'],
    required: true,
  },
  plan: {
    type: String,
    enum: ['free', 'featured', 'sponsored'],
    default: 'free',
  },
  placement: [{ type: String, enum: ['homepage', 'dashboard', 'feed', 'events', 'projects', 'sidebar'] }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'active', 'expired'],
    default: 'pending',
  },
  startDate: { type: Date },
  endDate: { type: Date },
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: { type: String },
}, { timestamps: true });

advertisementSchema.index({ status: 1, plan: 1 });
advertisementSchema.index({ placement: 1 });
advertisementSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Advertisement', advertisementSchema);

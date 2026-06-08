const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ['scholarship', 'internship', 'competition', 'grant', 'fellowship', 'exchange_program', 'job', 'other'],
    required: true,
  },
  organization: { type: String, required: true },
  location: { type: String },
  isRemote: { type: Boolean, default: false },
  deadline: { type: Date },
  link: { type: String },
  eligibility: { type: String },
  benefits: { type: String },
  tags: [{ type: String }],
  image: { type: String },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending',
  },
  views: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

opportunitySchema.index({ type: 1, status: 1, deadline: 1 });
opportunitySchema.index({ title: 'text', description: 'text', organization: 'text' });

module.exports = mongoose.model('Opportunity', opportunitySchema);

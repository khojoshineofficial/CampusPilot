const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
  description:  { type: String, required: true },
  type:         { type: String, enum: ['scholarship','internship','competition','training','conference','fellowship','exchange','other'], required: true },
  organization: { type: String, required: true },
  location:     { type: String },
  isRemote:     { type: Boolean, default: false },
  deadline:     { type: Date },
  link:         { type: String },
  eligibility:  { type: String },
  benefits:     { type: String },
  imageUrl:     { type: String },
  tags:         [String],
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isApproved:   { type: Boolean, default: false },
  views:        { type: Number, default: 0 },
  saved:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

opportunitySchema.index({ title: 'text', description: 'text', organization: 'text' });
module.exports = mongoose.model('Opportunity', opportunitySchema);

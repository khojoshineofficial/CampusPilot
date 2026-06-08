const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title:            { type: String, required: true, trim: true },
  description:      { type: String, required: true },
  category:         { type: String, enum: ['seminar','workshop','competition','conference','social','sports','academic','other'], default: 'other' },
  date:             { type: Date, required: true },
  time:             { type: String, required: true },
  venue:            { type: String, required: true },
  organizer:        { type: String, required: true },
  registrationLink: { type: String },
  bannerImage:      { type: String },
  targetDepartment: { type: String, default: 'all' },
  registrations:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  saved:            [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views:            { type: Number, default: 0 },
  createdBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublished:      { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);

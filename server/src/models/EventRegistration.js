const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  attended: { type: Boolean, default: false },
  checkedInAt: { type: Date },
  qrToken: { type: String, unique: true },
}, { timestamps: true });

// qrToken index is created automatically by unique:true
eventRegistrationSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title:            { type: String, required: true },
  content:          { type: String, required: true },
  type:             { type: String, enum: ['announcement','book','slide','assignment','event','scholarship','internship','system','general'], default: 'general' },
  recipientRole:    { type: String, enum: ['all','student','lecturer','admin'], default: 'all' },
  recipientDept:    { type: String, default: 'all' },
  recipientLevel:   { type: String, default: 'all' },
  link:             { type: String },
  createdBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  readBy:           [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  icon:             { type: String, default: '🔔' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);

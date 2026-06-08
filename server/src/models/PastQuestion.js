const mongoose = require('mongoose');

const pastQuestionSchema = new mongoose.Schema({
  courseCode:   { type: String, required: true },
  courseName:   { type: String, required: true },
  level:        { type: String, required: true },
  year:         { type: String, required: true },
  semester:     { type: String },
  department:   { type: String, required: true },
  fileUrl:      { type: String, required: true },
  downloads:    { type: Number, default: 0 },
  favorites:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  uploadedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

pastQuestionSchema.index({ courseCode: 'text', courseName: 'text', department: 'text' });
module.exports = mongoose.model('PastQuestion', pastQuestionSchema);

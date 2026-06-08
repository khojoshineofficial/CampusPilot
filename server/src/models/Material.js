const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String },
  type:        { type: String, enum: ['slide','note','assignment','video','audio','link','quiz_resource'], required: true },
  course:      { type: String, required: true },
  courseCode:  { type: String },
  department:  { type: String, required: true },
  level:       { type: String },
  fileUrl:     { type: String },
  externalLink:{ type: String },
  thumbnail:   { type: String },
  dueDate:     { type: Date },
  isPublished: { type: Boolean, default: true },
  downloads:   { type: Number, default: 0 },
  views:       { type: Number, default: 0 },
  uploadedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

materialSchema.index({ course: 'text', title: 'text', department: 'text' });
module.exports = mongoose.model('Material', materialSchema);

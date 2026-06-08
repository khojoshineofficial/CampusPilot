const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title:      { type: String, required: true, trim: true },
  author:     { type: String, default: 'Unknown' },
  department: { type: String, required: true },
  course:     { type: String },
  level:      { type: String },
  description:{ type: String },
  fileUrl:    { type: String, required: true },
  coverImage: { type: String },
  fileType:   { type: String, default: 'pdf' },
  downloads:  { type: Number, default: 0 },
  bookmarks:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags:       [String],
}, { timestamps: true });

bookSchema.index({ title: 'text', author: 'text', department: 'text', course: 'text' });
module.exports = mongoose.model('Book', bookSchema);

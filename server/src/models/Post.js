const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:   { type: String, required: true },
  type:      { type: String, enum: ['general','announcement','project','opportunity','question','resource','event'], default: 'general' },
  imageUrl:  { type: String },
  videoUrl:  { type: String },
  fileUrl:   { type: String },
  link:      { type: String },
  linkTitle: { type: String },
  tags:      [String],
  likes:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  saved:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments:  [commentSchema],
  views:     { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

postSchema.index({ content: 'text', tags: 'text' });
module.exports = mongoose.model('Post', postSchema);

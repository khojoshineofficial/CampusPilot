const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  course:      { type: String, required: true },
  department:  { type: String, required: true },
  level:       { type: String },
  description: { type: String },
  duration:    { type: Number, default: 30 }, // minutes
  questions: [{
    question: { type: String, required: true },
    options:  [String],
    answer:   { type: Number, required: true }, // index of correct option
    points:   { type: Number, default: 1 },
  }],
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublished: { type: Boolean, default: false },
  attempts: [{
    student:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score:      Number,
    total:      Number,
    percentage: Number,
    submittedAt:{ type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);

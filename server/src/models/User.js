const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: '' },
  role: {
    type: String,
    enum: ['student', 'lecturer', 'admin', 'department', 'club', 'organization'],
    default: 'student',
  },
  bio: { type: String, default: '' },
  department: { type: String, default: '' },
  faculty: { type: String, default: '' },
  yearOfStudy: { type: Number },
  studentId: { type: String },
  phone: { type: String },
  socialLinks: {
    twitter: { type: String },
    linkedin: { type: String },
    github: { type: String },
    instagram: { type: String },
    website: { type: String },
  },
  followedTopics: [{ type: String }],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId }],
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String },
  notifications: { type: Boolean, default: true },
  lastSeen: { type: Date, default: Date.now },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);

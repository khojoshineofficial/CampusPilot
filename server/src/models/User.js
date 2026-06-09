const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullname:     { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  password:     { type: String, required: true, minlength: 6 },
  role:         { type: String, enum: ['admin','lecturer','student'], default: 'student' },
  department:   { type: String, default: '' },
  level:        { type: String, default: '' },
  phone:        { type: String, default: '' },
  profileImage: { type: String, default: '' },
  isApproved:   { type: Boolean, default: true },
  isSuspended:  { type: Boolean, default: false },
  interests:    [String],
  courses:      [String],
  lastSeen:     { type: Date, default: Date.now },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.matchPassword = function(pw) { return bcrypt.compare(pw, this.password); };

module.exports = mongoose.model('User', userSchema);

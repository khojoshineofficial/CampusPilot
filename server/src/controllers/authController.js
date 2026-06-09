const User = require('../models/User');
const generateToken = require('../utils/generateToken');

exports.register = async (req, res) => {
  try {
    const { fullname, email, password, role, department, level, phone } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ fullname, email, password, role: role || 'student', department, level, phone: phone || '' });
    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, fullname: user.fullname, email: user.email, role: user.role, department: user.department, level: user.level, phone: user.phone, profileImage: user.profileImage },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    if (user.isSuspended)
      return res.status(403).json({ success: false, message: 'Account suspended' });

    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, fullname: user.fullname, email: user.email, role: user.role, department: user.department, level: user.level, profileImage: user.profileImage },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullname, department, level, phone, interests, courses } = req.body;
    const update = { fullname, department, level, phone, interests, courses };
    if (req.file) update.profileImage = req.file.path;
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword)))
      return res.status(400).json({ success: false, message: 'Current password incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

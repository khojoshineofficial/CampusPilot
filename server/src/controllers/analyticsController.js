const User = require('../models/User');
const Book = require('../models/Book');
const PastQuestion = require('../models/PastQuestion');
const Material = require('../models/Material');
const Post = require('../models/Post');
const Event = require('../models/Event');
const Opportunity = require('../models/Opportunity');
const Quiz = require('../models/Quiz');

exports.getStats = async (req, res) => {
  try {
    const [users, books, pastQuestions, materials, posts, events, opportunities, quizzes] = await Promise.all([
      User.countDocuments(),
      Book.countDocuments(),
      PastQuestion.countDocuments(),
      Material.countDocuments(),
      Post.countDocuments({ isDeleted: false }),
      Event.countDocuments(),
      Opportunity.countDocuments(),
      Quiz.countDocuments(),
    ]);

    const students = await User.countDocuments({ role: 'student' });
    const lecturers = await User.countDocuments({ role: 'lecturer' });
    const admins = await User.countDocuments({ role: 'admin' });

    const recentUsers = await User.find().sort('-createdAt').limit(5).select('fullname email role createdAt');
    const deptStats = await User.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      stats: { users, students, lecturers, admins, books, pastQuestions, materials, posts, events, opportunities, quizzes },
      recentUsers,
      deptStats,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

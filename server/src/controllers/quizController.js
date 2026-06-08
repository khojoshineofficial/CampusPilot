const Quiz = require('../models/Quiz');

exports.getQuizzes = async (req, res) => {
  try {
    const { department, level, course, page = 1, limit = 20 } = req.query;
    const filter = { isPublished: true };
    if (department) filter.department = department;
    if (level) filter.level = level;
    if (course) filter.course = new RegExp(course, 'i');
    const quizzes = await Quiz.find(filter, '-questions.answer')
      .populate('createdBy', 'fullname')
      .skip((page - 1) * limit)
      .limit(+limit)
      .sort('-createdAt');
    const total = await Quiz.countDocuments(filter);
    res.json({ success: true, quizzes, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user._id }).sort('-createdAt');
    res.json({ success: true, quizzes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id, '-questions.answer')
      .populate('createdBy', 'fullname');
    if (!quiz) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    res.json({ success: true, quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Not found' });

    const { answers } = req.body; // array of selected option indices
    let score = 0;
    const total = quiz.questions.reduce((s, q) => s + q.points, 0);

    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.answer) score += q.points;
    });

    const percentage = Math.round((score / total) * 100);
    quiz.attempts.push({ student: req.user._id, score, total, percentage });
    await quiz.save();

    res.json({ success: true, score, total, percentage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

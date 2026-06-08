const Book = require('../models/Book');

exports.getBooks = async (req, res) => {
  try {
    const { department, level, course, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (level) filter.level = level;
    if (course) filter.course = new RegExp(course, 'i');
    if (search) filter.$text = { $search: search };
    const books = await Book.find(filter)
      .populate('uploadedBy', 'fullname role')
      .skip((page - 1) * limit)
      .limit(+limit)
      .sort('-createdAt');
    const total = await Book.countDocuments(filter);
    res.json({ success: true, books, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('uploadedBy', 'fullname');
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createBook = async (req, res) => {
  try {
    const data = { ...req.body, uploadedBy: req.user._id };
    if (req.files?.file) data.fileUrl = req.files.file[0].path;
    if (req.files?.cover) data.coverImage = req.files.cover[0].path;
    const book = await Book.create(data);
    res.status(201).json({ success: true, book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.downloadBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } }, { new: true });
    res.json({ success: true, fileUrl: book.fileUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.bookmarkBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    const idx = book.bookmarks.indexOf(req.user._id);
    if (idx > -1) book.bookmarks.splice(idx, 1);
    else book.bookmarks.push(req.user._id);
    await book.save();
    res.json({ success: true, bookmarked: idx === -1 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const Post = require('../models/Post');

exports.getPosts = async (req, res) => {
  try {
    const { type, search, page = 1, limit = 20 } = req.query;
    const filter = { isDeleted: false };
    if (type) filter.type = type;
    if (search) filter.$text = { $search: search };
    const posts = await Post.find(filter)
      .populate('user', 'fullname profileImage role department')
      .populate('comments.user', 'fullname profileImage')
      .skip((page - 1) * limit)
      .limit(+limit)
      .sort('-createdAt');
    const total = await Post.countDocuments(filter);
    res.json({ success: true, posts, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
      .populate('user', 'fullname profileImage role')
      .populate('comments.user', 'fullname profileImage');
    if (!post || post.isDeleted) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const data = { ...req.body, user: req.user._id };
    if (req.files?.image) data.imageUrl = req.files.image[0].path;
    if (req.files?.video) data.videoUrl = req.files.video[0].path;
    if (req.files?.file) data.fileUrl = req.files.file[0].path;
    const post = await Post.create(data);
    await post.populate('user', 'fullname profileImage role');
    res.status(201).json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, user: req.user._id };
    await Post.findOneAndUpdate(filter, { isDeleted: true });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const idx = post.likes.indexOf(req.user._id);
    if (idx > -1) post.likes.splice(idx, 1);
    else post.likes.push(req.user._id);
    await post.save();
    res.json({ success: true, liked: idx === -1, count: post.likes.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.savePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const idx = post.saved.indexOf(req.user._id);
    if (idx > -1) post.saved.splice(idx, 1);
    else post.saved.push(req.user._id);
    await post.save();
    res.json({ success: true, saved: idx === -1 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.comments.push({ user: req.user._id, content: req.body.content });
    await post.save();
    await post.populate('comments.user', 'fullname profileImage');
    res.json({ success: true, comments: post.comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.comments = post.comments.filter(c => c._id.toString() !== req.params.commentId);
    await post.save();
    res.json({ success: true, message: 'Comment removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

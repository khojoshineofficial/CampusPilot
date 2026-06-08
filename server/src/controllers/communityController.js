const CommunityPost = require('../models/CommunityPost');
const Like = require('../models/Like');
const Bookmark = require('../models/Bookmark');
const createNotification = require('../utils/notify');

exports.createPost = async (req, res) => {
  try {
    const data = { ...req.body, author: req.user._id };
    if (req.file) data.image = req.file.path;

    const post = await CommunityPost.create(data);
    await post.populate('author', 'name avatar role department');
    res.status(201).json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFeed = async (req, res) => {
  try {
    const {
      page = 1, limit = 12, type, search,
      sort = 'recent', tags
    } = req.query;

    const query = { isPublished: true };
    if (type) query.type = type;
    if (tags) query.tags = { $in: tags.split(',') };
    if (search) query.$text = { $search: search };

    let sortObj = { createdAt: -1 };
    if (sort === 'trending') sortObj = { trendingScore: -1, createdAt: -1 };
    if (sort === 'popular') sortObj = { likeCount: -1, createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [posts, total] = await Promise.all([
      CommunityPost.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .populate('author', 'name avatar role department'),
      CommunityPost.countDocuments(query),
    ]);

    res.json({ success: true, posts, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id)
      .populate('author', 'name avatar role department');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.views += 1;
    await post.save();

    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (req.file) req.body.image = req.file.path;
    const updated = await CommunityPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, post: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const { onModel = 'CommunityPost', onDocument } = req.body;
    const docId = onDocument || req.params.id;

    const existing = await Like.findOne({ user: req.user._id, onModel, onDocument: docId });

    let liked = false;
    if (existing) {
      await existing.deleteOne();
    } else {
      await Like.create({ user: req.user._id, onModel, onDocument: docId });
      liked = true;
    }

    const inc = liked ? 1 : -1;
    const Model = require('../models/' + onModel);
    const doc = await Model.findByIdAndUpdate(docId, { $inc: { likeCount: inc } }, { new: true });

    if (liked && doc && doc.author && doc.author.toString() !== req.user._id.toString()) {
      const io = req.app.get('io');
      await createNotification({
        recipient: doc.author || doc.createdBy,
        sender: req.user._id,
        type: 'like',
        title: 'New Like',
        message: `${req.user.name} liked your post.`,
        onModel,
        onDocument: docId,
        io,
      });
    }

    res.json({ success: true, liked, likeCount: doc?.likeCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleBookmark = async (req, res) => {
  try {
    const { onModel = 'CommunityPost', onDocument } = req.body;
    const docId = onDocument || req.params.id;

    const existing = await Bookmark.findOne({ user: req.user._id, onModel, onDocument: docId });

    let bookmarked = false;
    if (existing) {
      await existing.deleteOne();
    } else {
      await Bookmark.create({ user: req.user._id, onModel, onDocument: docId });
      bookmarked = true;
    }

    const inc = bookmarked ? 1 : -1;
    const Model = require('../models/' + onModel);
    await Model.findByIdAndUpdate(docId, { $inc: { bookmarkCount: inc } });

    res.json({ success: true, bookmarked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id })
      .sort('-createdAt')
      .populate('onDocument');
    res.json({ success: true, bookmarks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTrending = async (req, res) => {
  try {
    const posts = await CommunityPost.find({ isPublished: true, isTrending: true })
      .sort({ trendingScore: -1 })
      .limit(10)
      .populate('author', 'name avatar role');
    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

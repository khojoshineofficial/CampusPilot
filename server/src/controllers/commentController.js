const Comment = require('../models/Comment');
const createNotification = require('../utils/notify');

exports.addComment = async (req, res) => {
  try {
    const { content, onModel, onDocument, parentComment } = req.body;

    const comment = await Comment.create({
      content,
      author: req.user._id,
      onModel,
      onDocument,
      parentComment: parentComment || null,
    });

    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, { $push: { replies: comment._id } });
    }

    const Model = require('../models/' + onModel);
    const doc = await Model.findByIdAndUpdate(onDocument, { $inc: { commentCount: 1 } });

    await comment.populate('author', 'name avatar role');

    const io = req.app.get('io');
    if (doc && (doc.author || doc.createdBy)) {
      const recipient = (doc.author || doc.createdBy).toString();
      if (recipient !== req.user._id.toString()) {
        await createNotification({
          recipient,
          sender: req.user._id,
          type: 'comment',
          title: 'New Comment',
          message: `${req.user.name} commented on your post.`,
          onModel,
          onDocument,
          io,
        });
      }
    }

    io.to(`doc:${onDocument}`).emit('new_comment', comment);

    res.status(201).json({ success: true, comment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { onModel, onDocument } = req.query;
    const { page = 1, limit = 20 } = req.query;

    const query = { onModel, onDocument, parentComment: null, isDeleted: false };
    const skip = (Number(page) - 1) * Number(limit);

    const [comments, total] = await Promise.all([
      Comment.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit))
        .populate('author', 'name avatar role')
        .populate({ path: 'replies', populate: { path: 'author', select: 'name avatar role' } }),
      Comment.countDocuments(query),
    ]);

    res.json({ success: true, comments, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    comment.isDeleted = true;
    comment.content = '[Deleted]';
    await comment.save();
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

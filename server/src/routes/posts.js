const router = require('express').Router();
const c = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const { makeUpload } = require('../config/cloudinary');
const multer = require('multer');

const postUpload = makeUpload('posts', ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'pdf', 'doc', 'docx']);
const fields = multer({ storage: postUpload.storage }).fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'file', maxCount: 1 },
]);

router.get('/', protect, c.getPosts);
router.get('/:id', protect, c.getPost);
router.post('/', protect, fields, c.createPost);
router.delete('/:id', protect, c.deletePost);
router.post('/:id/like', protect, c.likePost);
router.post('/:id/save', protect, c.savePost);
router.post('/:id/comments', protect, c.addComment);
router.delete('/:id/comments/:commentId', protect, c.deleteComment);

module.exports = router;

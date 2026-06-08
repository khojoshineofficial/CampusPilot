const router = require('express').Router();
const ctrl = require('../controllers/communityController');
const { protect, optionalAuth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const setFolder = (req, res, next) => { req.uploadFolder = 'campuspilot/posts'; next(); };

router.get('/feed', optionalAuth, ctrl.getFeed);
router.get('/trending', ctrl.getTrending);
router.get('/bookmarks', protect, ctrl.getMyBookmarks);
router.get('/:id', optionalAuth, ctrl.getPost);

router.post('/', protect, setFolder, upload.single('image'), ctrl.createPost);
router.put('/:id', protect, setFolder, upload.single('image'), ctrl.updatePost);
router.delete('/:id', protect, ctrl.deletePost);

router.post('/:id/like', protect, ctrl.toggleLike);
router.post('/:id/bookmark', protect, ctrl.toggleBookmark);

module.exports = router;

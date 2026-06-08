const router = require('express').Router();
const ctrl = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.get('/', ctrl.getComments);
router.post('/', protect, ctrl.addComment);
router.delete('/:id', protect, ctrl.deleteComment);

module.exports = router;

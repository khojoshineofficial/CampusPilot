const router = require('express').Router();
const c = require('../controllers/pastQuestionController');
const { protect, authorize } = require('../middleware/auth');
const { makeUpload } = require('../config/cloudinary');

const upload = makeUpload('past-questions', ['pdf', 'doc', 'docx']);

router.get('/', c.getPastQuestions);
router.get('/:id', c.getPastQuestion);
router.post('/:id/download', protect, c.downloadPastQuestion);
router.post('/:id/favorite', protect, c.favoriteToggle);
router.post('/', protect, authorize('admin', 'lecturer'), upload.single('file'), c.createPastQuestion);
router.delete('/:id', protect, authorize('admin', 'lecturer'), c.deletePastQuestion);

module.exports = router;

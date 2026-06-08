const router = require('express').Router();
const c = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, c.getQuizzes);
router.get('/mine', protect, authorize('lecturer', 'admin'), c.getMyQuizzes);
router.get('/:id', protect, c.getQuiz);
router.post('/:id/submit', protect, c.submitQuiz);
router.post('/', protect, authorize('admin', 'lecturer'), c.createQuiz);
router.put('/:id', protect, authorize('admin', 'lecturer'), c.updateQuiz);
router.delete('/:id', protect, authorize('admin', 'lecturer'), c.deleteQuiz);

module.exports = router;

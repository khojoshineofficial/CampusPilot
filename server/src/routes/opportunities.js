const router = require('express').Router();
const c = require('../controllers/opportunityController');
const { protect, authorize } = require('../middleware/auth');
const { makeUpload } = require('../config/cloudinary');

const upload = makeUpload('opportunities', ['jpg', 'jpeg', 'png', 'webp']);

router.get('/', c.getOpportunities);
router.get('/pending', protect, authorize('admin'), c.getPendingOpportunities);
router.get('/:id', c.getOpportunity);
router.post('/', protect, upload.single('image'), c.createOpportunity);
router.put('/:id/approve', protect, authorize('admin'), c.approveOpportunity);
router.post('/:id/save', protect, c.saveOpportunity);
router.delete('/:id', protect, authorize('admin'), c.deleteOpportunity);

module.exports = router;

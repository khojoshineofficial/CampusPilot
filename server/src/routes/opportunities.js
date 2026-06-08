const router = require('express').Router();
const ctrl = require('../controllers/opportunityController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const setFolder = (req, res, next) => { req.uploadFolder = 'campuspilot/opportunities'; next(); };

router.get('/', ctrl.getOpportunities);
router.get('/pending', protect, authorize('admin'), ctrl.getPendingOpportunities);
router.get('/:id', ctrl.getOpportunity);
router.post('/', protect, setFolder, upload.single('image'), ctrl.createOpportunity);
router.put('/:id/approve', protect, authorize('admin'), ctrl.approveOpportunity);
router.put('/:id/reject', protect, authorize('admin'), ctrl.rejectOpportunity);

module.exports = router;

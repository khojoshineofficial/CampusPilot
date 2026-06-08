const router = require('express').Router();
const ctrl = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const setFolder = (req, res, next) => { req.uploadFolder = 'campuspilot/events'; next(); };

router.get('/', ctrl.getEvents);
router.get('/pending', protect, authorize('admin'), ctrl.getPendingEvents);
router.get('/my', protect, ctrl.getMyEvents);
router.get('/:id', ctrl.getEvent);

router.post('/', protect, setFolder, upload.single('bannerImage'), ctrl.createEvent);
router.put('/:id', protect, setFolder, upload.single('bannerImage'), ctrl.updateEvent);
router.delete('/:id', protect, ctrl.deleteEvent);

router.put('/:id/approve', protect, authorize('admin'), ctrl.approveEvent);
router.put('/:id/reject', protect, authorize('admin'), ctrl.rejectEvent);
router.put('/:id/feature', protect, authorize('admin'), ctrl.featureEvent);

router.post('/:id/register', protect, ctrl.registerForEvent);
router.post('/attendance/checkin', protect, authorize('admin'), ctrl.checkInAttendance);

module.exports = router;

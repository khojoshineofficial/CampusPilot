const router = require('express').Router();
const ctrl = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const setFolder = (req, res, next) => { req.uploadFolder = 'campuspilot/announcements'; next(); };
const allowedRoles = ['admin', 'department', 'lecturer', 'organization', 'club'];

router.get('/', ctrl.getAnnouncements);
router.get('/:id', ctrl.getAnnouncement);
router.post('/', protect, authorize(...allowedRoles), setFolder, upload.array('attachments', 5), ctrl.createAnnouncement);
router.put('/:id', protect, authorize(...allowedRoles, 'admin'), ctrl.updateAnnouncement);
router.delete('/:id', protect, ctrl.deleteAnnouncement);

module.exports = router;

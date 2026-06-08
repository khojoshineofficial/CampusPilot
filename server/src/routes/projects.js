const router = require('express').Router();
const ctrl = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const setFolder = (req, res, next) => { req.uploadFolder = 'campuspilot/projects'; next(); };

router.get('/', ctrl.getProjects);
router.get('/pending', protect, authorize('admin'), ctrl.getPendingProjects);
router.get('/:id', ctrl.getProject);
router.post('/', protect, setFolder, upload.single('coverImage'), ctrl.createProject);
router.put('/:id', protect, setFolder, upload.single('coverImage'), ctrl.updateProject);
router.delete('/:id', protect, ctrl.deleteProject);
router.put('/:id/approve', protect, authorize('admin'), ctrl.approveProject);
router.put('/:id/reject', protect, authorize('admin'), ctrl.rejectProject);

module.exports = router;

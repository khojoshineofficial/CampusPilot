const router = require('express').Router();
const { register, login, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { makeUpload } = require('../config/cloudinary');

const upload = makeUpload('avatars', ['jpg', 'jpeg', 'png', 'webp']);

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('profileImage'), updateProfile);
router.put('/password', protect, changePassword);

module.exports = router;

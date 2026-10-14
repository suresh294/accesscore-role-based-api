const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const { protect } = require('../../middlewares/authMiddleware');

router.get('/me', protect, userController.getCurrentUser);
router.patch('/me', protect, userController.updateCurrentUser);
router.patch('/me/password', protect, userController.changePassword);
router.route('/')
    .get(protect, userController.getUsers)
    .post(protect, userController.createUser);

module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const { protect } = require('../../middlewares/authMiddleware');

router.route('/')
    .get(protect, userController.getUsers)
    .post(protect, userController.createUser);

module.exports = router;

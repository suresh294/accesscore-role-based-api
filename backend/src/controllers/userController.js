const userService = require('../services/userService');
const asyncHandler = require('express-async-handler');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Public
const getUsers = asyncHandler(async (req, res) => {
    const users = await userService.getAllUsers();
    res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: users,
    });
});

// @desc    Create new user
// @route   POST /api/v1/users
// @access  Public
const createUser = asyncHandler(async (req, res) => {
    const user = await userService.createUser(req.body);
    res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user,
    });
});

module.exports = {
    getUsers,
    createUser,
};

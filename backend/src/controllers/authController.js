const asyncHandler = require('express-async-handler');
const userService = require('../services/userService');

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please provide name, email, and password');
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400);
        throw new Error('Please provide a valid email address');
    }

    if (password.length < 6) {
        res.status(400);
        throw new Error('Password must be at least 6 characters long');
    }

    const user = await userService.registerUser({ name, email, password });

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: userService.generateToken(user.id, user.role),
        },
    });
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    const user = await userService.loginUser(email, password);

    res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: userService.generateToken(user.id, user.role),
        },
    });
});

module.exports = {
    registerUser,
    loginUser,
};

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

// @desc    Get the authenticated user's profile
// @route   GET /api/v1/users/me
// @access  Private
const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await userService.getCurrentUser(req.user.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: user,
    });
});

// @desc    Update the authenticated user's profile
// @route   PATCH /api/v1/users/me
// @access  Private
const updateCurrentUser = asyncHandler(async (req, res) => {
    const { name, email } = req.body;

    if (typeof name !== 'string' || !name.trim()) {
        res.status(400);
        throw new Error('Name is required');
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        res.status(400);
        throw new Error('Please provide a valid email address');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await userService.getCurrentUser(req.user.id);
    if (!existingUser) {
        res.status(404);
        throw new Error('User not found');
    }

    const emailOwner = await userService.getUserByEmail(normalizedEmail);
    if (emailOwner && emailOwner.id !== req.user.id) {
        res.status(400);
        throw new Error('Email address is already in use');
    }

    const user = await userService.updateCurrentUser(req.user.id, {
        name: name.trim(),
        email: normalizedEmail,
    });

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
    });
});

// @desc    Change the authenticated user's password
// @route   PATCH /api/v1/users/me/password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
        res.status(400);
        throw new Error('Current password, new password, and confirmation are required');
    }
    if (newPassword.length < 6) {
        res.status(400);
        throw new Error('New password must be at least 6 characters long');
    }
    if (newPassword !== confirmPassword) {
        res.status(400);
        throw new Error('New password and confirmation do not match');
    }
    if (currentPassword === newPassword) {
        res.status(400);
        throw new Error('New password must be different from the current password');
    }

    await userService.changePassword(req.user.id, currentPassword, newPassword);
    res.status(200).json({
        success: true,
        message: 'Password changed successfully',
        data: null,
    });
});

// @desc    Get all team members for administrators
// @route   GET /api/v1/admin/members
// @access  Private/Admin
const getAdminMembers = asyncHandler(async (req, res) => {
    const members = await userService.getAdminMembers();
    res.status(200).json({
        success: true,
        message: 'Team members retrieved successfully',
        count: members.length,
        data: members,
    });
});

// @desc    Update a team member role
// @route   PATCH /api/v1/admin/members/:id
// @access  Private/Admin
const updateMemberRole = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { role } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
        res.status(400);
        throw new Error('Member id must be a positive integer');
    }
    if (!['admin', 'user'].includes(role)) {
        res.status(400);
        throw new Error('Role must be admin or user');
    }

    const member = await userService.updateMemberRole(id, role, req.user.id);
    res.status(200).json({
        success: true,
        message: 'Member role updated successfully',
        data: member,
    });
});

// @desc    Delete a team member
// @route   DELETE /api/v1/admin/members/:id
// @access  Private/Admin
const deleteMember = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        res.status(400);
        throw new Error('Member id must be a positive integer');
    }

    await userService.deleteMember(id, req.user.id);
    res.status(200).json({
        success: true,
        message: 'Member deleted successfully',
        data: null,
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
    getCurrentUser,
    updateCurrentUser,
    changePassword,
    getAdminMembers,
    updateMemberRole,
    deleteMember,
    createUser,
};

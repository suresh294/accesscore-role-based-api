const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const taskRoutes = require('./taskRoutes');

// Auth routes
router.use('/auth', authRoutes);

// Admin routes
router.use('/admin', adminRoutes);

// Task routes
router.use('/tasks', taskRoutes);

// User routes
router.use('/users', userRoutes);

module.exports = router;

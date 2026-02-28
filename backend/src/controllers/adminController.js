const asyncHandler = require('express-async-handler');
const db = require('../config/database');

// @desc    Get system stats
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
const getSystemStats = asyncHandler(async (req, res) => {
    const userCount = await db.query('SELECT COUNT(*) FROM users');

    res.status(200).json({
        success: true,
        message: 'System statistics retrieved successfully',
        data: {
            totalUsers: parseInt(userCount.rows[0].count),
            environment: process.env.NODE_ENV,
            serverTime: new Date().toISOString()
        }
    });
});

module.exports = {
    getSystemStats
};

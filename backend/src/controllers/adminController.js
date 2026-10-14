const asyncHandler = require('express-async-handler');
const db = require('../config/database');

// @desc    Get system stats
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
const getSystemStats = asyncHandler(async (req, res) => {
    const result = await db.query(`
        SELECT
            (SELECT COUNT(*) FROM users) AS "totalUsers",
            (SELECT COUNT(*) FROM users WHERE role = 'admin') AS "totalAdmins",
            (SELECT COUNT(*) FROM tasks) AS "totalTasks",
            (SELECT COUNT(*) FROM tasks WHERE status = 'completed') AS "completedTasks",
            (SELECT COUNT(*) FROM tasks WHERE status <> 'completed') AS "pendingTasks"
    `);
    const stats = result.rows[0];

    res.status(200).json({
        success: true,
        message: 'System statistics retrieved successfully',
        data: {
            totalUsers: parseInt(stats.totalUsers, 10),
            totalAdmins: parseInt(stats.totalAdmins, 10),
            totalTasks: parseInt(stats.totalTasks, 10),
            completedTasks: parseInt(stats.completedTasks, 10),
            pendingTasks: parseInt(stats.pendingTasks, 10),
            environment: process.env.NODE_ENV,
            serverTime: new Date().toISOString()
        }
    });
});

module.exports = {
    getSystemStats
};

const express = require('express');
const router = express.Router();
const { getSystemStats } = require('../../controllers/adminController');
const {
    getAdminMembers,
    updateMemberRole,
    deleteMember,
} = require('../../controllers/userController');
const { protect, authorize } = require('../../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative management APIs
 */

// Protect all routes in this file and authorize 'admin' only
router.use(protect);
router.use(authorize('admin'));

/**
 * @swagger
 * /api/v1/admin/stats:
 *   get:
 *     summary: Get system statistics
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics retrieved successfully
 *       403:
 *         description: Not authorized
 */
router.get('/stats', getSystemStats);
router.get('/members', getAdminMembers);
router.patch('/members/:id', updateMemberRole);
router.delete('/members/:id', deleteMember);

module.exports = router;

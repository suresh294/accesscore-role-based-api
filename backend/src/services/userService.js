const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const normalizeEmail = (email) => email.trim().toLowerCase();

/**
 * Register a new user
 */
const registerUser = async ({ name, email, password }) => {
    email = normalizeEmail(email);
    // Check if user exists
    const userExists = await db.query('SELECT * FROM users WHERE LOWER(email) = $1', [email]);
    if (userExists.rows.length > 0) {
        const error = new Error('User already exists');
        error.statusCode = 400;
        throw error;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const result = await db.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
        [name, email, hashedPassword, 'user']
    );

    return result.rows[0];
};

/**
 * Login user
 */
const loginUser = async (email, password) => {
    email = normalizeEmail(email);
    // Find user
    const result = await db.query('SELECT * FROM users WHERE LOWER(email) = $1', [email]);
    const user = result.rows[0];

    if (!user) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
    }

    return user;
};

/**
 * Generate JWT Token
 */
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '1d',
    });
};

/**
 * Get all users (Demonstrate protected data)
 */
const getAllUsers = async () => {
    const result = await db.query('SELECT id, name, email, role, created_at FROM users');
    return result.rows;
};

const getCurrentUser = async (userId) => {
    const result = await db.query(
        'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
        [userId]
    );
    return result.rows[0];
};

const getUserByEmail = async (email) => {
    const result = await db.query(
        'SELECT id FROM users WHERE LOWER(email) = $1',
        [normalizeEmail(email)]
    );
    return result.rows[0];
};

const updateCurrentUser = async (userId, { name, email }) => {
    const result = await db.query(
        `UPDATE users
         SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING id, name, email, role, created_at`,
        [name, email, userId]
    );
    return result.rows[0];
};

const changePassword = async (userId, currentPassword, newPassword) => {
    const result = await db.query('SELECT password FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password);
    if (!isMatch) {
        const error = new Error('Current password is incorrect');
        error.statusCode = 400;
        throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await db.query(
        'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [hashedPassword, userId]
    );
};

const getAdminMembers = async () => {
    const result = await db.query(
        'SELECT id, name, email, role, created_at FROM users ORDER BY name ASC, id ASC'
    );
    return result.rows;
};

const updateMemberRole = async (id, role, requestingUserId) => {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        const memberResult = await client.query(
            'SELECT id, name, email, role, created_at FROM users WHERE id = $1 FOR UPDATE',
            [id]
        );

        if (memberResult.rows.length === 0) {
            const error = new Error('Member not found');
            error.statusCode = 404;
            throw error;
        }

        const member = memberResult.rows[0];
        if (member.id === requestingUserId && role !== 'admin') {
            const error = new Error('You cannot remove your own administrator access');
            error.statusCode = 403;
            throw error;
        }

        if (member.role === 'admin' && role !== 'admin') {
            const adminCountResult = await client.query(
                "SELECT COUNT(*) FROM users WHERE role = 'admin'"
            );
            if (parseInt(adminCountResult.rows[0].count, 10) <= 1) {
                const error = new Error('The last administrator cannot be demoted');
                error.statusCode = 400;
                throw error;
            }
        }

        const result = await client.query(
            'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, email, role, created_at',
            [role, id]
        );

        await client.query('COMMIT');
        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const deleteMember = async (id, requestingUserId) => {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        const memberResult = await client.query(
            'SELECT id, role FROM users WHERE id = $1 FOR UPDATE',
            [id]
        );

        if (memberResult.rows.length === 0) {
            const error = new Error('Member not found');
            error.statusCode = 404;
            throw error;
        }

        const member = memberResult.rows[0];
        if (member.id === requestingUserId) {
            const error = new Error('You cannot delete your own account from Team Members');
            error.statusCode = 403;
            throw error;
        }

        if (member.role === 'admin') {
            const adminCountResult = await client.query(
                "SELECT COUNT(*) FROM users WHERE role = 'admin'"
            );
            if (parseInt(adminCountResult.rows[0].count, 10) <= 1) {
                const error = new Error('The last administrator cannot be deleted');
                error.statusCode = 400;
                throw error;
            }
        }

        await client.query('DELETE FROM users WHERE id = $1', [id]);
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    registerUser,
    loginUser,
    generateToken,
    getAllUsers,
    getCurrentUser,
    getUserByEmail,
    updateCurrentUser,
    changePassword,
    getAdminMembers,
    updateMemberRole,
    deleteMember,
    normalizeEmail,
};

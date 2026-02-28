const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Register a new user
 */
const registerUser = async ({ name, email, password }) => {
    // Check if user exists
    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
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
    // Find user
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
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

module.exports = {
    registerUser,
    loginUser,
    generateToken,
    getAllUsers,
};

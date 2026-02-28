const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const db = require('../config/database');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the database and attach to request
            const result = await db.query(
                'SELECT id, name, email, role FROM users WHERE id = $1',
                [decoded.id]
            );

            if (result.rows.length === 0) {
                const error = new Error('Not authorized, user not found');
                error.statusCode = 401;
                throw error;
            }

            req.user = result.rows[0];
            next();
        } catch (error) {
            console.error(error);
            const authError = new Error('Not authorized, token failed');
            authError.statusCode = 401;
            next(authError);
        }
    }

    if (!token) {
        const error = new Error('Not authorized, no token');
        error.statusCode = 401;
        next(error);
    }
});

// Role-based authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            const error = new Error(`User role ${req.user.role} is not authorized to access this route`);
            error.statusCode = 403;
            return next(error);
        }
        next();
    };
};

module.exports = { protect, authorize };

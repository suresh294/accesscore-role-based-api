const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const bcrypt = require('bcryptjs');
const db = require('../src/config/database');

const normalizeEmail = (email) => email.trim().toLowerCase();

const initializeAdmin = async () => {
    const configuredEmail = process.env.ADMIN_EMAIL;
    const configuredPassword = process.env.ADMIN_PASSWORD;

    if (!configuredEmail || !configuredPassword) {
        throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set before running init:admin');
    }

    const email = normalizeEmail(configuredEmail);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('ADMIN_EMAIL must be a valid email address');
    }
    if (configuredPassword.length < 6) {
        throw new Error('ADMIN_PASSWORD must be at least 6 characters long');
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        const existing = await client.query(
            'SELECT id, role FROM users WHERE LOWER(email) = $1 FOR UPDATE',
            [email]
        );

        if (existing.rows.length > 0) {
            await client.query(
                "UPDATE users SET role = 'admin', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
                [existing.rows[0].id]
            );
            await client.query('COMMIT');
            console.log('Administrator role ensured for the configured account. Existing password was not changed.');
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(configuredPassword, salt);
        await client.query(
            `INSERT INTO users (name, email, password, role)
             VALUES ($1, $2, $3, 'admin')`,
            ['Administrator', email, passwordHash]
        );

        await client.query('COMMIT');
        console.log('Default administrator account created successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

initializeAdmin()
    .catch((error) => {
        console.error(`Administrator initialization failed: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(() => db.pool.end());

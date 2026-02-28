// Migration: Add status column to tasks table
// Run this from the backend directory: node src/models/migrate-status.js

require('dotenv').config();
const db = require('./database');

async function migrate() {
    console.log('Running migration: Add status column to tasks...');
    try {
        await db.query(`
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ongoing'
        `);
        console.log('✅ Success: status column added (or already exists).');

        // Set existing tasks to ongoing status
        await db.query(`
            UPDATE tasks SET status = 'ongoing' WHERE status IS NULL
        `);
        console.log('✅ Existing tasks updated to status = ongoing');

        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();

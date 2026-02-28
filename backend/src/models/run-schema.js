const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function runSchema() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Connection config for default postgres db
    const config = {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: 'postgres', // Connect to default first
        password: String(process.env.DB_PASSWORD),
        port: process.env.DB_PORT,
        connectionTimeoutMillis: 5000,
    };

    const client = new Client(config);

    try {
        await client.connect();
        console.log('Connected to PostgreSQL (postgres database)');

        // Create database if it doesn't exist
        try {
            await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
            console.log(`Database ${process.env.DB_NAME} created`);
        } catch (err) {
            if (err.code === '42P04') {
                console.log(`Database ${process.env.DB_NAME} already exists`);
            } else {
                throw err;
            }
        }
        await client.end();

        // Connect to the new database
        const dbClient = new Client({
            ...config,
            database: process.env.DB_NAME,
        });

        await dbClient.connect();
        console.log(`Connected to ${process.env.DB_NAME}`);

        // Run the schema
        await dbClient.query(schemaSql);
        console.log('Schema executed successfully');

        await dbClient.end();
    } catch (err) {
        console.error('Error executing schema:', err.message);
        if (client) await client.end();
        process.exit(1);
    }
}

runSchema();

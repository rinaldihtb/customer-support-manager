require('dotenv').config({ quiet: true, });
const logger = require('./src/config/logger');
const app = require('./src/app');
const pool = require('./src/config/db');
const runMigration = require('./src/config/migration');

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        try {
            const res = await pool.query('SELECT NOW()');
        } catch (error) {
            throw new Error("Failed to connect to the database", err.message)
        }

        // Running the migration script
        try {
            await runMigration()
        } catch (error) {
            throw new Error(error)
        }

        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    } catch (err) {
        logger.error(err.message);
        process.exit(1);
    }
}

startServer()
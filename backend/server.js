require('dotenv').config({ quiet: true, });
const logger = require('./src/config/logger');
const app = require('./src/app');
const pool = require('./src/config/db');
const runMigration = require('./src/config/migration');
const runWorkers = require('./src/workers');

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        try {
            const res = await pool.query('SELECT NOW()');
        } catch (error) {
            logger.info("Failed to connect to the database", error)
            throw new Error(error)
        }

        // Running the migration script
        try {
            await runMigration()
        } catch (error) {
            throw new Error(error)
        }

        // Init the workers
        try {
            await runWorkers();
        } catch (error) {
            throw new Error(error)
        }


        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    } catch (error) {
        logger.error("Server failed to run", error);
    }
}

startServer()
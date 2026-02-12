const { runner } = require('node-pg-migrate');
const logger = require('./logger');

const runMigration = async () => {
    try {

        const run = await runner({
            databaseUrl: process.env.DATABASE_URL,
            migrationsTable: 'pgmigrations',
            dir: 'migrations',
            direction: "up",
            count: Infinity,
            verbose: true
        })

        logger.info('Migrations completed successfully:', run);
    } catch (error) {
        logger.error('Migration failed:', err);
        throw new Error("Migration failed")
    }

}

module.exports = runMigration
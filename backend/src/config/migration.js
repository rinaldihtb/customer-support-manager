const { runner } = require('node-pg-migrate');
const { client } = require('../config/db')
const pool = require('../config/db')
const logger = require('./logger');

const runMigration = async () => {
    try {

        const pgClient = await pool.connect();

        const run = await runner({
            dbClient: pgClient,
            migrationsTable: 'pgmigrations',
            dir: 'migrations',
            direction: "up",
            count: Infinity,
            verbose: true
        }).finally(() => {
            pgClient.release()
        })

        logger.info('Migrations completed successfully:', run);
    } catch (error) {
        logger.error('Migration failed:', error);
        throw new Error("Migration failed")
    }

}

module.exports = runMigration
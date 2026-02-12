const { Pool } = require('pg');
const logger = require('./logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.on('connect', (client) => {
  logger.info(`New client connected to database on port ${client.port}`);
});

// IMPORTANT: Always listen for errors on idle clients
pool.on('error', (err, client) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
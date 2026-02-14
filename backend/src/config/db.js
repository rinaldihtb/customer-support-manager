const { Pool } = require('pg');
const logger = require('./logger');

const pool = new Pool({
  host:process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT
});

pool.on('connect', (client) => {
  logger.info(`New client connected to database on port ${client.port}`);
});

// IMPORTANT: Always listen for errors on idle clients
pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  console.log(err)
  process.exit(-1);
});

module.exports = pool;
const { Redis } = require('ioredis');
const logger = require('./logger');

const redisConfig = {
    host: process.env.REDIS_HOST || 'redis-service',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
}

const redis = new Redis(redisConfig)

redis.on('connect', (res) => {
    logger.info("Redis is connected", res)
})

redis.on('error', (err) => {
    logger.error("Unable to start redis", err)
})

module.exports = redisConfig;
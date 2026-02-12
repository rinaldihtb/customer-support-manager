const logger = require('../config/logger');

module.exports = (req, res, next) => {
    const start = process.hrtime();

    res.on('finish', () => {
        const diff = process.hrtime(start);
        const durationMs = diff[0] * 1000 + diff[1] / 1e6;

        logger.info(
            `${req.method} ${req.originalUrl} - ${res.statusCode} - ${durationMs.toFixed(2)} ms`
        );
    });

    res.end()
};
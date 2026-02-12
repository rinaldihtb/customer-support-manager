const logger = require('../config/logger');
const cors = require('cors')


module.exports = cors({
    origin: process.env.APP_ORIGIN_URL,
    credentials: true
})
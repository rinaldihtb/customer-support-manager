const express = require('express');
const router = require('./routes');
const middlewares = require('./middlewares');

const app = express();

app.use(express.json());
app.use(middlewares.corsMiddleware);
app.use(router)
app.use(middlewares.performanceMiddleware)

module.exports = app;
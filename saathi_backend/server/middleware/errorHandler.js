const logger = require('../utils/logger');

function errorHandler(err, req, res, _next) {
    logger.error('server_error', req.sessionId || 'unknown', err);

    const status = err.status || 500;
    const message =
        process.env.NODE_ENV === 'production'
            ? 'Something went wrong'
            : err.message;

    res.status(status).json({
        error: true,
        message,
    });
}

module.exports = errorHandler;

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(el => el.message);
        return res.status(400).json({
            status: 'fail',
            message: `Validation Error: ${messages.join(', ')}`
        });
    }

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    });
};
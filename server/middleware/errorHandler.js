function errorHandler(err, req, res, next) {
  console.error('[Server Error]:', err.stack || err.message);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate value entered for a unique field' });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Resource not found with provided ID' });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
}

module.exports = errorHandler;

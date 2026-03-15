const errorHandler = (err, _req, res, _next) => {
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID',
    });
  }

  if (err.name === 'ValidationError') {
    const fieldErrors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));

    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: fieldErrors,
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Email already registered',
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;

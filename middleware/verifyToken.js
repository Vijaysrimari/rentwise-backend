const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization || '';

    if (!authHeader) {
      return res.status(401).json({
        message: 'No token provided. Please login.',
      });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : authHeader.trim();

    if (!token) {
      return res.status(401).json({
        message: 'Token is missing. Please login.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    return next();
  } catch (error) {
    console.error('Token verify error:', error.name);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please login again.' });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token is invalid. Please login again.' });
    }

    return res.status(401).json({ message: 'Authentication failed. Please login.' });
  }
};

module.exports = verifyToken;

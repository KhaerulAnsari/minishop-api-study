const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return sendError(res, 401, 'Access token required');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return sendError(res, 403, 'Invalid or expired token');
    }

    req.user = user; // Store user info in request
    next();
  });
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, 'Insufficient permissions');
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole
};
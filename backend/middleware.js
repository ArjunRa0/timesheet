/*
 * Filename: middleware.js
 * Description: Middleware functions for the PERN Timesheet application.
 */

const jwt = require('jsonwebtoken');

// JWT Secret - should be moved to environment variables in production
const JWT_SECRET = 'your_super_secret_jwt_key_that_is_long_and_random';

/**
 * Authentication Middleware
 * Verifies JWT token and adds user info to request object
 */
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

/**
 * Role-based Authorization Middleware
 * Checks if user has required role
 */
const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ msg: `Access denied. ${role}s only.` });
    }
    next();
  };
};

/**
 * Manager Authorization Middleware
 * Checks if user is a manager
 */
const requireManager = requireRole('manager');

module.exports = {
  authMiddleware,
  requireRole,
  requireManager,
  JWT_SECRET
}; 
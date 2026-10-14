const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'nexevent-super-secret-key-2026';

const mongoose = require('mongoose');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    if (!user || !user.id || !mongoose.Types.ObjectId.isValid(user.id)) {
      return res.status(401).json({ message: 'Session outdated. Please log in again.' });
    }
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin authorization required' });
  }
}

function requireVolunteerOrAdmin(req, res, next) {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'volunteer')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Volunteer or Admin authorization required' });
  }
}

module.exports = {
  authenticateToken,
  requireAdmin,
  requireVolunteerOrAdmin,
  JWT_SECRET
};

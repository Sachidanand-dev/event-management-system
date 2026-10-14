const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: trimmedEmail });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    const userObj = user.toJSON();
    delete userObj.password;

    res.json({
      message: 'Login successful',
      token,
      user: userObj
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, rollNo, department, year } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: trimmedEmail });

    if (existing) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = await User.create({
      name,
      email: trimmedEmail,
      password: hashedPassword,
      role: 'student',
      rollNo: rollNo || `CS-2026-${Math.floor(100 + Math.random() * 900)}`,
      department: department || 'Engineering & Technology',
      year: year || '1st Year'
    });

    const token = jwt.sign(
      { id: newUser._id.toString(), email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userObj = newUser.toJSON();
    delete userObj.password;

    res.status(201).json({
      message: 'Student account created successfully',
      token,
      user: userObj
    });
  } catch (error) {
    next(error);
  }
};

const mongoose = require('mongoose');

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    if (!req.user?.id || !mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(401).json({ message: 'Invalid or outdated session. Please log in again.' });
    }
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

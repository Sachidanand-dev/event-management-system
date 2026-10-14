const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Announcement = require('../models/Announcement');

const seedDefaultUsers = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@email.com' });
    if (!adminExists) {
      await User.create({
        name: 'Event Administrator',
        email: 'admin@email.com',
        password: bcrypt.hashSync('password@123', 10),
        role: 'admin',
        department: 'Campus Administration',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      });
      console.log('[Seeder] Default Admin created (admin@email.com)');
    }

    const volunteerExists = await User.findOne({ email: 'volunteer@college.edu' });
    if (!volunteerExists) {
      await User.create({
        name: 'Campus Volunteer',
        email: 'volunteer@college.edu',
        password: bcrypt.hashSync('volunteer@123', 10),
        role: 'volunteer',
        rollNo: 'VOL-2026-01',
        department: 'Student Support Operations',
        year: '2nd Year',
        duty: 'Gate QR Scanner & Attendee Check-in',
        shift: '09:00 AM - 02:00 PM',
        venue: 'Main Gate Entrance',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
      });
      console.log('[Seeder] Default Volunteer created (volunteer@college.edu)');
    }

    const studentExists = await User.findOne({ email: 'student@college.edu' });
    if (!studentExists) {
      await User.create({
        name: 'Student User',
        email: 'student@college.edu',
        password: bcrypt.hashSync('student@123', 10),
        role: 'student',
        rollNo: 'CS-2026-001',
        department: 'Computer Science & Engineering',
        year: '1st Year',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
      });
      console.log('[Seeder] Default Student created (student@college.edu)');
    }

    console.log('[Seeder] Default user accounts verified.');
  } catch (error) {
    console.error('[Seeder Error]:', error.message);
  }
};

module.exports = seedDefaultUsers;

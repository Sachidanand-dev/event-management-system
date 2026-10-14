const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');

// GET /api/admin/stats
exports.getAdminStats = async (req, res, next) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments({ status: { $ne: 'cancelled' } });
    const totalAttended = await Registration.countDocuments({ status: 'attended' });
    const totalStudents = await User.countDocuments({ role: 'student' });

    const events = await Event.find();
    const totalCapacity = events.reduce((sum, e) => sum + (e.capacity || 0), 0);

    const categoryCounts = {};
    events.forEach(e => {
      categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
    });

    const topEvents = [...events]
      .sort((a, b) => (b.registeredCount || 0) - (a.registeredCount || 0))
      .slice(0, 5)
      .map(e => ({
        id: e._id.toString(),
        title: e.title,
        category: e.category,
        registeredCount: e.registeredCount || 0,
        capacity: e.capacity || 1,
        percentage: Math.round(((e.registeredCount || 0) / (e.capacity || 1)) * 100)
      }));

    const recentRegistrations = await Registration.find()
      .sort({ registeredAt: -1 })
      .limit(6);

    res.json({
      totalEvents,
      totalRegistrations,
      totalAttended,
      totalCapacity,
      totalStudents,
      attendanceRate: totalRegistrations > 0 ? Math.round((totalAttended / totalRegistrations) * 100) : 0,
      occupancyRate: totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0,
      categoryCounts,
      topEvents,
      recentRegistrations
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/attendees
exports.getAttendees = async (req, res, next) => {
  try {
    const { eventId, search, status } = req.query;
    const conditions = [];

    if (eventId && eventId !== 'all') {
      conditions.push({ $or: [{ eventId: eventId }, { event: eventId }] });
    }

    if (status && status !== 'all') {
      conditions.push({ status: status.toLowerCase() });
    }

    if (search) {
      conditions.push({
        $or: [
          { userName: { $regex: search, $options: 'i' } },
          { userEmail: { $regex: search, $options: 'i' } },
          { userRollNo: { $regex: search, $options: 'i' } },
          { ticketId: { $regex: search, $options: 'i' } },
          { eventTitle: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const filter = conditions.length > 0 ? { $and: conditions } : {};

    const attendees = await Registration.find(filter).sort({ registeredAt: -1 });
    res.json({ attendees });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/check-in
exports.checkInTicket = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Ticket code or QR scan string is required' });
    }

    const cleanedCode = code.trim();

    const reg = await Registration.findOne({
      $or: [
        { ticketId: { $regex: `^${cleanedCode}$`, $options: 'i' } },
        { qrData: { $regex: cleanedCode, $options: 'i' } }
      ]
    });

    if (!reg) {
      return res.status(404).json({
        valid: false,
        message: 'Invalid Pass: Ticket code not recognized in the system.'
      });
    }

    if (reg.status === 'cancelled') {
      return res.status(400).json({
        valid: false,
        message: 'Rejected: This ticket was cancelled by the student.'
      });
    }

    if (reg.status === 'attended') {
      return res.status(200).json({
        valid: true,
        alreadyCheckedIn: true,
        message: 'Warning: Student is ALREADY checked in for this event.',
        registration: reg
      });
    }

    reg.status = 'attended';
    reg.checkedInAt = new Date();
    await reg.save();

    res.json({
      valid: true,
      alreadyCheckedIn: false,
      message: 'Check-In Approved! Welcome student to the venue.',
      registration: reg
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/attendees/:id/status
exports.updateAttendeeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const reg = await Registration.findById(req.params.id);

    if (!reg) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    reg.status = status;
    if (status === 'attended') {
      reg.checkedInAt = new Date();
    }
    await reg.save();

    res.json({ message: `Attendee status updated to ${status}`, registration: reg });
  } catch (error) {
    next(error);
  }
};

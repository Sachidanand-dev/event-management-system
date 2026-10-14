const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// GET /api/volunteer/duty
exports.getVolunteerDuty = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let assignedEvent = null;

    if (user?.assignedEvent) {
      assignedEvent = await Event.findById(user.assignedEvent);
    }

    if (!assignedEvent) {
      // Find the first upcoming event if none directly assigned
      assignedEvent = await Event.findOne().sort({ date: 1 });
    }

    let totalEventRegistrations = 0;
    let totalCheckedIn = 0;

    if (assignedEvent) {
      totalEventRegistrations = await Registration.countDocuments({
        $or: [{ eventId: assignedEvent._id.toString() }, { event: assignedEvent._id }],
        status: { $ne: 'cancelled' }
      });

      totalCheckedIn = await Registration.countDocuments({
        $or: [{ eventId: assignedEvent._id.toString() }, { event: assignedEvent._id }],
        status: 'attended'
      });
    }

    const recentCheckIns = await Registration.find({ status: 'attended' })
      .sort({ checkedInAt: -1, registeredAt: -1 })
      .limit(10);

    res.json({
      volunteer: {
        id: user?._id.toString(),
        name: user?.name,
        email: user?.email,
        role: user?.role,
        rollNo: user?.rollNo || 'N/A',
        department: user?.department || 'N/A',
        duty: user?.duty || 'Gate QR Scanner & Attendee Check-in',
        shift: user?.shift || '09:00 AM - 02:00 PM',
        venue: user?.venue || 'Main Gate Entrance'
      },
      assignedEvent: assignedEvent ? assignedEvent.toJSON() : null,
      stats: {
        totalEventRegistrations,
        totalCheckedIn,
        remaining: Math.max(0, totalEventRegistrations - totalCheckedIn),
        occupancyPercentage: totalEventRegistrations > 0 ? Math.round((totalCheckedIn / totalEventRegistrations) * 100) : 0
      },
      recentCheckIns
    });
  } catch (error) {
    next(error);
  }
};

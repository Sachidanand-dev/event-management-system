const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin, requireVolunteerOrAdmin } = require('../middleware/auth');

router.get('/stats', authenticateToken, requireAdmin, adminController.getAdminStats);
router.get('/attendees', authenticateToken, requireVolunteerOrAdmin, adminController.getAttendees);
router.post('/check-in', authenticateToken, requireVolunteerOrAdmin, adminController.checkInTicket);
router.patch('/attendees/:id/status', authenticateToken, requireAdmin, adminController.updateAttendeeStatus);

module.exports = router;

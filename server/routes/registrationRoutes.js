const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', authenticateToken, registrationController.registerForEvent);
router.get('/my', authenticateToken, registrationController.getMyRegistrations);
router.delete('/cancel/:id', authenticateToken, registrationController.cancelRegistration);

module.exports = router;

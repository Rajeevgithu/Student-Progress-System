const express = require('express');
const router = express.Router();
const codeforcesController = require('../controllers/codeforcesController');

// Update student's Codeforces data
router.post('/students/:studentId/update', codeforcesController.updateStudentData);

// Get student's contest history
router.get('/students/:studentId/contests', codeforcesController.getContestHistory);

// Get student's problem solving statistics
router.get('/students/:studentId/problems', codeforcesController.getProblemStats);

// Verify a Codeforces handle
router.get('/verify/:handle', codeforcesController.verifyHandle);

module.exports = router; 
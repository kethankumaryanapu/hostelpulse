const express = require('express');
const router = express.Router();
const foodController = require('./food.controller');
const { authenticate, requireRole } = require('../../middleware/auth');

// Public or Authenticated menu listing
router.get('/menu', foodController.getWeeklyMenu);

// Mess & Admin Management
router.post('/menu', authenticate, requireRole('admin', 'mess'), foodController.upsertMenuItem);
router.get('/cutoff', authenticate, foodController.getCutoffConfigHandler);
router.put('/cutoff', authenticate, requireRole('admin', 'mess'), foodController.updateCutoffConfig);

// Student Preferences
router.get('/preferences', authenticate, requireRole('student'), foodController.getStudentPreferences);
router.post('/preferences', authenticate, requireRole('student'), foodController.submitMealPreference);

// Kitchen & Warden Reporting
router.get('/report', authenticate, requireRole('admin', 'mess', 'warden'), foodController.getMealReport);

module.exports = router;

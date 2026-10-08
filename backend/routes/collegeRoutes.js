const express = require('express');
const router = express.Router();
const {
  getColleges,
  getCollegesWithEvents,
  getCollege,
  getCollegeEvents,
  createCollege,
  updateCollege,
  deleteCollege
} = require('../controllers/collegeController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getColleges);
router.get('/with-events', getCollegesWithEvents);
router.get('/:id', getCollege);
router.get('/:id/events', getCollegeEvents);

// Protected routes - Admin only
router.post('/', protect, authorize('admin'), createCollege);
router.put('/:id', protect, authorize('admin'), updateCollege);
router.delete('/:id', protect, authorize('admin'), deleteCollege);

module.exports = router;

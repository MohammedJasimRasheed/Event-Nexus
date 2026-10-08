const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  updateCourseStatus,
  getCoursesByCategory,
  getCoursesByIssuer,
  getCourseStats,
  updateExpiredCourses
} = require('../controllers/courseController');

const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/', optionalAuth, getCourses);
router.get('/category/:category', getCoursesByCategory);
router.get('/issuer/:issuer', getCoursesByIssuer);
router.get('/:id', getCourse);

// Admin only routes
router.use(protect); // All routes below require authentication
router.use(authorize('admin')); // All routes below require admin role

router.post('/', createCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);
router.patch('/:id/status', updateCourseStatus);
router.get('/admin/stats', getCourseStats);
router.post('/admin/update-expired', updateExpiredCourses);

module.exports = router;

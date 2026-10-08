const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleFavorite,
  getFavorites,
  getMyEvents,
  updateEventStatus,
  toggleFeatured,
  getCategories,
  getLocalEvents,
  cleanupExpiredEvents
} = require('../controllers/eventController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Validation rules
const eventValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').optional({ values: 'falsy' }).trim(),
  body('date.start').optional({ values: 'falsy' }).notEmpty().withMessage('Start date is required'),
  body('location.city').optional({ values: 'falsy' }).trim(),
  body('college.name').optional({ values: 'falsy' }).trim()
];

// Public routes
router.get('/', optionalAuth, getEvents);
router.get('/local', getLocalEvents);
router.get('/categories', getCategories);
router.get('/favorites', protect, getFavorites);
router.get('/my-events', protect, getMyEvents);
router.get('/:id', optionalAuth, getEvent);

// Protected routes
router.post('/', protect, eventValidation, createEvent);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);
router.post('/:id/favorite', protect, toggleFavorite);

// Admin routes
router.put('/:id/status', protect, authorize('admin'), updateEventStatus);
router.put('/:id/featured', protect, authorize('admin'), toggleFeatured);
router.post('/cleanup/expired', protect, authorize('admin'), cleanupExpiredEvents);

module.exports = router;

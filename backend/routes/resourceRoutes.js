const express = require('express');
const router = express.Router();
const {
  getResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  updateResourceStatus,
  getResourceStats
} = require('../controllers/resourceController');

const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/', optionalAuth, getResources);
router.get('/:id', getResource);

// Admin only routes
router.use(protect); // All routes below require authentication
router.use(authorize('admin')); // All routes below require admin role

router.post('/', createResource);
router.put('/:id', updateResource);
router.delete('/:id', deleteResource);
router.patch('/:id/status', updateResourceStatus);
router.get('/admin/stats', getResourceStats);

module.exports = router;

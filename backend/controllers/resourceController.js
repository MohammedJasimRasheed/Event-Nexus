const Resource = require('../models/supabase/Resource');

// @desc    Get all resources
// @route   GET /api/resources
// @access  Public
exports.getResources = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (category) filters.category = category;
    if (search) filters.search = search;

    // Allow admins to see all resources
    if (req.user && req.user.role === 'admin') {
      filters.includeAll = true;
    }

    const resources = await Resource.findAll(filters);

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching resources',
      error: error.message
    });
  }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Public
exports.getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching resource',
      error: error.message
    });
  }
};

// @desc    Create new resource
// @route   POST /api/resources
// @access  Private/Admin
exports.createResource = async (req, res) => {
  try {
    // Add the admin user ID as creator
    const resourceData = {
      ...req.body,
      created_by: req.user.id
    };

    // Validate required fields
    const { name, description, category, apply_url } = resourceData;
    
    if (!name || !description || !category || !apply_url) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, description, category, apply_url'
      });
    }

    const resource = await Resource.create(resourceData);

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: resource
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating resource',
      error: error.message
    });
  }
};

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private/Admin
exports.updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    const updatedResource = await Resource.update(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Resource updated successfully',
      data: updatedResource
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating resource',
      error: error.message
    });
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private/Admin
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    await Resource.delete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting resource',
      error: error.message
    });
  }
};

// @desc    Update resource status
// @route   PATCH /api/resources/:id/status
// @access  Private/Admin
exports.updateResourceStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status (active or inactive)'
      });
    }

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    const updatedResource = await Resource.updateStatus(req.params.id, status);

    res.status(200).json({
      success: true,
      message: 'Resource status updated successfully',
      data: updatedResource
    });
  } catch (error) {
    console.error('Error updating resource status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating resource status',
      error: error.message
    });
  }
};

// @desc    Get resource statistics
// @route   GET /api/resources/admin/stats
// @access  Private/Admin
exports.getResourceStats = async (req, res) => {
  try {
    const stats = await Resource.getStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching resource stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching resource statistics',
      error: error.message
    });
  }
};

const College = require('../models/supabase/College');

// @desc    Get all colleges
// @route   GET /api/colleges
// @access  Public
exports.getColleges = async (req, res) => {
  try {
    const filters = {
      status: req.query.status || 'active',
      city: req.query.city,
      search: req.query.search,
      sortBy: req.query.sort || 'name',
      sortOrder: req.query.order || 'asc'
    };

    const colleges = await College.findAll(filters);

    res.status(200).json({
      success: true,
      count: colleges.length,
      data: colleges
    });
  } catch (error) {
    console.error('Error in getColleges:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get colleges with event counts
// @route   GET /api/colleges/with-events
// @access  Public
exports.getCollegesWithEvents = async (req, res) => {
  try {
    const colleges = await College.getCollegesWithEventCounts();

    res.status(200).json({
      success: true,
      count: colleges.length,
      data: colleges
    });
  } catch (error) {
    console.error('Error in getCollegesWithEvents:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single college
// @route   GET /api/colleges/:id
// @access  Public
exports.getCollege = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found'
      });
    }

    res.status(200).json({
      success: true,
      data: college
    });
  } catch (error) {
    console.error('Error in getCollege:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get college events
// @route   GET /api/colleges/:id/events
// @access  Public
exports.getCollegeEvents = async (req, res) => {
  try {
    const filters = {
      status: req.user?.role === 'admin' ? req.query.status : 'approved',
      category: req.query.category,
      eventType: req.query.eventType,
      upcoming: req.query.upcoming,
      sortBy: req.query.sort || 'date',
      sortOrder: req.query.order || 'asc'
    };

    const events = await College.getCollegeEvents(req.params.id, filters);

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Error in getCollegeEvents:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new college
// @route   POST /api/colleges
// @access  Private/Admin
exports.createCollege = async (req, res) => {
  try {
    const {
      name,
      short_name,
      logo,
      description,
      location,
      city,
      state,
      website,
      contact_email,
      contact_phone,
      established_year,
      affiliated_to
    } = req.body;

    // Validate required fields
    if (!name || !short_name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and short name'
      });
    }

    const collegeData = {
      name,
      short_name,
      logo,
      description,
      location,
      city,
      state,
      website,
      contact_email,
      contact_phone,
      established_year,
      affiliated_to,
      status: 'active'
    };

    const college = await College.create(collegeData);

    res.status(201).json({
      success: true,
      data: college
    });
  } catch (error) {
    console.error('Error in createCollege:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update college
// @route   PUT /api/colleges/:id
// @access  Private/Admin
exports.updateCollege = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found'
      });
    }

    const updatedCollege = await College.update(req.params.id, req.body);

    res.status(200).json({
      success: true,
      data: updatedCollege
    });
  } catch (error) {
    console.error('Error in updateCollege:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete college
// @route   DELETE /api/colleges/:id
// @access  Private/Admin
exports.deleteCollege = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found'
      });
    }

    await College.delete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'College deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteCollege:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

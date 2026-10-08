const Course = require('../models/supabase/Course');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
  try {
    const { status, category, issuer, level, search } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (category) filters.category = category;
    if (issuer) filters.issuer = issuer;
    if (level) filters.level = level;
    if (search) filters.search = search;

    // Allow admins to see all courses
    if (req.user && req.user.role === 'admin') {
      filters.includeAll = true;
    }

    const courses = await Course.findAll(filters);

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
};

exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message
    });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const courseData = {
      ...req.body,
      created_by: req.user.id
    };

    const course = await Course.create(courseData);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message
    });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const updatedCourse = await Course.update(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message
    });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    await Course.delete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message
    });
  }
};

exports.updateCourseStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['active', 'expired', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, expired, or inactive'
      });
    }

    const course = await Course.updateStatus(req.params.id, status);

    res.status(200).json({
      success: true,
      message: 'Course status updated successfully',
      data: course
    });
  } catch (error) {
    console.error('Error updating course status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course status',
      error: error.message
    });
  }
};

exports.getCoursesByCategory = async (req, res) => {
  try {
    const courses = await Course.findByCategory(req.params.category);

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching courses by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
};

exports.getCoursesByIssuer = async (req, res) => {
  try {
    const courses = await Course.findByIssuer(req.params.issuer);

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching courses by issuer:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
};

exports.getCourseStats = async (req, res) => {
  try {
    const stats = await Course.getStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching course stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

exports.updateExpiredCourses = async (req, res) => {
  try {
    const updatedCourses = await Course.updateExpiredCourses();

    res.status(200).json({
      success: true,
      message: `${updatedCourses.length} courses marked as expired`,
      data: updatedCourses
    });
  } catch (error) {
    console.error('Error updating expired courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating expired courses',
      error: error.message
    });
  }
};

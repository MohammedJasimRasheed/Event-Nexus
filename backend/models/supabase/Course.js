const { supabase } = require('../../config/db');

class Course {
  // Create a new course (admin only)
  static async create(courseData) {
    const {
      title,
      description,
      issuer,
      instructor,
      category,
      level = 'Beginner',
      duration,
      original_price = 0,
      discount_percentage = 100,
      coupon_code,
      course_url,
      image_url,
      rating,
      enrolled_count,
      language = 'English',
      expiry_date,
      status = 'active',
      created_by
    } = courseData;

    const { data, error } = await supabase
      .from('courses')
      .insert([
        {
          title,
          description,
          issuer,
          instructor,
          category,
          level,
          duration,
          original_price,
          discount_percentage,
          coupon_code,
          course_url,
          image_url,
          rating,
          enrolled_count,
          language,
          expiry_date,
          status,
          created_by
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get all courses with filters
  static async findAll(filters = {}) {
    let query = supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.issuer) {
      query = query.eq('issuer', filters.issuer);
    }

    if (filters.level) {
      query = query.eq('level', filters.level);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Only show active courses by default (unless explicitly filtered)
    if (!filters.status && !filters.includeAll) {
      query = query.eq('status', 'active');
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  // Get course by ID
  static async findById(id) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Update course (admin only)
  static async update(id, courseData) {
    const { data, error } = await supabase
      .from('courses')
      .update(courseData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete course (admin only)
  static async delete(id) {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }

  // Update course status
  static async updateStatus(id, status) {
    const { data, error } = await supabase
      .from('courses')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get courses by issuer
  static async findByIssuer(issuer) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('issuer', issuer)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get courses by category
  static async findByCategory(category) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('category', category)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get expired courses
  static async findExpired() {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .lt('expiry_date', new Date().toISOString())
      .eq('status', 'active');

    if (error) throw error;
    return data || [];
  }

  // Auto-update expired courses
  static async updateExpiredCourses() {
    const { data, error } = await supabase
      .from('courses')
      .update({ status: 'expired' })
      .lt('expiry_date', new Date().toISOString())
      .eq('status', 'active')
      .select();

    if (error) throw error;
    return data || [];
  }

  // Get course statistics
  static async getStats() {
    const { data, error } = await supabase
      .from('courses')
      .select('status, category');

    if (error) throw error;

    const stats = {
      total: data.length,
      active: data.filter(c => c.status === 'active').length,
      expired: data.filter(c => c.status === 'expired').length,
      inactive: data.filter(c => c.status === 'inactive').length,
      byCategory: {}
    };

    data.forEach(course => {
      if (!stats.byCategory[course.category]) {
        stats.byCategory[course.category] = 0;
      }
      stats.byCategory[course.category]++;
    });

    return stats;
  }
}

module.exports = Course;

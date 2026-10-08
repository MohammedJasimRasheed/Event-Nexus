const { supabase } = require('../../config/db');

class College {
  // Get all colleges
  static async findAll(filters = {}) {
    try {
      let query = supabase
        .from('colleges')
        .select('*');

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.city) {
        query = query.eq('city', filters.city);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,short_name.ilike.%${filters.search}%`);
      }

      // Sorting
      const sortBy = filters.sortBy || 'name';
      const sortOrder = filters.sortOrder || 'asc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error in College.findAll:', error);
      throw error;
    }
  }

  // Get college by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error in College.findById:', error);
      throw error;
    }
  }

  // Get college by slug or short name
  static async findBySlug(slug) {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .or(`short_name.ilike.${slug},name.ilike.${slug}`)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error in College.findBySlug:', error);
      throw error;
    }
  }

  // Create new college (admin only)
  static async create(collegeData) {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .insert([collegeData])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error in College.create:', error);
      throw error;
    }
  }

  // Update college (admin only)
  static async update(id, collegeData) {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .update(collegeData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error in College.update:', error);
      throw error;
    }
  }

  // Delete college (admin only)
  static async delete(id) {
    try {
      const { error } = await supabase
        .from('colleges')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error in College.delete:', error);
      throw error;
    }
  }

  // Get events for a specific college
  static async getCollegeEvents(collegeId, filters = {}) {
    try {
      let query = supabase
        .from('events')
        .select('*')
        .eq('college_id', collegeId)
        .eq('is_internal_event', true);

      // Apply status filter (default to approved for public access)
      const status = filters.status || 'approved';
      query = query.eq('status', status);

      // Apply additional filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.eventType) {
        query = query.eq('event_type', filters.eventType);
      }

      // Only upcoming events by default
      if (filters.upcoming !== 'false') {
        query = query.gte('date', new Date().toISOString());
      }

      // Sorting
      const sortBy = filters.sortBy || 'date';
      const sortOrder = filters.sortOrder || 'asc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error in College.getCollegeEvents:', error);
      throw error;
    }
  }

  // Get colleges with event counts
  static async getCollegesWithEventCounts() {
    try {
      // First get all active colleges
      const { data: colleges, error: collegesError } = await supabase
        .from('colleges')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });

      if (collegesError) throw collegesError;

      // For each college, get the count of approved upcoming events
      const collegesWithCounts = await Promise.all(
        colleges.map(async (college) => {
          const { count, error: countError } = await supabase
            .from('events')
            .select('*', { count: 'exact', head: true })
            .eq('college_id', college.id)
            .eq('is_internal_event', true)
            .eq('status', 'approved')
            .gte('date', new Date().toISOString());

          if (countError) {
            console.error(`Error counting events for college ${college.id}:`, countError);
            return { ...college, event_count: 0 };
          }

          return { ...college, event_count: count || 0 };
        })
      );

      return collegesWithCounts;
    } catch (error) {
      console.error('Error in College.getCollegesWithEventCounts:', error);
      throw error;
    }
  }
}

module.exports = College;

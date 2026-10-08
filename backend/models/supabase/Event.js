const { supabase } = require('../../config/db');

class Event {
  // Create a new event
  static async create(eventData) {
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Find event by ID
  static async findById(id) {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        organizer:users(id, name, email, college)
      `)
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  // Find all events with filters
  static async findAll(filters = {}) {
    let query = supabase
      .from('events')
      .select(`
        *,
        organizer:users(id, name, email, college),
        favorites:favorites(user_id)
      `, { count: 'exact' });

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.eventType) {
      query = query.eq('event_type', filters.eventType);
    }

    if (filters.city) {
      query = query.eq('city', filters.city);
    }

    if (filters.college) {
      query = query.ilike('college', `%${filters.college}%`);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters.upcoming) {
      query = query.gte('date', new Date().toISOString());
    }

    if (filters.featured === 'true' || filters.featured === true) {
      query = query.eq('featured', true);
    }

    // Sorting - prioritize events with images, then apply user sorting
    // Events with images get priority by ordering by "image is not null" first
    query = query.order('image', { ascending: false, nullsFirst: false });
    
    // Then apply user's preferred sort (default to created_at desc)
    const sortField = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder === 'asc' ? { ascending: true } : { ascending: false };
    query = query.order(sortField, sortOrder);

    // Pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 50;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      events: data,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }

  // Update event
  static async update(id, updateData) {
    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete event
  static async delete(id) {
    const { error } = await supabase.from('events').delete().eq('id', id);

    if (error) throw error;
    return true;
  }

  // Get events by organizer
  static async findByOrganizer(organizerId, filters = {}) {
    let query = supabase
      .from('events')
      .select('*', { count: 'exact' })
      .eq('organizer_id', organizerId);

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    query = query.order('created_at', { ascending: false });

    // Pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      events: data,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }

  // Get event categories with counts
  static async getCategories() {
    const { data, error } = await supabase
      .from('events')
      .select('category')
      .eq('status', 'approved');

    if (error) throw error;

    // Count occurrences
    const categoryCounts = data.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categoryCounts).map(([category, count]) => ({
      _id: category,
      count,
    }));
  }

  // Increment view count
  static async incrementViews(id) {
    const { data, error } = await supabase.rpc('increment_event_views', {
      event_id: id,
    });

    if (error) {
      // If RPC doesn't exist, fallback to manual increment
      const event = await this.findById(id);
      if (event) {
        await supabase
          .from('events')
          .update({ views: (event.views || 0) + 1 })
          .eq('id', id);
      }
    }

    return true;
  }

  // Get favorites count for an event
  static async getFavoritesCount(eventId) {
    const { count, error } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);

    if (error) return 0;
    return count;
  }

  // Find local events by city (upcoming technical/community events)
  static async findLocalEvents(city, limit = 20) {
    const now = new Date().toISOString();
    
    let query = supabase
      .from('events')
      .select('*', { count: 'exact' })
      .eq('status', 'approved')
      .gte('date', now)
      .order('date', { ascending: true })
      .limit(limit);

    // Filter by city (case-insensitive match)
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    // Prioritize events with images
    query = query.order('image', { ascending: false, nullsFirst: false });

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      events: data || [],
      total: count || 0,
    };
  }

  // Delete expired events
  static async deleteExpired() {
    const now = new Date().toISOString();
    
    // Fetch expired events
    // Case 1: Events with end_date that has passed
    const { data: expiredWithEndDate, error: error1 } = await supabase
      .from('events')
      .select('*')
      .not('end_date', 'is', null)
      .lt('end_date', now);
    
    // Case 2: Events without end_date where the event date has passed
    const { data: expiredWithoutEndDate, error: error2 } = await supabase
      .from('events')
      .select('*')
      .is('end_date', null)
      .lt('date', now);

    if (error1 || error2) {
      console.error('Error fetching expired events:', error1 || error2);
      throw error1 || error2;
    }

    // Combine both sets of expired events
    const allExpiredEvents = [...(expiredWithEndDate || []), ...(expiredWithoutEndDate || [])];

    if (allExpiredEvents.length === 0) {
      return {
        success: true,
        deletedCount: 0,
        deletedEvents: []
      };
    }

    // Extract IDs to delete
    const idsToDelete = allExpiredEvents.map(event => event.id);

    // Delete the expired events
    const { data: deletedData, error: deleteError } = await supabase
      .from('events')
      .delete()
      .in('id', idsToDelete)
      .select();

    if (deleteError) {
      console.error('Error deleting expired events:', deleteError);
      throw deleteError;
    }
    
    return {
      success: true,
      deletedCount: deletedData ? deletedData.length : 0,
      deletedEvents: deletedData || []
    };
  }
}

module.exports = Event;

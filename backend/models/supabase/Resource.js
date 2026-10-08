const { supabase } = require('../../config/db');

class Resource {
  // Create a new resource (admin only)
  static async create(resourceData) {
    const {
      name,
      description,
      value,
      category,
      tags,
      apply_url,
      icon,
      created_by
    } = resourceData;

    const { data, error } = await supabase
      .from('resources')
      .insert([
        {
          name,
          description,
          value,
          category,
          tags,
          apply_url,
          icon,
          created_by,
          status: 'active'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get all resources with filters
  static async findAll(filters = {}) {
    let query = supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Only show active resources by default
    if (!filters.status && !filters.includeAll) {
      query = query.eq('status', 'active');
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  // Get resource by ID
  static async findById(id) {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Update resource
  static async update(id, updateData) {
    const { data, error } = await supabase
      .from('resources')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete resource
  static async delete(id) {
    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // Update resource status (admin only)
  static async updateStatus(id, status) {
    const { data, error } = await supabase
      .from('resources')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get resource statistics (admin)
  static async getStats() {
    const { data: allResources, error: fetchError } = await supabase
      .from('resources')
      .select('status, category');

    if (fetchError) throw fetchError;

    const statusCounts = {
      total: allResources.length,
      active: allResources.filter(r => r.status === 'active').length,
      inactive: allResources.filter(r => r.status === 'inactive').length
    };

    const categoryCounts = {
      'free-stuff': allResources.filter(r => r.category === 'free-stuff' && r.status === 'active').length,
      'fellowships': allResources.filter(r => r.category === 'fellowships' && r.status === 'active').length
    };

    return {
      statusCounts,
      categoryCounts
    };
  }
}

module.exports = Resource;

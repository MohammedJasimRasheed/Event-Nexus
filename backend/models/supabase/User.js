const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../../config/db');

class User {
  // Create a new user
  static async create(userData) {
    const { name, email, password, role = 'user', college, phone } = userData;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name,
          email,
          password: hashedPassword,
          role,
          college,
          phone,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Find user by email
  static async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') return null;
    return data;
  }

  // Find user by ID
  static async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  // Update user
  static async update(id, updateData) {
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update password
  static async updatePassword(id, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const { data, error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Compare password
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Generate JWT token
  static getSignedJwtToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  }

  // Get user favorites
  static async getFavorites(userId) {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        event_id,
        events (*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data.map((fav) => fav.events);
  }

  // Add favorite
  static async addFavorite(userId, eventId) {
    const { data, error } = await supabase
      .from('favorites')
      .insert([{ user_id: userId, event_id: eventId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Remove favorite
  static async removeFavorite(userId, eventId) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('event_id', eventId);

    if (error) throw error;
    return true;
  }

  // Check if event is favorited
  static async isFavorited(userId, eventId) {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .single();

    return data !== null;
  }

  // Get user notifications
  static async getNotifications(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}

module.exports = User;

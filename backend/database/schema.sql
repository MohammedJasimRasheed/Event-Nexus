-- College Event Aggregator Database Schema for Supabase/PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'organizer', 'admin')),
  college VARCHAR(255),
  phone VARCHAR(20),
  avatar TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Events Table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('online', 'offline', 'hybrid')),
  date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  venue TEXT,
  city VARCHAR(100),
  college VARCHAR(255),
  organizer VARCHAR(255),
  organizer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  image TEXT,
  registration_link TEXT,
  registration_fee DECIMAL(10,2) DEFAULT 0,
  registration_deadline TIMESTAMP,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'cancelled', 'completed')),
  tags TEXT[],
  requirements TEXT[],
  prizes JSONB,
  location_coordinates POINT,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Favorites Table (Many-to-Many relationship)
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_city ON events(city);
CREATE INDEX idx_events_organizer_id ON events(organizer_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_event_id ON favorites(event_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Full-text search indexes
CREATE INDEX idx_events_title_search ON events USING gin(to_tsvector('english', title));
CREATE INDEX idx_events_description_search ON events USING gin(to_tsvector('english', description));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Everyone can view approved events
CREATE POLICY "Anyone can view approved events" ON events
  FOR SELECT USING (status = 'approved' OR organizer_id = auth.uid());

-- Users can create events
CREATE POLICY "Authenticated users can create events" ON events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own events
CREATE POLICY "Users can update own events" ON events
  FOR UPDATE USING (organizer_id = auth.uid());

-- Users can delete their own events
CREATE POLICY "Users can delete own events" ON events
  FOR DELETE USING (organizer_id = auth.uid());

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can add favorites" ON favorites
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove favorites" ON favorites
  FOR DELETE USING (user_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

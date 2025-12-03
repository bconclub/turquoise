-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- REGIONS TABLE
-- ============================================
CREATE TABLE regions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  hero_image VARCHAR(500),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DESTINATIONS TABLE (Countries)
-- ============================================
CREATE TABLE destinations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  country_code CHAR(2),
  description TEXT,
  highlights TEXT[],
  hero_image VARCHAR(500),
  thumbnail VARCHAR(500),
  best_months INT[],                    -- Array of months (1-12)
  visa_info TEXT,
  currency VARCHAR(50),
  language VARCHAR(100),
  timezone VARCHAR(50),
  package_count INT DEFAULT 0,
  starting_price DECIMAL(10,2),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  seo_title VARCHAR(200),
  seo_description VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRAVEL STYLES TABLE
-- ============================================
CREATE TABLE travel_styles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  display_order INT DEFAULT 0
);

-- Insert default travel styles
INSERT INTO travel_styles (slug, name, icon, display_order) VALUES
  ('honeymoon', 'Honeymoon', 'heart', 1),
  ('family', 'Family', 'users', 2),
  ('adventure', 'Adventure', 'mountain', 3),
  ('cultural', 'Cultural', 'landmark', 4),
  ('wildlife', 'Wildlife', 'binoculars', 5),
  ('relaxation', 'Relaxation', 'palmtree', 6),
  ('pilgrimage', 'Pilgrimage', 'church', 7),
  ('luxury', 'Luxury', 'gem', 8);

-- ============================================
-- PACKAGES TABLE
-- ============================================
CREATE TABLE packages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
  slug VARCHAR(200) UNIQUE NOT NULL,
  title VARCHAR(300) NOT NULL,
  subtitle VARCHAR(500),
  description TEXT,
  
  -- Duration
  duration_nights INT NOT NULL,
  duration_days INT NOT NULL,
  
  -- Pricing
  starting_price DECIMAL(10,2),
  price_currency VARCHAR(3) DEFAULT 'INR',
  price_type VARCHAR(20) DEFAULT 'per-person',  -- per-person, per-couple, per-group
  
  -- Categorization
  travel_style_ids UUID[],              -- Multiple styles possible
  difficulty_level VARCHAR(20),         -- easy, moderate, challenging
  group_size_min INT,
  group_size_max INT,
  
  -- Best time to visit
  best_months INT[],
  
  -- Highlights
  highlights TEXT[],
  cities_covered TEXT[],
  
  -- Media
  hero_image VARCHAR(500),
  thumbnail VARCHAR(500),
  gallery_images TEXT[],
  
  -- Includes/Excludes
  includes TEXT[],
  excludes TEXT[],
  
  -- Optional activities
  optional_activities JSONB,            -- [{name, price, description}]
  
  -- Important info
  important_notes TEXT[],
  
  -- SEO
  seo_title VARCHAR(200),
  seo_description VARCHAR(500),
  seo_keywords TEXT[],
  
  -- Status
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  view_count INT DEFAULT 0,
  inquiry_count INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ITINERARY DAYS TABLE
-- ============================================
CREATE TABLE itinerary_days (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT NOT NULL,
  highlights TEXT[],
  meals TEXT[],                         -- ['breakfast', 'lunch', 'dinner']
  overnight_location VARCHAR(200),
  optional_activities JSONB,            -- [{name, price, description}]
  display_order INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(package_id, day_number)
);

-- ============================================
-- INQUIRIES TABLE (Lead Management)
-- ============================================
CREATE TABLE inquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Inquiry type
  inquiry_type VARCHAR(50) NOT NULL,    -- package, custom, general
  package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
  
  -- Contact info
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL,
  phone VARCHAR(20),
  whatsapp VARCHAR(20),
  
  -- Trip details
  travel_dates_flexible BOOLEAN DEFAULT true,
  preferred_start_date DATE,
  preferred_end_date DATE,
  travelers_adults INT DEFAULT 2,
  travelers_children INT DEFAULT 0,
  travelers_infants INT DEFAULT 0,
  
  -- Preferences (for custom trips)
  destinations_interested TEXT[],
  travel_styles TEXT[],
  budget_range VARCHAR(50),
  duration_preference VARCHAR(50),
  special_requirements TEXT,
  
  -- Message
  message TEXT,
  
  -- Tracking
  source_page VARCHAR(500),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  referrer VARCHAR(500),
  
  -- Status
  status VARCHAR(50) DEFAULT 'new',     -- new, contacted, qualified, proposal_sent, converted, closed
  assigned_to VARCHAR(200),
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  contacted_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ
);

-- ============================================
-- TESTIMONIALS TABLE
-- ============================================
CREATE TABLE testimonials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  location VARCHAR(200),
  avatar VARCHAR(500),
  destination VARCHAR(200),
  package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  travel_date DATE,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_destinations_region ON destinations(region_id);
CREATE INDEX idx_destinations_featured ON destinations(is_featured) WHERE is_active = true;
CREATE INDEX idx_packages_destination ON packages(destination_id);
CREATE INDEX idx_packages_featured ON packages(is_featured) WHERE is_active = true;
CREATE INDEX idx_packages_price ON packages(starting_price);
CREATE INDEX idx_packages_duration ON packages(duration_nights);
CREATE INDEX idx_itinerary_package ON itinerary_days(package_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created ON inquiries(created_at DESC);

-- Full-text search index
CREATE INDEX idx_packages_search ON packages 
  USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || array_to_string(highlights, ' ')));

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update package count on destinations
CREATE OR REPLACE FUNCTION update_destination_package_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE destinations 
    SET package_count = package_count + 1,
        updated_at = NOW()
    WHERE id = NEW.destination_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE destinations 
    SET package_count = package_count - 1,
        updated_at = NOW()
    WHERE id = OLD.destination_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_destination_count
AFTER INSERT OR DELETE ON packages
FOR EACH ROW EXECUTE FUNCTION update_destination_package_count();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_packages_updated
BEFORE UPDATE ON packages
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_destinations_updated
BEFORE UPDATE ON destinations
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_inquiries_updated
BEFORE UPDATE ON inquiries
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Public read access for content
CREATE POLICY "Public read access" ON regions FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON destinations FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON packages FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON itinerary_days FOR SELECT USING (true);
CREATE POLICY "Public read access" ON testimonials FOR SELECT USING (is_active = true);

-- Anyone can create inquiries
CREATE POLICY "Anyone can create inquiries" ON inquiries FOR INSERT WITH CHECK (true);

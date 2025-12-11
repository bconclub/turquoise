# Turquoise Holidays - Brand Truth

## Our Essence

Turquoise Holidays represents refined luxury travel that transforms journeys into unforgettable experiences. We believe that travel is not just about destinations—it's about creating moments that resonate, stories that inspire, and memories that last a lifetime.

## Our Promise

**Craft and Flexibility**: Every itinerary is meticulously designed around your unique preferences, ensuring that your journey reflects your personal style and desires.

**24/7 Travel Insights**: Our expert team provides guidance whenever you need it, ensuring seamless experiences from planning to return.

**Unmatched Experiences**: We provide access to exclusive destinations and activities that go beyond the ordinary, creating extraordinary moments.

**Best Value Guarantee**: Premium quality experiences at competitive prices, ensuring you receive exceptional value for your investment.

## Our Approach

### The Turquoise Way

1. **Discover** - Share your travel dreams with us
2. **Design** - We craft your perfect itinerary
3. **Refine** - Customize every detail to perfection
4. **Experience** - Enjoy your journey with confidence

## Our Values

- **Authenticity**: We believe in genuine experiences that connect you with the heart of each destination
- **Excellence**: Every detail matters, from the first consultation to your return home
- **Personalization**: Your journey is uniquely yours, tailored to your preferences
- **Trust**: We build lasting relationships through transparency and reliability

## Our Mission

To inspire and enable extraordinary travel experiences that enrich lives, broaden perspectives, and create lasting memories through expertly curated journeys to the world's most captivating destinations.

## Our Vision

To be the most trusted and sought-after luxury travel partner, recognized for our commitment to excellence, innovation, and the transformative power of travel.

---

# Turquoise Holidays - Itinerary Template Format

## For Database Schema & Cursor Development

---

## Package JSON Template

```json
{
  "_template": "TURQUOISE_PACKAGE_V1",
  
  "package": {
    "slug": "jordan-classic-tour-7d6n",
    "title": "Jordan Classic Tour",
    "subtitle": "Petra, Dead Sea & Wadi Rum Adventure",
    
    "destination": {
      "primary": "Jordan",
      "country": "Jordan",
      "region": "Middle East",
      "cities": ["Amman", "Petra", "Wadi Rum", "Aqaba", "Dead Sea"]
    },
    
    "duration": {
      "nights": 6,
      "days": 7,
      "display": "7 Days / 6 Nights"
    },
    
    "stayBreakdown": [
      { "location": "Amman", "nights": 4 },
      { "location": "Petra", "nights": 2 }
    ],
    
    "categories": {
      "styles": ["cultural", "adventure", "historical"],
      "themes": ["desert", "ancient-ruins", "unesco", "film-location"],
      "difficulty": "easy",
      "pace": "moderate"
    },
    
    "highlights": [
      "Petra - One of the Seven Wonders of the World",
      "Float in the Dead Sea - lowest point on Earth",
      "Wadi Rum desert safari by 4x4",
      "Ancient Roman city of Jerash",
      "Mount Nebo - tomb of Moses"
    ],
    
    "pricing": {
      "startingFrom": null,
      "currency": "USD",
      "priceType": "per-person",
      "note": "Price on request"
    },
    
    "transport": {
      "arrival": "Queen Alia International Airport, Amman",
      "departure": "Queen Alia International Airport, Amman",
      "internal": ["Private AC Vehicle", "4x4 Jeep (Wadi Rum)"]
    },
    
    "bestTime": {
      "months": [3, 4, 5, 9, 10, 11],
      "note": "Best visited March-May and September-November"
    },
    
    "media": {
      "hero": "/images/packages/jordan/hero.jpg",
      "thumb": "/images/packages/jordan/thumb.jpg",
      "gallery": []
    },
    
    "seo": {
      "title": "Jordan Tour Package 7 Days | Petra, Dead Sea, Wadi Rum",
      "description": "Explore Jordan in 7 days - Visit Petra, float in Dead Sea, desert safari in Wadi Rum. Complete Jordan experience.",
      "keywords": ["jordan tour", "petra tour", "dead sea", "wadi rum", "amman"]
    },
    
    "status": {
      "isActive": true,
      "isFeatured": false
    }
  },
  
  "itinerary": [
    {
      "day": 1,
      "title": "Arrival in Amman",
      "route": {
        "from": "Queen Alia Airport",
        "to": "Amman",
        "distance": "40 KM",
        "mode": "drive"
      },
      "description": "Arrival to Amman, capital of the Hashemite Kingdom of Jordan. Visa formalities and proceed to the hotel.",
      "activities": [
        { "name": "Airport Arrival & Visa Formalities", "type": "transfer", "highlight": false },
        { "name": "Hotel Check-in", "type": "leisure", "highlight": false }
      ],
      "meals": ["dinner"],
      "overnight": "Amman",
      "notes": []
    },
    {
      "day": 2,
      "title": "Amman City Tour & Jerash",
      "route": {
        "from": "Amman",
        "to": "Amman",
        "distance": "125 KM",
        "mode": "drive"
      },
      "description": "Panoramic tour of Amman (Philadelphia) including Citadel viewpoint, Roman Theater, traditional markets. Then visit Jerash, one of the best-preserved Roman cities featuring the Great Colonnade Street, Arc of Triumph, Oval Plaza, and Temples of Zeus and Artemis.",
      "activities": [
        { "name": "Citadel Viewpoint", "type": "sightseeing", "highlight": true },
        { "name": "Roman Theater", "type": "cultural", "highlight": true },
        { "name": "Traditional Markets", "type": "shopping", "highlight": false },
        { "name": "Jerash Roman Ruins", "type": "cultural", "highlight": true, "description": "Best-preserved Roman city" }
      ],
      "meals": ["breakfast", "dinner"],
      "overnight": "Amman",
      "notes": []
    },
    {
      "day": 3,
      "title": "Dead Sea Experience",
      "route": {
        "from": "Amman",
        "to": "Amman",
        "distance": "110 KM",
        "mode": "drive"
      },
      "description": "Descend to the lowest place on earth - the Dead Sea. Free time to swim in its therapeutic waters, an unforgettable experience!",
      "activities": [
        { "name": "Dead Sea Float Experience", "type": "adventure", "highlight": true, "description": "World's first natural spa - lowest point on Earth" }
      ],
      "meals": ["breakfast", "dinner"],
      "overnight": "Amman",
      "notes": ["Entrance to Dead Sea Tourist Beach included", "Towels not included"]
    },
    {
      "day": 4,
      "title": "Madaba, Mount Nebo & Petra",
      "route": {
        "from": "Amman",
        "to": "Petra",
        "distance": "360 KM",
        "mode": "drive"
      },
      "description": "Visit Madaba 'City of Mosaics' and the 571 BC Holy Land map at Saint George Church. Continue to Mount Nebo (tomb of Moses) with magnificent Jordan Valley views. Drive via Kings' Highway to Karak/Shobak Crusader fortress. Arrive Petra.",
      "activities": [
        { "name": "Madaba - City of Mosaics", "type": "cultural", "highlight": true },
        { "name": "Saint George Church Mosaic Map", "type": "cultural", "highlight": true },
        { "name": "Mount Nebo", "type": "cultural", "highlight": true, "description": "Tomb of Moses with Jordan Valley views" },
        { "name": "Karak/Shobak Crusader Fortress", "type": "cultural", "highlight": false }
      ],
      "meals": ["breakfast", "dinner"],
      "overnight": "Petra",
      "notes": []
    },
    {
      "day": 5,
      "title": "Petra Full Day Exploration",
      "route": null,
      "description": "Full day exploring the Nabatean red rose city of Petra, one of the Seven Wonders of the World. Enter through the 1.2km Siq to reach the breathtaking Treasury (El Khazneh). Visit the Theatre, Byzantine Church, and Royal Tombs.",
      "activities": [
        { "name": "The Siq (Canyon Entrance)", "type": "sightseeing", "highlight": true, "description": "1.2km dramatic canyon entrance" },
        { "name": "The Treasury (El Khazneh)", "type": "cultural", "highlight": true, "description": "Iconic facade from Indiana Jones" },
        { "name": "Roman Theatre", "type": "cultural", "highlight": false },
        { "name": "Royal Tombs", "type": "cultural", "highlight": true },
        { "name": "Byzantine Church", "type": "cultural", "highlight": false }
      ],
      "meals": ["breakfast", "dinner"],
      "overnight": "Petra",
      "optionals": [
        { "name": "Petra by Night", "price": "USD 25-35", "description": "Candlelit walk to Treasury (Mon, Wed, Thu)", "note": "With/without transfers" },
        { "name": "Monastery Climb", "price": "Free", "description": "800 steps to Ad-Deir monastery (self-guided)" }
      ],
      "notes": ["Comfortable walking shoes essential", "Full day of walking - 8-10km typical"]
    },
    {
      "day": 6,
      "title": "Wadi Rum Desert & Aqaba",
      "route": {
        "from": "Petra",
        "to": "Amman",
        "distance": "545 KM",
        "mode": "drive"
      },
      "description": "Transfer to Wadi Rum desert, filming location for Lawrence of Arabia and The Martian. 2-hour 4x4 desert safari through red sand and granite mountains. Continue to Aqaba for beach time, then drive to Amman.",
      "activities": [
        { "name": "Wadi Rum 4x4 Desert Safari", "type": "adventure", "highlight": true, "description": "2-hour jeep tour through red desert", "duration": "2 hours" },
        { "name": "Aqaba Beach & Free Time", "type": "beach", "highlight": false }
      ],
      "meals": ["breakfast", "dinner"],
      "overnight": "Amman",
      "notes": ["Beach entrance in Aqaba not included"]
    },
    {
      "day": 7,
      "title": "Departure",
      "route": {
        "from": "Amman",
        "to": "Queen Alia Airport",
        "distance": "40 KM",
        "mode": "drive"
      },
      "description": "Breakfast at hotel. Transfer to Queen Alia International Airport for departure.",
      "activities": [
        { "name": "Airport Transfer", "type": "transfer", "highlight": false }
      ],
      "meals": ["breakfast"],
      "overnight": null,
      "notes": []
    }
  ],
  
  "includes": [
    "Meet and assist with representative",
    "Round trip airport transfers",
    "Transportation as per itinerary",
    "4 nights Amman + 2 nights Petra accommodation",
    "Meals: Daily breakfast and dinner",
    "Entrance fees to all sites as per itinerary",
    "2-hour 4x4 jeep safari in Wadi Rum",
    "Towels at Dead Sea",
    "English/French speaking local guide",
    "Visa exemption service"
  ],
  
  "excludes": [
    "Visa fees (~USD 60 pp) and exit fees (~USD 45 pp)",
    "Lunches",
    "Beverages and water",
    "Tips and porterage",
    "Personal expenses",
    "Travel insurance",
    "Beach entrance at Aqaba",
    "Optional Petra by Night"
  ],
  
  "importantNotes": [
    "Minimum 2 travelers required",
    "Single travelers accepted with supplement (USD 70)",
    "Petra by Night available Mon, Wed, Thu (USD 25-35 extra)",
    "Sheikh Hussein border transfer supplement: USD 75 pp"
  ]
}
```

---

## Simplified Database Schema (Supabase)

### Core Tables

```sql
-- =============================================
-- DESTINATIONS
-- =============================================
CREATE TABLE destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  country VARCHAR(100),
  region VARCHAR(100),                    -- "Middle East", "Southeast Asia", "Europe"
  description TEXT,
  hero_image VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PACKAGES (Main Table)
-- =============================================
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(200) UNIQUE NOT NULL,
  
  -- Basic Info
  title VARCHAR(300) NOT NULL,
  subtitle VARCHAR(500),
  description TEXT,
  
  -- Destination (Foreign Key)
  destination_id UUID REFERENCES destinations(id),
  cities_covered TEXT[],                  -- ["Amman", "Petra", "Wadi Rum"]
  
  -- Duration
  nights INT NOT NULL,
  days INT NOT NULL,
  duration_display VARCHAR(50),           -- "7 Days / 6 Nights"
  
  -- Stay Breakdown (JSONB)
  stay_breakdown JSONB,                   -- [{"location": "Amman", "nights": 4}]
  
  -- Categories
  travel_styles TEXT[],                   -- ["cultural", "adventure"]
  themes TEXT[],                          -- ["desert", "unesco"]
  difficulty VARCHAR(20) DEFAULT 'easy',  -- easy, moderate, challenging
  pace VARCHAR(20) DEFAULT 'moderate',    -- relaxed, moderate, fast
  
  -- Highlights
  highlights TEXT[],
  
  -- Pricing
  starting_price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'INR',
  price_note VARCHAR(200),
  
  -- Transport
  arrival_point VARCHAR(300),
  departure_point VARCHAR(300),
  internal_transport TEXT[],
  
  -- Best Time
  best_months INT[],                      -- [3,4,5,9,10,11]
  season_note VARCHAR(300),
  
  -- Inclusions/Exclusions
  includes TEXT[],
  excludes TEXT[],
  important_notes TEXT[],
  
  -- Media
  hero_image VARCHAR(500),
  thumbnail VARCHAR(500),
  gallery TEXT[],
  
  -- SEO
  seo_title VARCHAR(200),
  seo_description VARCHAR(500),
  seo_keywords TEXT[],
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  view_count INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ITINERARY DAYS
-- =============================================
CREATE TABLE itinerary_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
  
  day_number INT NOT NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  
  -- Route (nullable for non-travel days)
  route_from VARCHAR(200),
  route_to VARCHAR(200),
  route_distance VARCHAR(50),
  route_mode VARCHAR(50),                 -- "drive", "flight", "ferry", "train"
  
  -- Activities (JSONB array)
  activities JSONB,                       -- [{name, type, highlight, description}]
  
  -- Meals
  meals TEXT[],                           -- ["breakfast", "dinner"]
  
  -- Overnight
  overnight VARCHAR(200),                 -- null for departure day
  
  -- Optional Activities (JSONB)
  optionals JSONB,                        -- [{name, price, description}]
  
  -- Notes
  notes TEXT[],
  
  UNIQUE(package_id, day_number)
);

-- =============================================
-- INQUIRIES (Lead Capture)
-- =============================================
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Type
  inquiry_type VARCHAR(50) NOT NULL,      -- "package", "custom", "general"
  package_id UUID REFERENCES packages(id),
  
  -- Contact
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL,
  phone VARCHAR(30),
  
  -- Trip Details
  travel_date DATE,
  flexibility VARCHAR(50),                -- "exact", "flexible", "anytime"
  adults INT DEFAULT 2,
  children INT DEFAULT 0,
  
  -- Preferences
  budget_range VARCHAR(50),
  message TEXT,
  
  -- Tracking
  source_url VARCHAR(500),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  
  -- Status
  status VARCHAR(50) DEFAULT 'new',       -- new, contacted, qualified, converted, closed
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_packages_destination ON packages(destination_id);
CREATE INDEX idx_packages_active ON packages(is_active) WHERE is_active = true;
CREATE INDEX idx_packages_featured ON packages(is_featured) WHERE is_featured = true;
CREATE INDEX idx_itinerary_package ON itinerary_days(package_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);

-- Full-text search
CREATE INDEX idx_packages_search ON packages 
USING GIN (to_tsvector('english', 
  title || ' ' || COALESCE(subtitle, '') || ' ' || array_to_string(cities_covered, ' ')
));
```

---

## TypeScript Types (For Cursor)

```typescript
// types/package.ts

export interface Package {
  id: string;
  slug: string;
  
  // Basic
  title: string;
  subtitle?: string;
  description?: string;
  
  // Destination
  destinationId: string;
  citiesCovered: string[];
  
  // Duration
  nights: number;
  days: number;
  durationDisplay: string;
  
  // Stay
  stayBreakdown: StayLocation[];
  
  // Categories
  travelStyles: TravelStyle[];
  themes: string[];
  difficulty: 'easy' | 'moderate' | 'challenging';
  pace: 'relaxed' | 'moderate' | 'fast';
  
  // Content
  highlights: string[];
  includes: string[];
  excludes: string[];
  importantNotes: string[];
  
  // Pricing
  startingPrice?: number;
  currency: string;
  priceNote?: string;
  
  // Transport
  arrivalPoint: string;
  departurePoint: string;
  internalTransport: string[];
  
  // Timing
  bestMonths: number[];
  seasonNote?: string;
  
  // Media
  heroImage?: string;
  thumbnail?: string;
  gallery: string[];
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
  
  // Status
  isActive: boolean;
  isFeatured: boolean;
  
  // Relations
  itinerary: ItineraryDay[];
  destination: Destination;
}

export interface StayLocation {
  location: string;
  nights: number;
}

export interface ItineraryDay {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  
  route?: Route;
  activities: Activity[];
  meals: Meal[];
  overnight?: string;
  optionals: OptionalActivity[];
  notes: string[];
}

export interface Route {
  from: string;
  to: string;
  distance?: string;
  mode: 'drive' | 'flight' | 'ferry' | 'train' | 'walk';
}

export interface Activity {
  name: string;
  type: ActivityType;
  highlight: boolean;
  description?: string;
  duration?: string;
}

export interface OptionalActivity {
  name: string;
  price: string;
  description?: string;
  note?: string;
}

export type TravelStyle = 
  | 'family' | 'honeymoon' | 'adventure' | 'cultural' 
  | 'wildlife' | 'relaxation' | 'pilgrimage' | 'luxury' 
  | 'budget' | 'beach' | 'mountain' | 'historical';

export type ActivityType = 
  | 'sightseeing' | 'cultural' | 'adventure' | 'beach' 
  | 'shopping' | 'leisure' | 'transfer' | 'dining' 
  | 'show' | 'trek' | 'wildlife';

export type Meal = 'breakfast' | 'lunch' | 'dinner';

export interface Destination {
  id: string;
  slug: string;
  name: string;
  country: string;
  region: string;
}

export interface Inquiry {
  id: string;
  inquiryType: 'package' | 'custom' | 'general';
  packageId?: string;
  
  name: string;
  email: string;
  phone?: string;
  
  travelDate?: Date;
  flexibility: 'exact' | 'flexible' | 'anytime';
  adults: number;
  children: number;
  
  budgetRange?: string;
  message?: string;
  
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed';
  createdAt: Date;
}
```

---

## Cursor Project Structure

```
turquoise-holidays/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                      # Home
│   │   ├── globals.css
│   │   │
│   │   ├── destinations/
│   │   │   ├── page.tsx                  # All destinations
│   │   │   └── [slug]/
│   │   │       └── page.tsx              # Destination detail
│   │   │
│   │   ├── packages/
│   │   │   ├── page.tsx                  # All packages + filters
│   │   │   └── [slug]/
│   │   │       └── page.tsx              # Package detail
│   │   │
│   │   ├── customize/
│   │   │   └── page.tsx                  # Custom trip wizard
│   │   │
│   │   ├── about/
│   │   │   └── page.tsx
│   │   │
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   │
│   │   └── api/
│   │       ├── packages/
│   │       │   └── route.ts              # GET packages
│   │       ├── inquiries/
│   │       │   └── route.ts              # POST inquiry
│   │       └── search/
│   │           └── route.ts              # Search endpoint
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MobileNav.tsx
│   │   │
│   │   ├── home/
│   │   │   ├── Hero.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── FeaturedDestinations.tsx
│   │   │   ├── PopularPackages.tsx
│   │   │   └── WhyTurquoise.tsx
│   │   │
│   │   ├── packages/
│   │   │   ├── PackageCard.tsx
│   │   │   ├── PackageGrid.tsx
│   │   │   ├── PackageHero.tsx
│   │   │   ├── ItineraryTimeline.tsx     # Day-by-day accordion
│   │   │   ├── StayBreakdown.tsx         # Visual nights distribution
│   │   │   ├── IncludesExcludes.tsx
│   │   │   └── PackageHighlights.tsx
│   │   │
│   │   ├── search/
│   │   │   ├── FilterSidebar.tsx
│   │   │   ├── FilterChips.tsx
│   │   │   └── SortDropdown.tsx
│   │   │
│   │   ├── forms/
│   │   │   ├── InquiryForm.tsx
│   │   │   ├── InquirySidebar.tsx        # Sticky sidebar form
│   │   │   └── CustomTripWizard.tsx
│   │   │
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── Accordion.tsx
│   │       ├── Badge.tsx
│   │       ├── Card.tsx
│   │       └── Modal.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                 # Supabase client
│   │   │   └── queries.ts                # DB queries
│   │   │
│   │   └── utils/
│   │       ├── formatters.ts             # Price, date formatting
│   │       └── helpers.ts
│   │
│   ├── hooks/
│   │   ├── usePackages.ts
│   │   ├── useDestinations.ts
│   │   └── useInquiry.ts
│   │
│   └── types/
│       ├── package.ts                    # Types above
│       └── index.ts
│
├── public/
│   └── images/
│
├── supabase/
│   └── migrations/
│       └── 001_initial.sql               # Schema above
│
├── .env.local
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Filter Options (Constants)

```typescript
// lib/constants/filters.ts

export const TRAVEL_STYLES = [
  { value: 'family', label: 'Family', icon: 'Users' },
  { value: 'honeymoon', label: 'Honeymoon', icon: 'Heart' },
  { value: 'adventure', label: 'Adventure', icon: 'Mountain' },
  { value: 'cultural', label: 'Cultural', icon: 'Landmark' },
  { value: 'wildlife', label: 'Wildlife', icon: 'Binoculars' },
  { value: 'relaxation', label: 'Relaxation', icon: 'Palmtree' },
  { value: 'beach', label: 'Beach', icon: 'Waves' },
  { value: 'pilgrimage', label: 'Pilgrimage', icon: 'Church' },
  { value: 'luxury', label: 'Luxury', icon: 'Gem' },
  { value: 'historical', label: 'Historical', icon: 'Scroll' },
];

export const DURATION_OPTIONS = [
  { value: '1-3', label: '1-3 Days', min: 1, max: 3 },
  { value: '4-6', label: '4-6 Days', min: 4, max: 6 },
  { value: '7-10', label: '7-10 Days', min: 7, max: 10 },
  { value: '11+', label: '11+ Days', min: 11, max: 99 },
];

export const BUDGET_OPTIONS = [
  { value: 'budget', label: 'Budget', description: 'Under ₹50,000' },
  { value: 'mid', label: 'Mid-Range', description: '₹50,000 - ₹1,00,000' },
  { value: 'premium', label: 'Premium', description: '₹1,00,000 - ₹2,00,000' },
  { value: 'luxury', label: 'Luxury', description: 'Above ₹2,00,000' },
];

export const REGIONS = [
  { value: 'india', label: 'India' },
  { value: 'southeast-asia', label: 'Southeast Asia' },
  { value: 'middle-east', label: 'Middle East' },
  { value: 'europe', label: 'Europe' },
  { value: 'africa', label: 'Africa' },
  { value: 'central-asia', label: 'Central Asia' },
  { value: 'east-asia', label: 'East Asia' },
  { value: 'oceania', label: 'Australia & Oceania' },
  { value: 'americas', label: 'Americas' },
];

export const MONTHS = [
  { value: 1, label: 'January', short: 'Jan' },
  { value: 2, label: 'February', short: 'Feb' },
  { value: 3, label: 'March', short: 'Mar' },
  { value: 4, label: 'April', short: 'Apr' },
  { value: 5, label: 'May', short: 'May' },
  { value: 6, label: 'June', short: 'Jun' },
  { value: 7, label: 'July', short: 'Jul' },
  { value: 8, label: 'August', short: 'Aug' },
  { value: 9, label: 'September', short: 'Sep' },
  { value: 10, label: 'October', short: 'Oct' },
  { value: 11, label: 'November', short: 'Nov' },
  { value: 12, label: 'December', short: 'Dec' },
];
```

---

## Sample Supabase Queries

```typescript
// lib/supabase/queries.ts

import { supabase } from './client';
import type { Package, Destination, Inquiry } from '@/types';

// Get all packages with filters
export async function getPackages(filters?: {
  destination?: string;
  region?: string;
  minDays?: number;
  maxDays?: number;
  styles?: string[];
  search?: string;
}) {
  let query = supabase
    .from('packages')
    .select(`
      *,
      destination:destinations(id, slug, name, country, region)
    `)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (filters?.destination) {
    query = query.eq('destination.slug', filters.destination);
  }
  
  if (filters?.minDays) {
    query = query.gte('days', filters.minDays);
  }
  
  if (filters?.maxDays) {
    query = query.lte('days', filters.maxDays);
  }
  
  if (filters?.styles?.length) {
    query = query.overlaps('travel_styles', filters.styles);
  }
  
  if (filters?.search) {
    query = query.textSearch('title', filters.search);
  }

  const { data, error } = await query;
  return { data, error };
}

// Get single package with itinerary
export async function getPackageBySlug(slug: string) {
  const { data: pkg, error: pkgError } = await supabase
    .from('packages')
    .select(`
      *,
      destination:destinations(*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (pkgError || !pkg) return { data: null, error: pkgError };

  const { data: itinerary, error: itinError } = await supabase
    .from('itinerary_days')
    .select('*')
    .eq('package_id', pkg.id)
    .order('day_number');

  return {
    data: { ...pkg, itinerary: itinerary || [] },
    error: itinError
  };
}

// Get featured packages
export async function getFeaturedPackages(limit = 6) {
  const { data, error } = await supabase
    .from('packages')
    .select(`
      id, slug, title, subtitle, nights, days, duration_display,
      hero_image, thumbnail, highlights, travel_styles,
      destination:destinations(name, country)
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(limit);

  return { data, error };
}

// Get all destinations
export async function getDestinations() {
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .eq('is_active', true)
    .order('name');

  return { data, error };
}

// Submit inquiry
export async function submitInquiry(inquiry: Omit<Inquiry, 'id' | 'status' | 'createdAt'>) {
  const { data, error } = await supabase
    .from('inquiries')
    .insert(inquiry)
    .select()
    .single();

  return { data, error };
}

// Increment view count
export async function incrementViewCount(packageId: string) {
  await supabase.rpc('increment_view_count', { package_id: packageId });
}
```

---

## Quick Reference: Activity Types

| Type | Icon | Use For |
|------|------|---------|
| `sightseeing` | Camera | General sightseeing, viewpoints |
| `cultural` | Landmark | Museums, temples, historical sites |
| `adventure` | Mountain | Desert safari, trekking, water sports |
| `beach` | Waves | Beach visits, swimming |
| `shopping` | ShoppingBag | Markets, malls |
| `leisure` | Coffee | Free time, relaxation |
| `transfer` | Car | Airport transfers, inter-city drives |
| `dining` | Utensils | Special meals, food experiences |
| `show` | Star | Light shows, performances |
| `trek` | Footprints | Hiking, walking tours |
| `wildlife` | Binoculars | Safari, zoo, nature reserves |

---

## Cursor Prompt

Copy this to start building in Cursor:

```
Create a Next.js 14 (App Router) travel website for Turquoise Holidays with:

Tech Stack:
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Supabase for database
- Framer Motion for animations

Key Features:
1. Package listing with filters (destination, duration, style, budget)
2. Package detail page with day-by-day itinerary accordion
3. Sticky inquiry sidebar form
4. Responsive design (mobile-first)
5. SEO optimized

Brand:
- Primary: Turquoise (#0D9488)
- Accent: Gold (#D4A853)
- Typography: Playfair Display (headings), DM Sans (body)

Database: Supabase with tables for packages, itinerary_days, destinations, inquiries

See attached schema and types for data structure.
```

---

# Turquoise MD - Current Implementation Status

**Last Updated:** January 2025

**Deployment:** VPS deployment infrastructure configured with GitHub Actions, PM2, and Nginx

**Recent Updates:**
- ✅ SEO metadata implemented for all pages (static and dynamic)
- ✅ Webhook integration for enquiry form submissions
- ✅ Thank you page with package display, redirect flow, and Suspense wrapper
- ✅ Google Analytics tracking (gtag.js) with beforeInteractive strategy
- ✅ Google Analytics event tracking on thank you page (Package Enquiry Lead)
- ✅ Search modal Google Analytics events (search_modal_open, search, select_content)
- ✅ 404 error handling with automatic redirect to homepage
- ✅ Fixed NaN errors in package detail page
- ✅ Fixed modal-open class issues preventing page scrolling
- ✅ Fixed mobile keyboard auto-open on search modal
- ✅ Updated footer with correct social media links and Google Maps location
- ✅ Updated contact page with new physical address
- ✅ System status page with build info and service health monitoring
- ✅ Build info system with git commit message as version identifier
- ✅ EnquiryModal mobile optimization (reduced header height, compact inputs)
- ✅ EnquiryModal form field mapping to match exact database schema
- ✅ EnquiryModal date flexibility dropdown (Flexible/Exact Date only)

## Tech Stack (Implemented)

- **Framework:** Next.js 16.0.6 (App Router)
- **React:** 19.2.0
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (PostgreSQL)
- **Animations:** Framer Motion 12.23.25
- **Icons:** Lucide React, HugeIcons
- **Forms:** React Hook Form 7.67.0 + Zod 4.1.13
- **Fonts:** Playfair Display, DM Sans, El Messiri (via next/font)
- **AI Integration:** Anthropic Claude API (for document parsing & content generation)

## Project Structure (Current)

```
turquoise/
├── src/
│   ├── app/
│   │   ├── layout.js                    ✅ Root layout with fonts & theme
│   │   ├── page.js                      ✅ Homepage with hero video & sections
│   │   ├── globals.css                   ✅ Tailwind + custom styles
│   │   ├── icon.webp                    ✅ Custom favicon
│   │   │
│   │   ├── packages/
│   │   │   ├── layout.js                ✅ SEO metadata for packages listing
│   │   │   ├── page.jsx                 ✅ Packages listing with filters
│   │   │   └── [slug]/
│   │   │       ├── page.jsx             ✅ Package detail with generateMetadata
│   │   │       └── PackageDetailClient.jsx ✅ Client component for package detail
│   │   │
│   │   ├── destinations/
│   │   │   ├── layout.js                ✅ SEO metadata for destinations listing
│   │   │   ├── page.jsx                 ✅ Destinations listing by region
│   │   │   └── [slug]/page.jsx          ✅ Destination detail with packages
│   │   │
│   │   ├── thank-you/
│   │   │   ├── page.jsx                 ✅ Thank you page (server component with Suspense)
│   │   │   └── ThankYouContent.jsx      ✅ Thank you content (client component)
│   │   │
│   │   ├── status/
│   │   │   └── page.jsx                 ✅ System status page with health monitoring
│   │   │
│   │   ├── not-found.js                 ✅ 404 redirect to homepage
│   │   │
│   │   ├── admin/
│   │   │   ├── layout.jsx               ✅ Admin layout with auth
│   │   │   ├── login/page.jsx           ✅ Admin login page
│   │   │   ├── dashboard/page.jsx      ✅ Admin dashboard
│   │   │   ├── import/page.jsx         ✅ Package import interface
│   │   │   ├── packages/
│   │   │   │   ├── page.jsx            ✅ Packages management
│   │   │   │   └── [id]/page.jsx       ✅ Package editor
│   │   │   └── destinations/
│   │   │       ├── page.jsx            ✅ Destinations management
│   │   │       └── [id]/page.jsx       ✅ Destination editor
│   │   │
│   │   └── api/
│   │       ├── parse-document/route.js  ✅ AI document parser (Word docs)
│   │       ├── generate-content/route.js ✅ AI content generator
│   │       ├── import/route.js          ✅ Package import API
│   │       └── health/route.js          ✅ Health check API with build info
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.js                ✅ Fixed header with navigation
│   │   │   └── Footer.js                ✅ Footer with social links
│   │   │
│   │   ├── search/
│   │   │   ├── SearchBar.js             ✅ Homepage search bar
│   │   │   └── SearchModal.js           ✅ Full-screen search modal (mobile keyboard fix)
│   │   │
│   │   ├── admin/
│   │   │   └── ImagePicker.jsx          ✅ Image picker component
│   │   │
│   │   ├── tracking/
│   │   │   └── TrackingScripts.js       ✅ Google Analytics & tracking scripts
│   │   │
│   │   └── EnquiryModal.jsx             ✅ Inquiry form modal with webhook integration
│   │
│   └── lib/
│       ├── supabase/
│       │   ├── client.js                ✅ Client-side Supabase client
│       │   ├── server.js                ✅ Server-side Supabase client
│       │   └── queries.js               ✅ Complete query library
│       │
│       ├── parser/
│       │   └── claudeParser.js           ✅ Claude AI document parser
│       │
│       └── buildInfo.js                  ✅ Build information (build time, git commit)
│
├── public/
│   ├── Header.mp4                       ✅ Hero video background
│   ├── Home.jpg                         ✅ Hero fallback image
│   ├── TQ Dark.webp                     ✅ Logo (dark)
│   └── TQ-Full.webp                     ✅ Full logo
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql       ✅ Complete database schema
│
├── scripts/
│   ├── seed-packages.js                ✅ Package seeding script
│   ├── check-packages.js                ✅ Package validation script
│   └── import-packages.js              ✅ Package import utility
│
├── .github/
│   └── workflows/
│       └── deploy.yml                  ✅ GitHub Actions deployment workflow
│
├── .env.local                           ✅ Environment variables
├── package.json                         ✅ Dependencies configured
├── next.config.mjs                      ✅ Next.js configuration
├── tailwind.config.js                   ✅ Tailwind configuration
├── ecosystem.config.js                  ✅ PM2 process manager configuration
├── deploy.sh                            ✅ VPS deployment script
├── nginx.conf.example                   ✅ Nginx reverse proxy config template
├── DEPLOYMENT.md                        ✅ Complete VPS deployment guide
└── turquoise.md                         ✅ This documentation file
```

## ✅ Implemented Features

### Public Pages

#### Homepage (`src/app/page.js`)
- ✅ Hero section with video background (`/Header.mp4`) with fallback image
- ✅ Search bar component with popular destination filters
- ✅ Exotic destinations showcase section (Switzerland, Thailand, Turkey, Maldives)
- ✅ Explore by experience section (Vibrant Cities, Historic Travel, Desert Safari)
- ✅ Why Turquoise Holidays section with 4 key benefits
- ✅ Your Memories gallery section (8-image grid)
- ✅ The Turquoise Way process section (4-step journey)
- ✅ CTA section with "Start Planning" button

#### Packages Pages
- ✅ **Packages Listing** (`src/app/packages/page.jsx`)
  - SEO metadata: "Travel Packages | Turquoise Holidays"
  - Grid layout with package cards
  - Filter by travel type (All, International, Domestic)
  - Package count display
  - Activity type icons with scrollable chips
  - "Enquire Now" and "View Details" buttons
  - Responsive grid (1-4 columns)
  - Framer Motion animations

- ✅ **Package Detail** (`src/app/packages/[slug]/page.jsx`)
  - Server component with `generateMetadata` for SEO
  - Dynamic page title: "{package.title} | Turquoise Holidays"
  - Hero section with package image
  - Package overview with HTML description
  - Highlights list with checkmarks
  - Day-by-day itinerary accordion
    - Expandable day cards
    - Route information (from/to/distance)
    - Activities with icons (JSONB parsing support)
    - Meals display
    - Notes section
  - Sidebar with package details card
  - Includes/Excludes sections
  - Enquiry modal integration
  - Back navigation
  - Fixed NaN errors in numeric fields
  - Fixed modal-open class preventing scrolling
  - Proper error handling and data validation

#### Destinations Pages
- ✅ **Destinations Listing** (`src/app/destinations/page.jsx`)
  - SEO metadata: "Destinations | Turquoise Holidays"
  - Grouped by region with region filters
  - Sticky filter bar
  - Destination cards with images
  - Package count per destination
  - Responsive grid layout
  - Framer Motion animations
  - Image fallback system

- ✅ **Destination Detail** (`src/app/destinations/[slug]/page.jsx`)
  - Dynamic SEO metadata: "{destination.name} | Turquoise Holidays"
  - Hero section with destination image
  - HTML description support
  - Packages grid for the destination
  - Package cards with pricing and duration
  - Back navigation

### Components

#### Search Functionality
- ✅ **SearchBar Component** (`src/components/search/SearchBar.js`)
  - Search input with search button
  - Popular destinations filter chips (fetched from Supabase)
  - Clicking destination opens modal with that filter applied
  - Responsive design

- ✅ **SearchModal Component** (`src/components/search/SearchModal.js`)
  - Full-screen modal with backdrop blur
  - Search input in header
  - Filter section (destination multi-select, duration)
  - Package grid display with images
  - Real-time filtering by search term, destination, and duration
  - Fetches packages from Supabase
  - Responsive (mobile & desktop)
  - Mobile keyboard doesn't auto-open (user must tap input)
  - Prevents screen space loss on mobile devices
  - Google Analytics event tracking:
    - `search_modal_open` on modal open
    - `search` event on search queries (with 500ms debounce)
    - `select_content` event on package clicks

#### Layout Components
- ✅ **Header** (`src/components/layout/Header.js`)
  - Fixed header with backdrop blur effect
  - Logo (TQ Dark.webp)
  - Desktop navigation menu
  - Mobile hamburger menu
  - Dynamic styling based on page context
  - Links: Home, Destinations, Packages, About, Contact

- ✅ **Footer** (`src/components/layout/Footer.js`)
  - Logo and social media links
    - Instagram: https://www.instagram.com/turquoiseholidaysindia/
    - Facebook: https://www.facebook.com/TurquoiseHolidaysIndia/
    - YouTube: https://www.youtube.com/@TurquoiseHolidays
    - LinkedIn: https://in.linkedin.com/company/turquoise-holidays-india
  - Google Maps embed with correct location
  - Contact information with updated address
  - Quick links navigation
  - Copyright notice

#### Inquiry System
- ✅ **EnquiryModal Component** (`src/components/EnquiryModal.jsx`)
  - Modal form with backdrop
  - Pre-fills package/destination data
  - Form fields: Name, Email, Phone, City
  - Destination multi-select (if no package)
  - Travel date picker
  - Adults/Children count
  - Date flexibility dropdown (Flexible/Exact Date)
  - Terms acceptance checkbox
  - Supabase submission to `inquiries` table (exact schema mapping)
  - UTM parameter tracking (utm_source, utm_medium, utm_campaign)
  - Webhook POST to `https://build.goproxe.com/webhook/turquoise-website-enquiry`
  - Redirects to `/thank-you` page with query params after success
  - Success confirmation
  - Error handling (webhook failures don't block form success)
  - Modal closes before redirect
  - Mobile-optimized layout (reduced header height, compact inputs)
  - Form fields mapped to exact database schema columns

- ✅ **Thank You Page** (`src/app/thank-you/page.jsx` + `ThankYouContent.jsx`)
  - Server component with Suspense wrapper for `useSearchParams`
  - Personalized thank you message with user name
  - Package card display (if package slug provided)
  - Package image, title, and duration display
  - "Back to Home" and "Browse More Packages" buttons
  - Clean, centered layout
  - Responsive design
  - Google Analytics event tracking on page load (Package Enquiry Lead)

### Admin Panel

#### Admin Pages
- ✅ **Admin Layout** (`src/app/admin/layout.jsx`)
  - Authentication protection
  - Admin navigation

- ✅ **Admin Login** (`src/app/admin/login/page.jsx`)
  - Login interface

- ✅ **Admin Dashboard** (`src/app/admin/dashboard/page.jsx`)
  - Dashboard overview

- ✅ **Package Import** (`src/app/admin/import/page.jsx`)
  - Drag-and-drop file upload
  - Word document (.docx) parsing via Claude AI
  - Preview parsed package data
  - Itinerary day-by-day editor
  - Activity type selection with icons
  - Image picker integration
  - AI content generation (title, subtitle, description)
  - Destination creation/selection
  - Package save to Supabase
  - Comprehensive form validation

- ✅ **Packages Management** (`src/app/admin/packages/page.jsx`)
  - Packages list view

- ✅ **Package Editor** (`src/app/admin/packages/[id]/page.jsx`)
  - Package editing interface

- ✅ **Destinations Management** (`src/app/admin/destinations/page.jsx`)
  - Destinations list view

- ✅ **Destination Editor** (`src/app/admin/destinations/[id]/page.jsx`)
  - Destination editing interface

#### Admin Components
- ✅ **ImagePicker** (`src/components/admin/ImagePicker.jsx`)
  - Image selection interface
  - Image upload support

### API Routes

- ✅ **Parse Document** (`src/app/api/parse-document/route.js`)
  - Accepts Word documents (.docx)
  - Uses Claude AI to extract structured package data
  - Returns JSON with package and itinerary data

- ✅ **Generate Content** (`src/app/api/generate-content/route.js`)
  - AI-powered content generation
  - Generates titles, subtitles, descriptions

- ✅ **Import** (`src/app/api/import/route.js`)
  - Package import processing

### Analytics & Tracking

- ✅ **Tracking Scripts** (`src/components/tracking/TrackingScripts.js`)
  - Google Analytics (gtag.js) integration
  - Measurement ID: G-TC1QKWDH1D
  - Loads immediately after `<head>` element (beforeInteractive strategy)
  - Templates for future integrations:
    - Google Tag Manager
    - Meta Pixel (Facebook)
    - Microsoft Clarity
    - Custom tracking scripts
  - Server component for optimal performance

- ✅ **Google Analytics Events**
  - Search modal open tracking (`search_modal_open`)
  - Search query tracking (`search` with debouncing)
  - Package click tracking (`select_content`)
  - Package enquiry lead tracking (`Package Enquiry Lead` on thank you page)

### SEO & Metadata

- ✅ **Static Page Metadata**
  - Packages listing: "Travel Packages | Turquoise Holidays"
  - Destinations listing: "Destinations | Turquoise Holidays"
  - Implemented via layout.js files

- ✅ **Dynamic Page Metadata**
  - Package detail: "{package.title} | Turquoise Holidays"
  - Destination detail: "{destination.name} | Turquoise Holidays"
  - Implemented via `generateMetadata` function
  - Server-side data fetching for SEO
  - Fallback metadata for error cases

### Error Handling

- ✅ **404 Not Found** (`src/app/not-found.js`)
  - Automatic redirect to homepage
  - No 404 page shown to users
  - Seamless user experience

- ✅ **Package Detail Error Fixes**
  - Fixed NaN errors in numeric fields (starting_price, day_number)
  - Proper validation for JSONB fields (activities)
  - Safe array handling for meals and notes
  - Image validation and error handling
  - Route object validation

### Deployment Infrastructure

- ✅ **GitHub Actions Workflow** (`.github/workflows/deploy.yml`)
  - Automatic deployment on push to `main` branch
  - SSH-based deployment to VPS
  - Uses GitHub Secrets for secure credentials
  - Automated build and restart process
  - Captures git commit message as `NEXT_PUBLIC_GIT_COMMIT_MSG`
  - Sets build timestamp as `NEXT_PUBLIC_BUILD_TIME`

- ✅ **PM2 Configuration** (`ecosystem.config.js`)
  - Process manager configuration
  - Auto-restart on failure
  - Logging configuration
  - Memory limit management
  - Production environment setup

- ✅ **Deployment Script** (`deploy.sh`)
  - Automated VPS deployment script
  - Git pull and dependency installation
  - Next.js build process
  - PM2 process restart
  - Error handling and logging

- ✅ **Nginx Configuration** (`nginx.conf.example`)
  - Reverse proxy setup
  - HTTP to HTTPS redirect template
  - Static file caching
  - SSL certificate configuration template

- ✅ **Deployment Documentation** (`DEPLOYMENT.md`)
  - Complete VPS setup guide
  - Step-by-step installation instructions
  - GitHub Secrets configuration
  - Nginx and SSL setup
  - Troubleshooting guide
  - Security best practices

### Database Integration

- ✅ **Supabase Client** (`src/lib/supabase/client.js`)
  - Client-side Supabase initialization
  - Environment variable validation
  - Error handling with localStorage logging

- ✅ **Supabase Server** (`src/lib/supabase/server.js`)
  - Server-side Supabase client with service role
  - Admin operations support

- ✅ **Queries** (`src/lib/supabase/queries.js`)
  - `getPackages()` - Fetch packages with destination join, activity types, filtering
  - `getPackageBySlug()` - Get single package with full itinerary
  - `getDestinations()` - Fetch all active destinations with region data
  - `getDestinationBySlug()` - Get single destination with packages
  - `getTopDestinations()` - Fetch top 3 popular destinations
  - `getPackagesActivityTypes()` - Extract unique activity types from itinerary
  - `createDestination()` - Create new destination
  - Duration formatting helpers
  - Comprehensive filter support (destination, duration, price, search)
  - Error logging to localStorage for debugging

### Build & System Information

- ✅ **Build Info** (`src/lib/buildInfo.js`)
  - Exports `BUILD_TIME` from `NEXT_PUBLIC_BUILD_TIME` environment variable
  - Exports `GIT_COMMIT_MSG` from `NEXT_PUBLIC_GIT_COMMIT_MSG` environment variable
  - Set during deployment build process

- ✅ **System Status Page** (`src/app/status/page.jsx`)
  - Real-time system health monitoring
  - Version display (git commit message)
  - Build time display (last deployed timestamp)
  - Service status (Supabase, webhook, API routes)
  - Database statistics (packages, destinations, inquiries count)
  - Recent errors display
  - Auto-refresh every 30 seconds

- ✅ **Health API** (`src/app/api/health/route.js`)
  - System health check endpoint
  - Returns build time, git commit message, version info
  - Tests Supabase connection
  - Tests webhook endpoint availability
  - Returns database statistics
  - Error tracking

### Database Schema (`supabase/migrations/001_initial_schema.sql`)
- ✅ Regions table (with display_order)
- ✅ Destinations table (with full metadata, package_count, region_id)
- ✅ Travel styles table (pre-populated with 8 styles)
- ✅ Packages table (comprehensive fields including is_domestic)
- ✅ Itinerary days table (with route, activities JSONB, meals, optionals)
- ✅ Inquiries table (lead management with UTM tracking)
- ✅ Testimonials table
- ✅ Indexes (including full-text search on packages)
- ✅ Row Level Security (RLS) policies
- ✅ Triggers (package count, timestamps, updated_at)

### Scripts
- ✅ `seed-packages.js` - Seed database with sample packages
- ✅ `check-packages.js` - Validate package data structure
- ✅ `import-packages.js` - Import packages utility

### AI Integration
- ✅ **Claude Parser** (`src/lib/parser/claudeParser.js`)
  - Word document parsing using Anthropic Claude API
  - Structured data extraction
  - Itinerary day parsing

### Contact & Location Updates

- ✅ **Contact Page** (`src/app/contact/page.jsx`)
  - Updated physical address: Shop No 4, 1st Floor, Balaji Building, Hennur Bagalur Main Rd, above Ammas Bakery, Kothanur, Bengaluru, Karnataka 560077
  - Updated Google Maps embed with correct location
  - Contact form with Supabase integration
  - Business hours display

## 🚧 Not Yet Implemented

### Pages
- ✅ `/about` - About page (luxury travel company style, image-rich)
- ✅ `/contact` - Contact page (with form, updated address, Google Maps)
- ✅ `/thank-you` - Thank you page (with package display, Suspense wrapper)
- ✅ `/status` - System status page (health monitoring, build info, service status)
- ❌ `/customize` - Custom trip wizard

### Features
- ❌ Custom trip builder wizard
- ❌ Testimonials display on homepage
- ❌ Advanced package filtering (by price range, travel style, difficulty)
- ❌ Package comparison feature
- ❌ User accounts and saved packages
- ❌ Booking system integration
- ❌ Email notifications for inquiries
- ✅ SEO optimization for dynamic pages (meta tags via generateMetadata)
- ✅ Analytics integration (Google Analytics with gtag.js)
- ❌ Multi-language support

## Environment Setup

### Required Environment Variables (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
CLAUDE_API_KEY=your-claude-api-key
# OR
ANTHROPIC_API_KEY=your-anthropic-api-key
```

### Getting Started (Local Development)
1. Clone repository
2. Install dependencies: `npm install`
3. Set up `.env.local` with Supabase and Claude API credentials
4. Run migrations: Apply `supabase/migrations/001_initial_schema.sql` to Supabase
5. (Optional) Seed data: `npm run seed`
6. Start dev server: `npm run dev`

### VPS Deployment Setup
1. Follow complete guide in `DEPLOYMENT.md`
2. Configure GitHub Secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_DEPLOY_PATH`
3. Set up environment variables on VPS in `.env.local`
4. Push to `main` branch triggers automatic deployment via GitHub Actions

## Current Design System

### Colors (Tailwind Config)
- Primary: Turquoise (`#0D9488`)
- Background: Cream (`#FEF9F3`)
- Text: Charcoal (`#2C2C2C`)

### Typography
- Headings: Playfair Display
- Body: DM Sans
- Accent: El Messiri

### Key Design Patterns
- Frosted glass effects (`backdrop-blur`)
- Rounded corners (`rounded-full`, `rounded-xl`, `rounded-3xl`)
- Smooth transitions and hover effects
- Responsive grid layouts
- Image overlays with gradients

## Known Issues / Notes

1. **Package Images**: Falls back to Unsplash if no image in database. Image validation logic handles null/undefined strings.
2. **Duration Formatting**: Uses `duration_display` field from database, with fallback formatting based on nights.
3. **Activity Types**: Extracted from itinerary activities, displayed as scrollable icon chips on package cards.
4. **Admin Authentication**: Admin routes require authentication (implementation details in admin layout).
5. **Error Logging**: Client-side errors are logged to localStorage for debugging (visible on status page).
6. **Image Paths**: Supports both absolute URLs and relative paths (with leading slash normalization).
7. **Webhook Integration**: Enquiry form sends data to external webhook after Supabase insert. Webhook failures don't block form success.
8. **Mobile UX**: Search modal keyboard doesn't auto-open on mobile to preserve screen space. User must tap input to open keyboard.
9. **Modal State**: Fixed issue where `modal-open` class could prevent page scrolling. Now properly cleaned up on page navigation.
10. **NaN Handling**: All numeric fields (prices, day numbers) are validated and converted properly to prevent NaN errors.

## Next Steps (Recommended)

1. ✅ ~~Build package detail page~~ - **COMPLETE**
2. ✅ ~~Implement itinerary timeline component~~ - **COMPLETE** (accordion format)
3. ✅ ~~Add inquiry form with Supabase submission~~ - **COMPLETE**
4. ✅ ~~Create destinations listing page~~ - **COMPLETE**
5. ✅ ~~Add package filtering on packages page~~ - **COMPLETE** (domestic/international)
6. ✅ ~~Build admin import interface~~ - **COMPLETE**
7. ✅ ~~Set up VPS deployment infrastructure~~ - **COMPLETE** (GitHub Actions, PM2, Nginx)
8. ✅ ~~Add About page~~ - **COMPLETE** (luxury travel company style)
9. ✅ ~~Add Contact page~~ - **COMPLETE** (with form, updated address, Google Maps)
10. ✅ ~~SEO optimization for dynamic pages~~ - **COMPLETE** (generateMetadata for all pages)
11. ✅ ~~Analytics integration~~ - **COMPLETE** (Google Analytics with beforeInteractive)
12. ✅ ~~Webhook integration for enquiries~~ - **COMPLETE** (POST to build.goproxe.com)
13. ✅ ~~Thank you page with redirect flow~~ - **COMPLETE**
14. ✅ ~~404 error handling~~ - **COMPLETE** (redirect to homepage)
15. ✅ ~~System status page~~ - **COMPLETE** (health monitoring, build info)
16. ✅ ~~Build info system with git commit message~~ - **COMPLETE**
17. ✅ ~~Google Analytics event tracking~~ - **COMPLETE** (search, package clicks, enquiry leads)
18. ✅ ~~EnquiryModal mobile optimization~~ - **COMPLETE** (compact layout, reduced scrolling)
19. ⏳ Implement custom trip wizard (`/customize`)
16. ⏳ Add testimonials section to homepage
17. ⏳ Advanced package filtering (price range, travel style, difficulty)
18. ⏳ Email notifications for new inquiries
19. ⏳ Package comparison feature
20. ⏳ User accounts and saved packages
21. ⏳ Add Open Graph tags and structured data (JSON-LD)
22. ⏳ Implement Google Tag Manager
23. ⏳ Add Meta Pixel (Facebook) tracking
24. ⏳ Add Microsoft Clarity tracking

---

**Status:** Core features complete ✅ | Admin panel functional ✅ | Deployment infrastructure ready ✅ | Advanced features pending ⏳

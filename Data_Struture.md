# Turquoise Holidays - Single Source of Truth

## Data Structure Templates

This document defines the exact JSON structure for each view in the application.
All components MUST use these structures to ensure consistency.

---

## 1. DATABASE SCHEMA (Supabase)

### packages table
```sql
packages (
  id                  UUID PRIMARY KEY,
  slug                VARCHAR(200) UNIQUE NOT NULL,
  
  -- Basic Info
  title               VARCHAR(300) NOT NULL,
  subtitle            VARCHAR(500),
  description         TEXT,
  
  -- Destination
  destination_id      UUID REFERENCES destinations(id),
  cities_covered      TEXT[],                   -- ["Cairo", "Luxor", "Aswan"]
  
  -- Duration
  nights              INT NOT NULL,
  days                INT NOT NULL,
  duration_display    VARCHAR(50),              -- "7 Days / 6 Nights"
  
  -- Stay
  stay_breakdown      JSONB,                    -- [{"location": "Cairo", "nights": 3}]
  
  -- Categories
  travel_styles       TEXT[],                   -- ["cultural", "adventure"]
  themes              TEXT[],                   -- ["unesco", "desert"]
  difficulty          VARCHAR(20) DEFAULT 'easy',
  pace                VARCHAR(20) DEFAULT 'moderate',
  
  -- Content
  highlights          TEXT[],
  includes            TEXT[],
  excludes            TEXT[],
  important_notes     TEXT[],
  
  -- Pricing
  starting_price      DECIMAL(10,2),
  currency            VARCHAR(3) DEFAULT 'INR',
  price_note          VARCHAR(200),
  
  -- Transport
  arrival_point       VARCHAR(300),
  departure_point     VARCHAR(300),
  internal_transport  TEXT[],
  
  -- Timing
  best_months         INT[],                    -- [3,4,5,9,10,11]
  season_note         VARCHAR(300),
  
  -- Media
  hero_image          VARCHAR(500),
  thumbnail           VARCHAR(500),
  gallery             TEXT[],
  
  -- SEO
  seo_title           VARCHAR(200),
  seo_description     VARCHAR(500),
  seo_keywords        TEXT[],
  
  -- Status
  is_active           BOOLEAN DEFAULT true,
  is_featured         BOOLEAN DEFAULT false,
  is_domestic         BOOLEAN DEFAULT false,
  view_count          INT DEFAULT 0,
  
  -- Timestamps
  created_at          TIMESTAMPTZ,
  updated_at          TIMESTAMPTZ
)
```

### itinerary_days table
```sql
itinerary_days (
  id                  UUID PRIMARY KEY,
  package_id          UUID REFERENCES packages(id),
  
  day_number          INT NOT NULL,
  title               VARCHAR(300) NOT NULL,
  description         TEXT,
  
  -- Route
  route_from          VARCHAR(200),
  route_to            VARCHAR(200),
  route_distance      VARCHAR(50),
  route_mode          VARCHAR(50),              -- "drive", "flight", "ferry", "train"
  
  -- Activities (JSONB array)
  activities          JSONB,                    -- [{name, type, highlight, description}]
  
  -- Meals
  meals               TEXT[],                   -- ["breakfast", "dinner"]
  
  -- Overnight
  overnight           VARCHAR(200),
  
  -- Optional Activities
  optionals           JSONB,                    -- [{name, price, description}]
  
  -- Notes
  notes               TEXT[]
)
```

---

## 2. SEARCH MODAL - PACKAGE CARD (Grid View)

This is the small card shown in the search results grid.

### Required Fields
```json
{
  "id": "uuid",
  "slug": "cairo-nile-cruise-7d6n",
  "title": "Cairo & Nile Cruise Adventure",
  "subtitle": "Pyramids, temples & luxury Nile cruising",
  
  "duration_display": "7 Days / 6 Nights",
  "nights": 6,
  "days": 7,
  
  "destination": {
    "name": "Egypt",
    "country": "Egypt"
  },
  
  "hero_image": "https://images.unsplash.com/...",
  "thumbnail": "https://images.unsplash.com/...",
  
  "is_domestic": false,
  "is_featured": true,
  
  "travel_styles": ["cultural", "luxury"],
  
  "starting_price": null,
  "currency": "USD",
  "price_note": "Price on request"
}
```

### Card UI Elements
```
┌─────────────────────────────────────┐
│ [Hero Image]                        │
│                                     │
│ ┌──────────────┐    ┌────────────┐  │
│ │ 7D / 6N      │    │   Egypt    │  │
│ └──────────────┘    └────────────┘  │
└─────────────────────────────────────┘
│ Cairo & Nile Cruise Adventure       │
│ Pyramids, temples & luxury...       │
│                                     │
│ 🏛️ 🏔️ 🛍️  (travel style icons)     │
│                                     │
│ Starting from ₹--,--- / Price on... │
└─────────────────────────────────────┘
```

---

## 3. SEARCH MODAL - DETAILED CARD (When clicked)

This is the expanded view when user clicks on a card.

### Required Fields
```json
{
  "id": "uuid",
  "slug": "cairo-nile-cruise-7d6n",
  "title": "Cairo & Nile Cruise Adventure",
  "subtitle": "Pyramids, temples & luxury Nile cruising",
  "description": "Experience the best of Egypt - explore the ancient pyramids of Giza, cruise the Nile visiting magnificent temples...",
  
  "duration_display": "7 Days / 6 Nights",
  "nights": 6,
  "days": 7,
  
  "destination": {
    "id": "uuid",
    "name": "Egypt",
    "slug": "egypt",
    "country": "Egypt",
    "region": "Middle East"
  },
  
  "cities_covered": ["Cairo", "Aswan", "Kom Ombo", "Edfu", "Luxor"],
  
  "stay_breakdown": [
    { "location": "Cairo", "nights": 3 },
    { "location": "Nile Cruise", "nights": 3 }
  ],
  
  "highlights": [
    "Giza Pyramids and Great Sphinx",
    "Luxury Nile Cruise - Aswan to Luxor",
    "Valley of the Kings",
    "Karnak Temple Complex",
    "Egyptian Museum treasures",
    "Philae Temple and Felucca ride"
  ],
  
  "key_experiences": [
    { "name": "Philae Temple", "type": "cultural", "description": "Dedicated to goddess Isis" },
    { "name": "Felucca Ride", "type": "adventure", "description": "Traditional sailboat tour" },
    { "name": "Kom Ombo Temple", "type": "cultural", "description": "Dual temple honoring Sobek and Horus" },
    { "name": "Valley of the Kings", "type": "cultural", "description": "Tombs of pharaohs" },
    { "name": "Khan El Khalili Bazaar", "type": "shopping", "description": "Famous traditional market" }
  ],
  
  "hero_image": "https://...",
  "gallery": ["https://...", "https://..."],
  
  "travel_styles": ["cultural", "luxury", "historical"],
  
  "best_months": [10, 11, 12, 1, 2, 3, 4],
  "season_note": "Best October to April",
  
  "starting_price": null,
  "price_note": "Price on request"
}
```

### Detailed Card UI Elements
```
┌───────────────────────────────────────────────────────────┐
│ [Image Gallery with navigation arrows]                    │
│                                                           │
│ ┌────────────────┐                                        │
│ │ 📷 📷 📷       │  (thumbnail strip)                     │
│ └────────────────┘                                        │
├───────────────────────────────────────────────────────────┤
│                                                           │
│ Cairo & Nile Cruise Adventure                             │
│ Pyramids, temples & luxury Nile cruising                  │
│                                                           │
│ 📅 7 Days / 6 Nights                                      │
│                                                           │
│ ─────────────────────────────────────────────────────     │
│                                                           │
│ DESTINATIONS COVERED                                      │
│ Cairo → Aswan → Kom Ombo → Edfu → Luxor                  │
│                                                           │
│ STAY BREAKDOWN                                            │
│ 🏨 Cairo: 3 Nights                                        │
│ 🚢 Nile Cruise: 3 Nights                                  │
│                                                           │
│ ─────────────────────────────────────────────────────     │
│                                                           │
│ ⭐ HIGHLIGHTS                                             │
│ • Giza Pyramids and Great Sphinx                          │
│ • Luxury Nile Cruise - Aswan to Luxor                     │
│ • Valley of the Kings                                     │
│ • Karnak Temple Complex                                   │
│                                                           │
│ ─────────────────────────────────────────────────────     │
│                                                           │
│ 🎯 KEY EXPERIENCES                                        │
│ 🏛️ Philae Temple - Dedicated to goddess Isis             │
│ ⛵ Felucca Ride - Traditional sailboat tour               │
│ 🏛️ Kom Ombo Temple - Dual temple                         │
│ 🏛️ Valley of the Kings - Tombs of pharaohs               │
│ 🛍️ Khan El Khalili Bazaar                                │
│                                                           │
│ ─────────────────────────────────────────────────────     │
│                                                           │
│ 📍 Egypt                                                  │
│                                                           │
│ [        View Complete Itinerary        ]                 │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### Key Experiences Extraction Rules

From itinerary activities, extract ONLY these types for display:
- ✅ `cultural` - temples, museums, palaces, monuments
- ✅ `adventure` - cruises, safari, treks, water activities  
- ✅ `sightseeing` - viewpoints, landmarks, natural wonders
- ✅ `shopping` - markets, bazaars

EXCLUDE from Key Experiences:
- ❌ `transfer` - airport, hotel transfers, drives
- ❌ `leisure` - free time, check-in, rest
- ❌ Meals (breakfast, lunch, dinner)
- ❌ Overnight mentions

---

## 4. ITINERARY PAGE (Full Package View)

### Required Fields
```json
{
  "package": {
    "id": "uuid",
    "slug": "cairo-nile-cruise-7d6n",
    "title": "Cairo & Nile Cruise Adventure",
    "subtitle": "Pyramids, temples & luxury Nile cruising",
    "description": "Experience the best of Egypt...",
    
    "duration_display": "7 Days / 6 Nights",
    "nights": 6,
    "days": 7,
    
    "destination": {
      "id": "uuid",
      "name": "Egypt",
      "slug": "egypt",
      "country": "Egypt",
      "region": "Middle East"
    },
    
    "cities_covered": ["Cairo", "Aswan", "Kom Ombo", "Edfu", "Luxor"],
    
    "stay_breakdown": [
      { "location": "Cairo", "nights": 3 },
      { "location": "Nile Cruise", "nights": 3 }
    ],
    
    "highlights": [
      "Giza Pyramids and Great Sphinx",
      "Luxury Nile Cruise - Aswan to Luxor",
      "Valley of the Kings",
      "Karnak Temple Complex",
      "Egyptian Museum treasures",
      "Philae Temple and Felucca ride"
    ],
    
    "includes": [
      "3 nights accommodation in Cairo (B&B)",
      "3 nights Nile Cruise (Full Board)",
      "All transfers by A/C coach",
      "Domestic flight Cairo-Aswan",
      "English speaking guide",
      "All entrance fees as per itinerary",
      "Mineral water daily"
    ],
    
    "excludes": [
      "International flights",
      "Entry visa (USD 25)",
      "Tips and gratuities",
      "Optional tours",
      "Personal expenses"
    ],
    
    "important_notes": [
      "Cruise itinerary may vary based on water levels",
      "Modest dress required at religious sites"
    ],
    
    "arrival_point": "Cairo International Airport",
    "departure_point": "Cairo International Airport",
    "internal_transport": ["A/C Coach", "Domestic Flight", "Nile Cruise"],
    
    "best_months": [10, 11, 12, 1, 2, 3, 4],
    "season_note": "Best October to April. Avoid summer heat.",
    
    "hero_image": "https://...",
    "gallery": ["https://...", "https://..."],
    
    "travel_styles": ["cultural", "luxury"],
    "themes": ["ancient-ruins", "unesco", "river-cruise"],
    "difficulty": "easy",
    "pace": "moderate",
    
    "starting_price": null,
    "currency": "USD",
    "price_note": "Price on request",
    
    "is_domestic": false,
    "is_featured": true,
    "is_active": true
  },
  
  "itinerary": [
    {
      "day_number": 1,
      "title": "Arrival in Cairo",
      "description": "Welcome to Egypt! Upon arrival at Cairo International Airport, you'll be greeted and assisted through customs. Transfer to your hotel.",
      
      "route_from": "Cairo Airport",
      "route_to": "Cairo",
      "route_mode": "drive",
      "route_distance": null,
      
      "activities": [
        { "name": "Airport arrival & visa assistance", "type": "transfer", "highlight": false },
        { "name": "Hotel transfer & check-in", "type": "transfer", "highlight": false }
      ],
      
      "meals": [],
      "overnight": "Cairo",
      
      "optionals": [
        { "name": "Sound & Light Show at Pyramids", "price": "USD 52", "description": "Evening performance" }
      ],
      
      "notes": []
    },
    {
      "day_number": 2,
      "title": "Cairo to Aswan – Nile Cruise Embarkation",
      "description": "Transfer to Cairo Airport for flight to Aswan. Board your Nile cruise ship and begin exploring.",
      
      "route_from": "Cairo",
      "route_to": "Aswan",
      "route_mode": "flight",
      "route_distance": null,
      
      "activities": [
        { "name": "Flight to Aswan", "type": "transfer", "highlight": false },
        { "name": "High Dam", "type": "sightseeing", "highlight": true, "description": "Marvel of modern engineering" },
        { "name": "Philae Temple", "type": "cultural", "highlight": true, "description": "Dedicated to goddess Isis" },
        { "name": "Felucca Ride", "type": "adventure", "highlight": true, "description": "Traditional sailboat tour" }
      ],
      
      "meals": ["breakfast", "lunch", "dinner"],
      "overnight": "Nile Cruise - Aswan",
      
      "optionals": [],
      "notes": []
    }
  ]
}
```

### Itinerary Page UI Elements
```
┌─────────────────────────────────────────────────────────────────────┐
│ [Hero Image - Full Width]                                           │
│                                                                     │
│ Cairo & Nile Cruise Adventure                                       │
│ Pyramids, temples & luxury Nile cruising                            │
│                                                                     │
│ 📅 7 Days / 6 Nights    📍 Egypt    🌍 Middle East                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ROUTE                                                               │
│ Cairo → Aswan → Kom Ombo → Edfu → Luxor → Cairo                    │
│                                                                     │
│ STAY BREAKDOWN                                                      │
│ ████████████░░░░░░░░ Cairo (3N)                                     │
│ ░░░░░░░░░░░░████████ Nile Cruise (3N)                               │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ⭐ HIGHLIGHTS                                                       │
│ • Giza Pyramids and Great Sphinx                                    │
│ • Luxury Nile Cruise                                                │
│ • Valley of the Kings                                               │
│ • Karnak Temple Complex                                             │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ DAY-BY-DAY ITINERARY                                                │
│                                                                     │
│ ┌─ Day 1 ─────────────────────────────────────────────────────────┐ │
│ │ Arrival in Cairo                                                 │ │
│ │ Cairo Airport → Cairo                                            │ │
│ │                                                                  │ │
│ │ Welcome to Egypt! Upon arrival at Cairo International...        │ │
│ │                                                                  │ │
│ │ Activities:                                                      │ │
│ │ 🚗 Airport arrival    🏨 Hotel check-in                         │ │
│ │                                                                  │ │
│ │ 🍽️ No meals included   🌙 Overnight: Cairo                      │ │
│ │                                                                  │ │
│ │ Optional:                                                        │ │
│ │ 💡 Sound & Light Show at Pyramids - USD 52                      │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─ Day 2 ─────────────────────────────────────────────────────────┐ │
│ │ Cairo to Aswan – Nile Cruise Embarkation                         │ │
│ │ Cairo ✈️ Aswan                                                   │ │
│ │                                                                  │ │
│ │ Transfer to Cairo Airport for flight to Aswan...                │ │
│ │                                                                  │ │
│ │ Activities:                                                      │ │
│ │ ✈️ Flight to Aswan                                               │ │
│ │ 🏛️ High Dam - Marvel of modern engineering                      │ │
│ │ 🏛️ Philae Temple - Dedicated to goddess Isis                    │ │
│ │ ⛵ Felucca Ride - Traditional sailboat tour                      │ │
│ │                                                                  │ │
│ │ 🍽️ Breakfast, Lunch, Dinner   🌙 Overnight: Nile Cruise         │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ✅ INCLUDES                          ❌ EXCLUDES                    │
│ • 3 nights Cairo (B&B)               • International flights       │
│ • 3 nights Nile Cruise               • Entry visa (USD 25)         │
│ • All transfers by A/C coach         • Tips and gratuities         │
│ • Domestic flight                    • Optional tours              │
│ • English speaking guide             • Personal expenses           │
│ • All entrance fees                                                 │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ℹ️ IMPORTANT NOTES                                                  │
│ • Cruise itinerary may vary based on water levels                  │
│ • Modest dress required at religious sites                         │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ [  Inquiry Sidebar - Sticky  ]                                      │
│ ┌─────────────────────────┐                                         │
│ │ Interested in this      │                                         │
│ │ package?                │                                         │
│ │                         │                                         │
│ │ Name: [___________]     │                                         │
│ │ Email: [___________]    │                                         │
│ │ Phone: [___________]    │                                         │
│ │ Travel Date: [___]      │                                         │
│ │ Travelers: [2] [0]      │                                         │
│ │ Message: [________]     │                                         │
│ │                         │                                         │
│ │ [  Send Inquiry  ]      │                                         │
│ └─────────────────────────┘                                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. ADMIN DASHBOARD - DOCUMENT PARSER OUTPUT

When parsing a Word document, the parser MUST output this exact structure:

### Parser Output Structure
```json
{
  "parsed": true,
  "confidence": 0.85,
  "warnings": ["Duration extracted from title, please verify"],
  
  "package": {
    "title": "Cairo & Nile Cruise Adventure",
    "slug": "cairo-nile-cruise-adventure-7d6n",
    "subtitle": "",
    "description": "",
    
    "nights": 6,
    "days": 7,
    "duration_display": "7 Days / 6 Nights",
    
    "destination_id": null,
    "cities_covered": ["Cairo", "Aswan", "Luxor"],
    
    "stay_breakdown": [
      { "location": "Cairo", "nights": 3 },
      { "location": "Nile Cruise", "nights": 3 }
    ],
    
    "travel_styles": ["cultural"],
    "themes": [],
    "difficulty": "easy",
    "pace": "moderate",
    
    "highlights": [],
    
    "includes": [
      "Accommodation as per program",
      "All transfers by A/C coach",
      "English speaking guide"
    ],
    
    "excludes": [
      "International flights",
      "Tips",
      "Personal expenses"
    ],
    
    "important_notes": [],
    
    "arrival_point": "Cairo International Airport",
    "departure_point": "Cairo International Airport",
    "internal_transport": ["A/C Coach"],
    
    "best_months": [],
    "season_note": "",
    
    "hero_image": "",
    "thumbnail": "",
    "gallery": [],
    
    "is_active": true,
    "is_featured": false,
    "is_domestic": false
  },
  
  "itinerary": [
    {
      "day_number": 1,
      "title": "Arrival in Cairo",
      "description": "Arrive at Cairo International Airport...",
      
      "route_from": "Cairo Airport",
      "route_to": "Cairo",
      "route_mode": "drive",
      
      "activities": [
        { "name": "Airport transfer", "type": "transfer", "highlight": false },
        { "name": "Hotel check-in", "type": "leisure", "highlight": false }
      ],
      
      "meals": ["dinner"],
      "overnight": "Cairo",
      
      "optionals": [],
      "notes": []
    }
  ]
}
```

---

## 6. ADMIN IMPORT PREVIEW

### Validation Checklist
```json
{
  "validation": {
    "title": { "valid": true, "value": "Cairo & Nile Cruise" },
    "duration": { "valid": true, "value": "7 Days / 6 Nights" },
    "destination": { "valid": false, "value": null, "message": "Please select destination" },
    "hero_image": { "valid": false, "value": null, "message": "Required" },
    "thumbnail": { "valid": false, "value": null, "message": "Required" },
    "itinerary": { "valid": true, "value": "7 days parsed" },
    "cities_covered": { "valid": true, "value": "5 cities" },
    "highlights": { "valid": false, "value": "0 items", "message": "Add highlights manually" },
    "includes": { "valid": true, "value": "8 items" },
    "excludes": { "valid": true, "value": "5 items" }
  },
  "canSave": false,
  "missingRequired": ["destination", "hero_image", "thumbnail"]
}
```

### Preview UI Structure
```
┌─────────────────────────────────────────────────────────────────────┐
│ VALIDATION CHECKLIST           │  CARD PREVIEW                      │
│                                │  ┌─────────────────────────────┐   │
│ ✅ Title                       │  │ [Hero Image]                │   │
│ ✅ Duration                    │  │ ┌──────┐      ┌──────────┐  │   │
│ ❌ Destination (select)        │  │ │7D/6N │      │  Egypt   │  │   │
│ ❌ Hero Image (required)       │  │ └──────┘      └──────────┘  │   │
│ ❌ Thumbnail (required)        │  ├─────────────────────────────┤   │
│ ✅ Itinerary (7 days)          │  │ Cairo & Nile Cruise         │   │
│ ✅ Cities (5)                  │  │ Pyramids, temples...        │   │
│ ⚠️ Highlights (0 - add)        │  │                             │   │
│ ✅ Includes (8)                │  │ 🏛️ 🏔️                       │   │
│ ✅ Excludes (5)                │  │                             │   │
│                                │  │ Price on request            │   │
│ ─────────────────────────────  │  └─────────────────────────────┘   │
│                                │                                    │
│ Destination *                  │  STATS                             │
│ [Egypt                    ▼]   │  📍 5 Cities │ 🎯 12 Activities    │
│                                │  🏨 6 Nights │ ⭐ 0 Highlights     │
│ Hero Image *                   │                                    │
│ [____________________] [📷]    │                                    │
│                                │                                    │
│ Thumbnail *                    │                                    │
│ [____________________] [📷]    │                                    │
│                                │                                    │
├────────────────────────────────┴────────────────────────────────────┤
│                                                                     │
│ ITINERARY PREVIEW                                    [Hide Details] │
│                                                                     │
│ ┌─ Day 1: Arrival in Cairo ────────────────────────────────────────┐│
│ │ Cairo Airport → Cairo                                            ││
│ │                                                                  ││
│ │ Arrive at Cairo International Airport...                         ││
│ │                                                                  ││
│ │ Activities:                                                      ││
│ │ 🚗 Airport transfer    🏨 Hotel check-in                         ││
│ │                                                                  ││
│ │ 🍽️ Dinner              🌙 Overnight: Cairo                       ││
│ └──────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ ┌─ Day 2: Cairo to Aswan ──────────────────────────────────────────┐│
│ │ Cairo ✈️ Aswan                                                   ││
│ │ ...                                                              ││
│ └──────────────────────────────────────────────────────────────────┘│
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ [         Confirm & Save Package         ]  (disabled until valid) │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. ACTIVITY TYPE ICONS

| Type | Icon | Emoji | Use For |
|------|------|-------|---------|
| `cultural` | Landmark | 🏛️ | temples, museums, palaces, monuments |
| `sightseeing` | Camera | 📸 | viewpoints, landmarks, natural sights |
| `adventure` | Mountain | 🏔️ | safari, cruise, trek, water sports |
| `beach` | Waves | 🏖️ | beaches, coastal activities |
| `shopping` | ShoppingBag | 🛍️ | markets, bazaars, malls |
| `transfer` | Car | 🚗 | airport, drives, hotel transfers |
| `leisure` | Coffee | ☕ | free time, rest, check-in |
| `show` | Star | 🌟 | performances, light shows |
| `wildlife` | Binoculars | 🦁 | safari, zoo, nature reserves |

### Route Mode Icons
| Mode | Icon | Emoji |
|------|------|-------|
| `drive` | Car | 🚗 |
| `flight` | Plane | ✈️ |
| `train` | Train | 🚂 |
| `ferry` | Ship | ⛴️ |
| `walk` | Walking | 🚶 |

### Meal Icons
| Meal | Emoji |
|------|-------|
| `breakfast` | 🍳 |
| `lunch` | 🍱 |
| `dinner` | 🍽️ |

---

## 8. PARSER RULES

### Duration Extraction
```
Input patterns:
- "9N/10D" → { nights: 9, days: 10 }
- "10 Days / 9 Nights" → { nights: 9, days: 10 }
- "5 Nights 6 Days" → { nights: 5, days: 6 }
- "4 Nights / 5 Days" → { nights: 4, days: 5 }

Output format: "X Days / Y Nights" (days first)
```

### Activity Type Detection
```
Keywords → Type mapping:

cultural:
  - temple, shrine, church, mosque, monastery, cathedral
  - museum, gallery, palace, castle, fort, citadel
  - tomb, pyramid, ruins, archaeological

sightseeing:
  - viewpoint, view, panoramic, scenic
  - garden, park, lake, waterfall, dam
  - tower, bridge, landmark

adventure:
  - safari, cruise, boat, felucca, gondola
  - trek, hike, climb, rafting, diving, snorkel
  - jeep, 4x4, desert, camel

shopping:
  - market, bazaar, mall, shopping, souk

transfer:
  - airport, transfer, drive, flight, train, ferry
  - check-in, check-out, pick up, drop

leisure:
  - free time, rest, relax, leisure, spa
  - optional, at leisure

EXCLUDE from activities (put in meals/overnight):
  - breakfast, lunch, dinner → meals array
  - overnight, stay at, night at → overnight field
```

### Cities Extraction
```
Extract unique cities from:
1. route_from values
2. route_to values  
3. overnight values

Skip: "Airport", "Railway Station", "Port"
```

### Stay Breakdown Calculation
```
Count nights per unique overnight location:

itinerary: [
  { overnight: "Cairo" },
  { overnight: "Cairo" },
  { overnight: "Nile Cruise" },
  { overnight: "Nile Cruise" },
  { overnight: "Nile Cruise" },
  { overnight: null }  // departure day
]

Result: [
  { location: "Cairo", nights: 2 },
  { location: "Nile Cruise", nights: 3 }
]
```

---

## 9. SUMMARY: What Each View Needs

| Field | Card | Detailed | Itinerary | Parser Must Extract |
|-------|------|----------|-----------|---------------------|
| title | ✅ | ✅ | ✅ | ✅ |
| subtitle | ✅ | ✅ | ✅ | ⚠️ (manual) |
| description | ❌ | ✅ | ✅ | ⚠️ (manual) |
| duration_display | ✅ | ✅ | ✅ | ✅ |
| nights/days | ✅ | ✅ | ✅ | ✅ |
| destination | ✅ | ✅ | ✅ | ⚠️ (select) |
| cities_covered | ❌ | ✅ | ✅ | ✅ |
| stay_breakdown | ❌ | ✅ | ✅ | ✅ (calculated) |
| highlights | ❌ | ✅ | ✅ | ⚠️ (manual) |
| key_experiences | ❌ | ✅ | ❌ | ✅ (from activities) |
| hero_image | ✅ | ✅ | ✅ | ❌ (picker) |
| thumbnail | ✅ | ❌ | ❌ | ❌ (picker) |
| gallery | ❌ | ✅ | ✅ | ❌ (picker) |
| travel_styles | ✅ | ✅ | ✅ | ⚠️ (detect/manual) |
| includes | ❌ | ❌ | ✅ | ✅ |
| excludes | ❌ | ❌ | ✅ | ✅ |
| itinerary[] | ❌ | ❌ | ✅ | ✅ |
| starting_price | ✅ | ✅ | ✅ | ⚠️ (manual) |
| best_months | ❌ | ✅ | ✅ | ⚠️ (manual) |
| is_domestic | ✅ | ✅ | ✅ | ✅ (from destination) |

Legend:
- ✅ Required/Auto-extracted
- ⚠️ Optional/Manual input needed
- ❌ Not needed for this view

---

## 10. CURSOR PROMPT

Use this prompt to implement consistent data handling:

```
Implement the Turquoise Holidays data layer following these rules:

1. DATABASE: Use Supabase with packages and itinerary_days tables
   - See Section 1 for exact schema

2. SEARCH MODAL CARD: Display fields from Section 2
   - Small card in grid
   - Shows: image, duration badge, destination badge, title, subtitle, travel style icons, price

3. SEARCH MODAL DETAILED: Display fields from Section 3
   - Expanded view on click
   - Shows: gallery, title, subtitle, duration, destinations covered (as route), stay breakdown, highlights, key experiences (filtered activities), destination

4. ITINERARY PAGE: Display fields from Section 4
   - Full package page at /packages/[slug]
   - Shows: hero, full details, day-by-day itinerary with activities, includes/excludes, inquiry form

5. ADMIN IMPORT: Parser output must match Section 5
   - Extract all fields automatically where possible
   - Validate required fields per Section 6
   - Calculate stay_breakdown from overnight values
   - Extract key_experiences from activities (filter by type)

6. ACTIVITY FILTERING: Use Section 7 for icons and Section 8 for type detection
   - Key Experiences = activities where type is cultural, adventure, sightseeing, or shopping
   - Exclude transfer and leisure from Key Experiences display

All views MUST use the same data source and consistent field names.
```
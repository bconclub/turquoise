// Script to seed sample packages and destinations into Supabase
// Usage: node scripts/seed-packages.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sampleDestinations = [
  { name: 'Thailand', slug: 'thailand', country_code: 'TH' },
  { name: 'Maldives', slug: 'maldives', country_code: 'MV' },
  { name: 'Switzerland', slug: 'switzerland', country_code: 'CH' },
  { name: 'Dubai', slug: 'dubai', country_code: 'AE' },
  { name: 'Bali', slug: 'bali', country_code: 'ID' },
  { name: 'Japan', slug: 'japan', country_code: 'JP' },
  { name: 'Greece', slug: 'greece', country_code: 'GR' },
  { name: 'Italy', slug: 'italy', country_code: 'IT' }
];

const samplePackages = [
  {
    title: 'Luxury Beach Escape in Maldives',
    slug: 'luxury-beach-escape-maldives',
    subtitle: '5-star resort experience with overwater villas',
    nights: 4,
    days: 5,
    duration_display: '5 Days / 4 Nights',
    starting_price: 2500,
    price_currency: 'USD',
    hero_image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e5f1?q=80&w=800',
    highlights: ['Overwater villa', 'Private beach', 'Spa treatments', 'Snorkeling']
  },
  {
    title: 'Cultural Heritage Tour in Thailand',
    slug: 'cultural-heritage-thailand',
    subtitle: 'Explore ancient temples and vibrant markets',
    nights: 6,
    days: 7,
    duration_display: '7 Days / 6 Nights',
    starting_price: 1200,
    price_currency: 'USD',
    hero_image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800',
    highlights: ['Temple visits', 'Floating markets', 'Thai cooking class', 'Cultural shows']
  },
  {
    title: 'Mountain Adventure in Switzerland',
    slug: 'mountain-adventure-switzerland',
    subtitle: 'Alpine hiking and scenic train journeys',
    nights: 5,
    days: 6,
    duration_display: '6 Days / 5 Nights',
    starting_price: 3500,
    price_currency: 'USD',
    hero_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800',
    highlights: ['Mountain hiking', 'Scenic trains', 'Alpine villages', 'Swiss cuisine']
  },
  {
    title: 'Desert Safari in Dubai',
    slug: 'desert-safari-dubai',
    subtitle: 'Dune bashing and luxury desert camp',
    nights: 3,
    days: 4,
    duration_display: '4 Days / 3 Nights',
    starting_price: 800,
    price_currency: 'USD',
    hero_image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e5f1?q=80&w=800',
    highlights: ['Desert safari', 'Camel rides', 'BBQ dinner', 'Belly dancing']
  },
  {
    title: 'Tropical Paradise in Bali',
    slug: 'tropical-paradise-bali',
    subtitle: 'Beach relaxation and spiritual experiences',
    nights: 7,
    days: 8,
    duration_display: '8 Days / 7 Nights',
    starting_price: 1500,
    price_currency: 'USD',
    hero_image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800',
    highlights: ['Beach resorts', 'Temple visits', 'Rice terraces', 'Spa retreats']
  }
];

async function seedData() {
  try {
    console.log('🌱 Starting to seed data...\n');

    // First, insert destinations
    console.log('📍 Inserting destinations...');
    const destinationMap = {};
    
    for (const dest of sampleDestinations) {
      const { data, error } = await supabase
        .from('destinations')
        .upsert(dest, { onConflict: 'slug' })
        .select()
        .single();

      if (error) {
        console.error(`Error inserting ${dest.name}:`, error.message);
      } else {
        console.log(`✅ Inserted: ${dest.name}`);
        destinationMap[dest.slug] = data.id;
      }
    }

    console.log('\n📦 Inserting packages...');
    
    // Insert packages with destination references
    for (let i = 0; i < samplePackages.length; i++) {
      const pkg = samplePackages[i];
      const destSlug = sampleDestinations[i]?.slug;
      const destinationId = destinationMap[destSlug];

      if (!destinationId) {
        console.error(`⚠️  Skipping ${pkg.title} - destination not found`);
        continue;
      }

      const packageData = {
        ...pkg,
        destination_id: destinationId,
        is_active: true,
        is_featured: i < 3 // First 3 are featured
      };

      const { data, error } = await supabase
        .from('packages')
        .upsert(packageData, { onConflict: 'slug' })
        .select()
        .single();

      if (error) {
        console.error(`Error inserting ${pkg.title}:`, error.message);
      } else {
        console.log(`✅ Inserted: ${pkg.title}`);
      }
    }

    console.log('\n✨ Seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

seedData();


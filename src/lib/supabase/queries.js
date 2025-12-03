import { supabase } from './client';

/**
 * Fetch all active packages with destination information
 */
export async function getPackages(filters = {}) {
  try {
    // First, get all packages
    let query = supabase
      .from('packages')
      .select(`
        id,
        slug,
        title,
        subtitle,
        duration_nights,
        duration_days,
        starting_price,
        price_currency,
        hero_image,
        thumbnail,
        highlights,
        destination_id
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.destinationId) {
      query = query.eq('destination_id', filters.destinationId);
    }

    if (filters.minDuration) {
      query = query.gte('duration_nights', filters.minDuration);
    }

    if (filters.maxDuration) {
      query = query.lte('duration_nights', filters.maxDuration);
    }

    if (filters.minPrice) {
      query = query.gte('starting_price', filters.minPrice);
    }

    if (filters.maxPrice) {
      query = query.lte('starting_price', filters.maxPrice);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching packages:', error.message || error);
      console.error('Full error:', JSON.stringify(error, null, 2));
      return [];
    }

    // Transform data to match component expectations
    return (data || []).map(pkg => ({
      id: pkg.id,
      slug: pkg.slug,
      title: pkg.title,
      subtitle: pkg.subtitle,
      destination: pkg.destination?.name || pkg.destinations?.name || 'Unknown',
      destinationSlug: pkg.destination?.slug || pkg.destinations?.slug || '',
      duration: formatDuration(pkg.duration_nights, pkg.duration_days),
      durationNights: pkg.duration_nights,
      durationDays: pkg.duration_days,
      price: pkg.starting_price,
      currency: pkg.price_currency || 'USD',
      image: pkg.hero_image || pkg.thumbnail || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&h=600&fit=crop',
      highlights: pkg.highlights || []
    }));
  } catch (error) {
    console.error('Error in getPackages:', error);
    return [];
  }
}

/**
 * Format duration from nights/days to display string
 */
function formatDuration(nights, days) {
  if (nights <= 2) {
    return '3-5 days';
  } else if (nights <= 5) {
    return '6-8 days';
  } else if (nights <= 8) {
    return '9-12 days';
  } else {
    return '13+ days';
  }
}

/**
 * Get all destinations for filter dropdown
 */
export async function getDestinations() {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching destinations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getDestinations:', error);
    return [];
  }
}

/**
 * Get top 3 most searched/popular destinations
 * Based on package count and featured status
 */
export async function getTopDestinations(limit = 3) {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('id, name, slug, package_count, is_featured')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('package_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching top destinations:', error);
      return [];
    }

    return (data || []).map(dest => dest.name);
  } catch (error) {
    console.error('Error in getTopDestinations:', error);
    return [];
  }
}


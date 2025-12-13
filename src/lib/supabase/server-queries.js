import { supabaseAdmin } from './server';

/**
 * Get package by slug (for server components)
 * Server-side version using admin client (bypasses RLS)
 */
export async function getPackageBySlug(slug) {
  try {
    const { data: packageData, error: packageError } = await supabaseAdmin
      .from('packages')
      .select(`
        *,
        destinations (
          id,
          name,
          slug,
          country,
          region:regions(id, name, slug)
        )
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (packageError || !packageData) {
      console.error('Error fetching package by slug:', packageError);
      return null;
    }

    // Fetch itinerary days
    const { data: itineraryData, error: itineraryError } = await supabaseAdmin
      .from('itinerary_days')
      .select('*')
      .eq('package_id', packageData.id)
      .order('day_number', { ascending: true });

    if (itineraryError) {
      console.error('Error fetching itinerary:', itineraryError);
    }

    return {
      ...packageData,
      itinerary: itineraryData || []
    };
  } catch (error) {
    console.error('Error in getPackageBySlug:', error);
    return null;
  }
}

/**
 * Get destination by slug (for server components)
 * Server-side version using admin client (bypasses RLS)
 */
export async function getDestinationBySlug(slug) {
  try {
    const { data, error } = await supabaseAdmin
      .from('destinations')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.error('Error fetching destination by slug:', error);
      return null;
    }

    // Get packages for this destination
    const { data: packagesData, error: packagesError } = await supabaseAdmin
      .from('packages')
      .select(`
        id,
        slug,
        title,
        subtitle,
        nights,
        days,
        duration_display,
        starting_price,
        currency,
        hero_image,
        thumbnail,
        highlights
      `)
      .eq('destination_id', data.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(12);

    if (packagesError) {
      console.error('Error fetching destination packages:', packagesError);
    }

    return {
      ...data,
      packages: packagesData || []
    };
  } catch (error) {
    console.error('Error in getDestinationBySlug:', error);
    return null;
  }
}


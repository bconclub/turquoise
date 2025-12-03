import { supabase } from './client';

/**
 * Fetch all active packages with destination information
 */
export async function getPackages(filters = {}) {
  try {
    console.log('🔍 [getPackages] Starting fetch with filters:', filters);
    
    // Select columns from database - using correct column names: nights, days, duration_display
    // Note: price_currency may not exist in actual database
    let query = supabase
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
        hero_image,
        thumbnail,
        highlights,
        destination_id,
        destinations (
          id,
          name,
          slug
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    console.log('📊 [getPackages] Base query built, applying filters...');

    // Apply filters
    if (filters.destinationId) {
      query = query.eq('destination_id', filters.destinationId);
      console.log('📍 [getPackages] Applied destination filter:', filters.destinationId);
    }

    // Duration filters using nights column
    if (filters.minDuration) {
      query = query.gte('nights', filters.minDuration);
      console.log('⏱️ [getPackages] Applied min duration filter:', filters.minDuration);
    }

    if (filters.maxDuration) {
      query = query.lte('nights', filters.maxDuration);
      console.log('⏱️ [getPackages] Applied max duration filter:', filters.maxDuration);
    }

    if (filters.minPrice) {
      query = query.gte('starting_price', filters.minPrice);
    }

    if (filters.maxPrice) {
      query = query.lte('starting_price', filters.maxPrice);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      console.log('🔎 [getPackages] Applied search filter:', filters.search);
    }

    console.log('🚀 [getPackages] Executing Supabase query...');
    const { data, error } = await query;
    
    console.log('📦 [getPackages] Raw Supabase response:', {
      hasData: !!data,
      dataLength: data?.length || 0,
      error: error ? error.message : null,
      firstItem: data?.[0] || null
    });

    if (error) {
      console.error('❌ [getPackages] Error fetching packages:', error.message || error);
      console.error('❌ [getPackages] Full error:', JSON.stringify(error, null, 2));
      console.error('❌ [getPackages] Error code:', error.code);
      console.error('❌ [getPackages] Error details:', error.details);
      
      // Store error in localStorage for status page
      if (typeof window !== 'undefined') {
        try {
          const errors = JSON.parse(localStorage.getItem('turquoise_errors') || '[]');
          errors.push({
            timestamp: new Date().toISOString(),
            message: error.message || 'Unknown error',
            code: error.code,
            details: error.details,
            source: 'getPackages'
          });
          // Keep only last 50 errors
          localStorage.setItem('turquoise_errors', JSON.stringify(errors.slice(-50)));
        } catch (e) {
          // Ignore localStorage errors
        }
      }
      
      return [];
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ [getPackages] No packages found in database');
      console.warn('⚠️ [getPackages] Check: Are packages marked as is_active=true?');
      return [];
    }

    console.log(`✅ [getPackages] Found ${data.length} packages, transforming...`);

    // Fetch activity types for all packages in batch
    const packageIds = (data || []).map(pkg => pkg.id);
    const activityTypesMap = await getPackagesActivityTypes(packageIds);
    console.log('🎯 [getPackages] Activity types fetched:', Object.keys(activityTypesMap).length, 'packages');

    // Transform data to match component expectations
    const transformed = (data || []).map((pkg, index) => {
      // Handle destination data - it comes as an object or array from Supabase join
      const destination = Array.isArray(pkg.destinations) 
        ? pkg.destinations[0] 
        : pkg.destinations;
      
      // Use correct column names: nights and days
      const nights = pkg.nights ?? 0;
      const days = pkg.days ?? (nights + 1);
      
      // Use duration_display if available, otherwise format from nights/days
      const duration = pkg.duration_display || formatDuration(nights, days);
      
      const transformedPkg = {
        id: pkg.id,
        slug: pkg.slug,
        title: pkg.title,
        subtitle: pkg.subtitle || '',
        destination: destination?.name || 'Unknown',
        destinationSlug: destination?.slug || '',
        duration: duration,
        durationNights: nights,
        durationDays: days,
        price: pkg.starting_price,
        currency: pkg.price_currency || pkg.currency || 'INR', // Fallback if column doesn't exist
        image: (pkg.hero_image && pkg.hero_image.trim() !== '') 
          ? pkg.hero_image 
          : ((pkg.thumbnail && pkg.thumbnail.trim() !== '') 
            ? pkg.thumbnail 
            : 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&h=600&fit=crop'),
        highlights: pkg.highlights || [],
        activityTypes: activityTypesMap[pkg.id] || [] // Unique activity types from itinerary
      };
      
      if (index < 3) {
        console.log(`📋 [getPackages] Transformed package ${index + 1}:`, {
          title: transformedPkg.title,
          destination: transformedPkg.destination,
          nights: transformedPkg.durationNights,
          days: transformedPkg.durationDays,
          duration: transformedPkg.duration,
          hasImage: !!transformedPkg.image
        });
      }
      
      return transformedPkg;
    });
    
    console.log(`✨ [getPackages] Successfully transformed ${transformed.length} packages`);
    return transformed;
  } catch (error) {
    console.error('Error in getPackages:', error);
    
    // Store error in localStorage for status page
    if (typeof window !== 'undefined') {
      try {
        const errors = JSON.parse(localStorage.getItem('turquoise_errors') || '[]');
        errors.push({
          timestamp: new Date().toISOString(),
          message: error.message || 'Unknown error in getPackages',
          stack: error.stack,
          source: 'getPackages'
        });
        localStorage.setItem('turquoise_errors', JSON.stringify(errors.slice(-50)));
      } catch (e) {
        // Ignore localStorage errors
      }
    }
    
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
      
      // Store error in localStorage for status page
      if (typeof window !== 'undefined') {
        try {
          const errors = JSON.parse(localStorage.getItem('turquoise_errors') || '[]');
          errors.push({
            timestamp: new Date().toISOString(),
            message: error.message || 'Unknown error fetching destinations',
            source: 'getDestinations'
          });
          localStorage.setItem('turquoise_errors', JSON.stringify(errors.slice(-50)));
        } catch (e) {
          // Ignore localStorage errors
        }
      }
      
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

/**
 * Get unique activity types for a package from itinerary_days
 * Extracts activity types from the activities JSONB column
 */
export async function getPackageActivityTypes(packageId) {
  try {
    // Fetch itinerary days with activities for this package
    const { data, error } = await supabase
      .from('itinerary_days')
      .select('activities')
      .eq('package_id', packageId);

    if (error) {
      console.error(`Error fetching activity types for package ${packageId}:`, error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Extract unique activity types from all activities
    const activityTypes = new Set();
    
    data.forEach(day => {
      if (day.activities && Array.isArray(day.activities)) {
        day.activities.forEach(activity => {
          if (activity && activity.type) {
            activityTypes.add(activity.type);
          }
        });
      }
    });

    return Array.from(activityTypes);
  } catch (error) {
    console.error(`Error in getPackageActivityTypes for package ${packageId}:`, error);
    return [];
  }
}

/**
 * Get activity types for multiple packages in batch
 * More efficient than calling getPackageActivityTypes for each package
 */
export async function getPackagesActivityTypes(packageIds) {
  try {
    if (!packageIds || packageIds.length === 0) {
      return {};
    }

    // Fetch all itinerary days for these packages
    const { data, error } = await supabase
      .from('itinerary_days')
      .select('package_id, activities')
      .in('package_id', packageIds);

    if (error) {
      console.error('Error fetching activity types for packages:', error);
      return {};
    }

    if (!data || data.length === 0) {
      return {};
    }

    // Group by package_id and extract unique activity types
    const activityTypesMap = {};
    
    data.forEach(day => {
      const packageId = day.package_id;
      if (!activityTypesMap[packageId]) {
        activityTypesMap[packageId] = new Set();
      }

      if (day.activities && Array.isArray(day.activities)) {
        day.activities.forEach(activity => {
          if (activity && activity.type) {
            activityTypesMap[packageId].add(activity.type);
          }
        });
      }
    });

    // Convert Sets to Arrays
    const result = {};
    Object.keys(activityTypesMap).forEach(packageId => {
      result[packageId] = Array.from(activityTypesMap[packageId]);
    });

    return result;
  } catch (error) {
    console.error('Error in getPackagesActivityTypes:', error);
    return {};
  }
}

/**
 * Get full package details including activities with names and all images
 */
export async function getPackageDetails(packageId) {
  try {
    // Fetch package with description
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select(`
        id,
        slug,
        title,
        subtitle,
        description,
        nights,
        days,
        duration_display,
        starting_price,
        hero_image,
        thumbnail,
        highlights,
        destination_id,
        destinations (
          id,
          name,
          slug
        )
      `)
      .eq('id', packageId)
      .single();

    if (packageError || !packageData) {
      console.error('Error fetching package details:', packageError);
      return null;
    }

    // Fetch itinerary days with activities
    const { data: itineraryData, error: itineraryError } = await supabase
      .from('itinerary_days')
      .select('activities')
      .eq('package_id', packageId)
      .order('day_number', { ascending: true });

    if (itineraryError) {
      console.error('Error fetching itinerary:', itineraryError);
    }

    // Extract all activities with names
    const allActivities = [];
    if (itineraryData) {
      itineraryData.forEach(day => {
        if (day.activities && Array.isArray(day.activities)) {
          day.activities.forEach(activity => {
            if (activity && activity.name) {
              allActivities.push({
                name: activity.name,
                type: activity.type || 'other',
                description: activity.description || ''
              });
            }
          });
        }
      });
    }

    // Get unique activity types
    const activityTypes = [...new Set(allActivities.map(a => a.type).filter(Boolean))];

    // Collect images (hero_image, thumbnail, and any other images)
    const images = [];
    if (packageData.hero_image) images.push(packageData.hero_image);
    if (packageData.thumbnail && packageData.thumbnail !== packageData.hero_image) {
      images.push(packageData.thumbnail);
    }

    return {
      ...packageData,
      activities: allActivities,
      activityTypes: activityTypes,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1512343879784-a960bf40e5f1?q=80&w=800&h=600&fit=crop']
    };
  } catch (error) {
    console.error('Error in getPackageDetails:', error);
    return null;
  }
}


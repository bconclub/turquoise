'use client';

import { supabase } from './client';

/**
 * Fetch all active packages with destination information
 */
export async function getPackages(filters = {}) {
  try {
    console.log('🔍 [getPackages] Starting fetch with filters:', filters);

    // Select columns from database - ALL fields per Data_Structure.md Section 2 (Search Modal Card)
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
        currency,
        price_note,
        hero_image,
        thumbnail,
        travel_styles,
        is_featured,
        is_domestic,
        destination_id,
        destinations (
          id,
          name,
          slug,
          country
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
    console.log('🎯 [getPackages] Activity types map sample:', Object.entries(activityTypesMap).slice(0, 3));

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
        duration_display: pkg.duration_display || duration,
        durationNights: nights,
        durationDays: days,
        days: days,
        nights: nights,
        price: pkg.starting_price,
        currency: pkg.price_currency || pkg.currency || 'INR', // Fallback if column doesn't exist
        image: (pkg.hero_image && pkg.hero_image.trim() !== '')
          ? pkg.hero_image
          : ((pkg.thumbnail && pkg.thumbnail.trim() !== '')
            ? pkg.thumbnail
            : 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&h=600&fit=crop'),
        hero_image: pkg.hero_image,
        thumbnail: pkg.thumbnail,
        highlights: pkg.highlights || [],
        activityTypes: activityTypesMap[String(pkg.id)] || activityTypesMap[pkg.id] || [], // Unique activity types from itinerary (try both string and original key)
        is_domestic: pkg.is_domestic || false,
        destinations: destination // Keep original destination object for compatibility
      };

      if (index < 3) {
        console.log(`📋 [getPackages] Transformed package ${index + 1}:`, {
          title: transformedPkg.title,
          destination: transformedPkg.destination,
          nights: transformedPkg.durationNights,
          days: transformedPkg.durationDays,
          duration: transformedPkg.duration,
          hasImage: !!transformedPkg.image,
          activityTypes: transformedPkg.activityTypes,
          activityTypesCount: transformedPkg.activityTypes?.length || 0
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
      .select(`
        id,
        name,
        slug,
        country,
        hero_image,
        thumbnail,
        package_count,
        region_id,
        region:regions(id, name, slug)
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
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
      .select('id, name, slug, is_featured')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('name', { ascending: true })
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
      console.warn('⚠️ [getPackagesActivityTypes] No package IDs provided');
      return {};
    }

    console.log('🔍 [getPackagesActivityTypes] Fetching activities for packages:', {
      packageCount: packageIds.length,
      packageIds: packageIds.slice(0, 5) // Log first 5 IDs
    });

    // Fetch all itinerary days for these packages
    const { data, error } = await supabase
      .from('itinerary_days')
      .select('package_id, activities, day_number')
      .in('package_id', packageIds)
      .order('package_id', { ascending: true })
      .order('day_number', { ascending: true });

    if (error) {
      console.error('❌ [getPackagesActivityTypes] Error fetching activity types:', error);
      return {};
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ [getPackagesActivityTypes] No itinerary days found for packages');
      return {};
    }

    console.log('📋 [getPackagesActivityTypes] Fetched itinerary days:', {
      totalDays: data.length,
      sampleDay: data[0] ? {
        package_id: data[0].package_id,
        day_number: data[0].day_number,
        activitiesCount: Array.isArray(data[0].activities) ? data[0].activities.length : 0,
        activitiesSample: Array.isArray(data[0].activities) ? data[0].activities.slice(0, 2) : data[0].activities
      } : null
    });

    // Group by package_id and extract unique activity types
    const activityTypesMap = {};
    const packageDayCounts = {}; // Track how many days per package

    data.forEach(day => {
      const packageId = day.package_id;
      // Ensure packageId is converted to string for consistent key matching
      const packageIdKey = String(packageId);
      
      // Track day count
      if (!packageDayCounts[packageIdKey]) {
        packageDayCounts[packageIdKey] = 0;
      }
      packageDayCounts[packageIdKey]++;
      
      if (!activityTypesMap[packageIdKey]) {
        activityTypesMap[packageIdKey] = new Set();
      }

      // Check activities structure
      if (day.activities) {
        if (Array.isArray(day.activities)) {
          // Activities is an array
          day.activities.forEach(activity => {
            if (activity && typeof activity === 'object') {
              // Activity is an object with a 'type' property
              if (activity.type) {
                activityTypesMap[packageIdKey].add(activity.type);
                console.log(`  ✅ [getPackagesActivityTypes] Added type "${activity.type}" from package ${packageIdKey}, day ${day.day_number}`);
              } else {
                console.warn(`  ⚠️ [getPackagesActivityTypes] Activity missing type:`, activity);
              }
            } else if (typeof activity === 'string') {
              // Activity might be a string (type name directly)
              activityTypesMap[packageIdKey].add(activity);
              console.log(`  ✅ [getPackagesActivityTypes] Added type "${activity}" (string) from package ${packageIdKey}, day ${day.day_number}`);
            }
          });
        } else if (typeof day.activities === 'object') {
          // Activities might be a single object
          if (day.activities.type) {
            activityTypesMap[packageIdKey].add(day.activities.type);
            console.log(`  ✅ [getPackagesActivityTypes] Added type "${day.activities.type}" (single object) from package ${packageIdKey}, day ${day.day_number}`);
          }
        } else {
          console.warn(`  ⚠️ [getPackagesActivityTypes] Unexpected activities structure for package ${packageIdKey}, day ${day.day_number}:`, typeof day.activities, day.activities);
        }
      } else {
        console.log(`  ℹ️ [getPackagesActivityTypes] No activities for package ${packageIdKey}, day ${day.day_number}`);
      }
    });

    // Convert Sets to Arrays
    const result = {};
    Object.keys(activityTypesMap).forEach(packageId => {
      result[packageId] = Array.from(activityTypesMap[packageId]);
    });

    console.log('🎯 [getPackagesActivityTypes] Final result:', {
      totalPackages: Object.keys(result).length,
      packageDayCounts: Object.entries(packageDayCounts).slice(0, 5),
      sampleResults: Object.entries(result).slice(0, 5).map(([id, types]) => ({
        packageId: id,
        types: types,
        typesCount: types.length
      }))
    });

    return result;
  } catch (error) {
    console.error('❌ [getPackagesActivityTypes] Error:', error);
    console.error('❌ [getPackagesActivityTypes] Error stack:', error.stack);
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
        destination_id,
        cities_covered,
        stay_breakdown,
        travel_styles,
        themes,
        difficulty,
        pace,
        highlights,
        includes,
        excludes,
        important_notes,
        arrival_point,
        departure_point,
        internal_transport,
        best_months,
        season_note,
        starting_price,
        currency,
        price_note,
        hero_image,
        thumbnail,
        gallery,
        is_active,
        is_featured,
        is_domestic,
        destinations (
          id,
          name,
          slug,
          country,
          region:regions(id, name, slug)
        )
      `)
      .eq('id', packageId)
      .single();

    if (packageError || !packageData) {
      console.error('Error fetching package details:', {
        message: packageError?.message,
        code: packageError?.code,
        details: packageError?.details,
        hint: packageError?.hint
      });
      return null;
    }

    // Fetch itinerary days with all fields
    const { data: itineraryData, error: itineraryError } = await supabase
      .from('itinerary_days')
      .select('*')
      .eq('package_id', packageId)
      .order('day_number', { ascending: true });

    if (itineraryError) {
      console.error('Error fetching itinerary:', itineraryError);
    }

    // Extract all activities with names for key_experiences
    const allActivities = [];
    if (itineraryData) {
      itineraryData.forEach(day => {
        if (day.activities && Array.isArray(day.activities)) {
          day.activities.forEach(activity => {
            if (activity && activity.name) {
              allActivities.push({
                name: activity.name,
                type: activity.type || 'other',
                highlight: activity.highlight || false,
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

    // Return complete package data with itinerary per Data_Structure.md Section 4
    return {
      ...packageData,
      activities: allActivities,
      activityTypes: activityTypes,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1512343879784-a960bf40e5f1?q=80&w=800&h=600&fit=crop'],
      itinerary: itineraryData || []
    };
  } catch (error) {
    console.error('Error in getPackageDetails:', error);
    return null;
  }
}

/**
 * Get package by slug (for public detail page)
 */
export async function getPackageBySlug(slug) {
  try {
    const { data: packageData, error: packageError } = await supabase
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
    const { data: itineraryData, error: itineraryError } = await supabase
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
 * Get destination by slug
 */
export async function getDestinationBySlug(slug) {
  try {
    const { data, error } = await supabase
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
    const { data: packagesData, error: packagesError } = await supabase
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

/**
 * Admin: Get package statistics
 */
export async function getPackageStats() {
  try {
    const [packagesResult, destinationsResult, inquiriesResult] = await Promise.all([
      supabase.from('packages').select('id, view_count, is_active', { count: 'exact' }),
      supabase.from('destinations').select('id', { count: 'exact' }),
      supabase.from('inquiries').select('id, status', { count: 'exact' }),
    ]);

    const packages = packagesResult.data || [];
    const totalViews = packages.reduce((sum, pkg) => sum + (pkg.view_count || 0), 0);
    const activePackages = packages.filter(p => p.is_active).length;

    const inquiries = inquiriesResult.data || [];
    const newInquiries = inquiries.filter(i => i.status === 'new').length;
    const contactedInquiries = inquiries.filter(i => i.status === 'contacted').length;
    const convertedInquiries = inquiries.filter(i => i.status === 'converted').length;

    return {
      totalPackages: packagesResult.count || 0,
      activePackages,
      totalDestinations: destinationsResult.count || 0,
      totalInquiries: inquiriesResult.count || 0,
      newInquiries,
      contactedInquiries,
      convertedInquiries,
      totalViews,
    };
  } catch (error) {
    console.error('Error getting package stats:', error);
    return null;
  }
}

/**
 * Admin: Get most viewed packages
 */
export async function getMostViewedPackages(limit = 5) {
  try {
    const { data, error } = await supabase
      .from('packages')
      .select(`
        id,
        title,
        slug,
        view_count,
        destinations (name)
      `)
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting most viewed packages:', error);
    return [];
  }
}

/**
 * Admin: Get package analytics
 */
export async function getPackageAnalytics() {
  try {
    const { data: packages, error } = await supabase
      .from('packages')
      .select(`
        id,
        title,
        slug,
        view_count,
        is_active,
        is_featured,
        nights,
        days,
        created_at,
        destinations (name, id)
      `);

    if (error) throw error;

    const allPackages = packages || [];

    // Packages by destination
    const packagesByDestination = {};
    allPackages.forEach(pkg => {
      const destName = pkg.destinations?.name || 'Unknown';
      packagesByDestination[destName] = (packagesByDestination[destName] || 0) + 1;
    });

    // Packages by duration (nights)
    const packagesByDuration = {
      '1-3 nights': 0,
      '4-6 nights': 0,
      '7-10 nights': 0,
      '11+ nights': 0,
    };
    allPackages.forEach(pkg => {
      const nights = pkg.nights || 0;
      if (nights <= 3) packagesByDuration['1-3 nights']++;
      else if (nights <= 6) packagesByDuration['4-6 nights']++;
      else if (nights <= 10) packagesByDuration['7-10 nights']++;
      else packagesByDuration['11+ nights']++;
    });

    // Featured packages
    const featuredPackages = allPackages.filter(p => p.is_featured);

    // Recently added (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentlyAdded = allPackages.filter(p => {
      const created = new Date(p.created_at);
      return created >= sevenDaysAgo;
    });

    // Average views
    const totalViews = allPackages.reduce((sum, p) => sum + (p.view_count || 0), 0);
    const avgViews = allPackages.length > 0 ? Math.round(totalViews / allPackages.length) : 0;

    // Top destinations by package count
    const topDestinations = Object.entries(packagesByDestination)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      packagesByDestination,
      packagesByDuration,
      featuredCount: featuredPackages.length,
      recentlyAddedCount: recentlyAdded.length,
      avgViews,
      topDestinations,
    };
  } catch (error) {
    console.error('Error getting package analytics:', error);
    return {
      packagesByDestination: {},
      packagesByDuration: { '1-3 nights': 0, '4-6 nights': 0, '7-10 nights': 0, '11+ nights': 0 },
      featuredCount: 0,
      recentlyAddedCount: 0,
      avgViews: 0,
      topDestinations: [],
    };
  }
}

/**
 * Admin: Get recently added packages
 */
export async function getRecentlyAddedPackages(limit = 5) {
  try {
    const { data, error } = await supabase
      .from('packages')
      .select(`
        id,
        title,
        slug,
        created_at,
        destinations (name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting recently added packages:', error);
    return [];
  }
}

/**
 * Admin: Get featured packages
 */
export async function getFeaturedPackagesAdmin(limit = 5) {
  try {
    const { data, error } = await supabase
      .from('packages')
      .select(`
        id,
        title,
        slug,
        view_count,
        destinations (name)
      `)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting featured packages:', error);
    return [];
  }
}

/**
 * Admin: Get recent inquiries
 */
export async function getRecentInquiries(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('inquiries')
      .select(`
        id,
        name,
        email,
        phone,
        status,
        package_id,
        packages (title),
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting recent inquiries:', error);
    return [];
  }
}

/**
 * Admin: Get packages with issues (missing data)
 */
export async function getPackagesWithIssues() {
  try {
    const { data, error } = await supabase
      .from('packages')
      .select(`
        id,
        title,
        slug,
        hero_image,
        destinations (name)
      `);

    if (error) throw error;

    const missingImages = (data || []).filter(pkg => !pkg.hero_image || pkg.hero_image.trim() === '');

    // Check for packages without itinerary
    const packagesWithoutItinerary = [];
    for (const pkg of data || []) {
      const { data: itinerary } = await supabase
        .from('itinerary_days')
        .select('id')
        .eq('package_id', pkg.id)
        .limit(1);

      if (!itinerary || itinerary.length === 0) {
        packagesWithoutItinerary.push(pkg);
      }
    }

    return {
      missingImages,
      missingItinerary: packagesWithoutItinerary,
    };
  } catch (error) {
    console.error('Error getting packages with issues:', error);
    return { missingImages: [], missingItinerary: [] };
  }
}

/**
 * Admin: Update package
 */
export async function updatePackage(id, data) {
  try {
    // Ensure we're using the correct column names (nights, days, not duration_nights, duration_days)
    const updateData = { ...data };
    
    // Remove non-database fields (joined/related objects)
    // These are read-only fields that come from joins, not actual columns
    const fieldsToRemove = [
      'destinations',      // Joined object from destination:destinations(...)
      'itinerary',         // Joined array from itinerary_days
      'region',            // Joined object from region:regions(...)
      'destination',       // Alternative name for destinations
      'created_at',        // Auto-generated, shouldn't be updated
      'updated_at',        // Auto-generated, shouldn't be updated
      'id',                // Primary key, shouldn't be updated
    ];
    
    fieldsToRemove.forEach(field => {
      delete updateData[field];
    });
    
    // Log what we're about to send (for debugging)
    console.log('📤 [updatePackage] Sending update data:', {
      id,
      fields: Object.keys(updateData),
      hasDestinations: 'destinations' in data,
      hasItinerary: 'itinerary' in data,
    });
    
    // Convert duration_nights/duration_days to nights/days if present
    if (updateData.duration_nights !== undefined) {
      updateData.nights = updateData.duration_nights;
      delete updateData.duration_nights;
    }
    if (updateData.duration_days !== undefined) {
      updateData.days = updateData.duration_days;
      delete updateData.duration_days;
    }
    
    // Handle field name mappings if needed
    // Database column might be 'difficulty' or 'difficulty_level'
    // Remove difficulty_level if present (database doesn't have this column)
    if (updateData.difficulty_level !== undefined) {
      // If difficulty is not set, use difficulty_level value
      if (updateData.difficulty === undefined) {
        updateData.difficulty = updateData.difficulty_level;
      }
      // Always remove difficulty_level as it's not a valid column
      delete updateData.difficulty_level;
    }
    
    // Handle travel_styles vs travel_style_ids
    if (updateData.travel_styles !== undefined && updateData.travel_style_ids === undefined) {
      // If travel_styles is provided as string array, keep it
      // Database might use travel_styles (TEXT[]) or travel_style_ids (UUID[])
      // Keep both for compatibility
    }
    
    // Ensure arrays are properly formatted
    if (updateData.stay_breakdown && !Array.isArray(updateData.stay_breakdown)) {
      // If it's a JSON string, parse it
      if (typeof updateData.stay_breakdown === 'string') {
        try {
          updateData.stay_breakdown = JSON.parse(updateData.stay_breakdown);
        } catch (e) {
          console.warn('Failed to parse stay_breakdown:', e);
          updateData.stay_breakdown = [];
        }
      } else {
        updateData.stay_breakdown = [];
      }
    }
    
    // Final check: remove any remaining object/array fields that aren't valid JSONB columns
    // Only keep primitive values, arrays of primitives, or valid JSONB structures
    const validUpdateData = {};
    const validColumns = [
      'title', 'subtitle', 'slug', 'description', 'destination_id',
      'nights', 'days', 'duration_display', 'starting_price', 'currency', 'price_note',
      'hero_image', 'thumbnail', 'is_active', 'is_featured', 'is_domestic',
      'highlights', 'includes', 'excludes', 'important_notes',
      'cities_covered', 'stay_breakdown', 'travel_styles', 'themes',
      'difficulty', 'pace', 'group_size',
      'arrival_point', 'departure_point', 'best_time_to_visit',
      'view_count', 'booking_count'
    ];
    
    for (const key in updateData) {
      if (validColumns.includes(key)) {
        validUpdateData[key] = updateData[key];
      } else {
        console.warn(`⚠️ [updatePackage] Filtering out invalid column: ${key}`);
      }
    }
    
    console.log('📤 [updatePackage] Final update data keys:', Object.keys(validUpdateData));

    const { data: updated, error } = await supabase
      .from('packages')
      .update(validUpdateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [updatePackage] Supabase error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        attemptedFields: Object.keys(validUpdateData)
      });
      throw error;
    }
    
    return { data: updated, error: null };
  } catch (error) {
    console.error('❌ [updatePackage] Error updating package:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      stack: error.stack
    });
    return { data: null, error };
  }
}

/**
 * Admin: Delete package
 */
export async function deletePackage(id) {
  try {
    const { error } = await supabase
      .from('packages')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting package:', error);
    return { error };
  }
}

/**
 * Admin: Update itinerary day
 */
export async function updateItineraryDay(id, data) {
  try {
    const { data: updated, error } = await supabase
      .from('itinerary_days')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data: updated, error: null };
  } catch (error) {
    console.error('Error updating itinerary day:', error);
    return { data: null, error };
  }
}

/**
 * Admin: Create itinerary day
 */
export async function createItineraryDay(packageId, data) {
  try {
    const { data: created, error } = await supabase
      .from('itinerary_days')
      .insert({
        package_id: packageId,
        ...data,
      })
      .select()
      .single();

    if (error) throw error;
    return { data: created, error: null };
  } catch (error) {
    console.error('Error creating itinerary day:', error);
    return { data: null, error };
  }
}

/**
 * Admin: Get all packages (for admin list)
 */
export async function getAllPackagesForAdmin() {
  try {
    const { data, error } = await supabase
      .from('packages')
      .select(`
        id,
        title,
        slug,
        is_active,
        view_count,
        created_at,
        destinations (name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting all packages for admin:', error);
    return [];
  }
}

/**
 * Admin: Get single package with full details for editing
 */
export async function getPackageForEdit(id) {
  try {
    console.log('🔍 [getPackageForEdit] Fetching package with id:', id);

    const { data, error } = await supabase
      .from('packages')
      .select(`
        *,
        destinations (id, name, slug)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ [getPackageForEdit] Supabase error:', error);
      throw error;
    }

    if (!data) {
      console.warn('⚠️ [getPackageForEdit] No data returned for id:', id);
      return null;
    }

    console.log('✅ [getPackageForEdit] Package loaded:', {
      id: data.id,
      title: data.title,
      hasDestination: !!data.destinations,
    });

    return data;
  } catch (error) {
    console.error('❌ [getPackageForEdit] Error getting package for edit:', error);
    return null;
  }
}

/**
 * Admin: Get itinerary days for a package
 */
export async function getItineraryDays(packageId) {
  try {
    const { data, error } = await supabase
      .from('itinerary_days')
      .select('*')
      .eq('package_id', packageId)
      .order('day_number', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting itinerary days:', error);
    return [];
  }
}


/**
 * Create a new destination
 */
export async function createDestination(name) {
  try {
    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const { data, error } = await supabase
      .from('destinations')
      .insert([
        { name, slug, is_active: true }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating destination:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error creating destination:', error);
    return null;
  }
}

/**
 * Get all destinations for admin (including inactive)
 */
export async function getAllDestinationsForAdmin() {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select(`
        *,
        region:regions(id, name, slug)
      `)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching destinations for admin:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllDestinationsForAdmin:', error);
    return [];
  }
}

/**
 * Get destination by ID for editing
 */
export async function getDestinationForEdit(id) {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select(`
        *,
        region:regions(id, name, slug)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching destination for edit:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getDestinationForEdit:', error);
    return null;
  }
}

/**
 * Update destination
 */
export async function updateDestination(id, data) {
  try {
    const updateData = { ...data };
    
    // Remove fields that shouldn't be updated directly
    const fieldsToRemove = ['id', 'created_at', 'updated_at', 'package_count', 'region'];
    fieldsToRemove.forEach(field => { delete updateData[field]; });

    // Valid columns in destinations table (only include columns that definitely exist)
    // Based on actual database schema - some columns from migration may not exist
    const validColumns = [
      'name', 'slug', 'country', 'country_code', 'description', 'region_id',
      'hero_image', 'thumbnail', 'highlights', 'best_months', 'visa_info',
      'currency', 'language', 'is_featured', 'is_active',
      'display_order', 'seo_title', 'seo_description'
      // Excluded: 'timezone', 'starting_price' - may not exist in actual database
    ];

    // Filter to only include valid columns
    const filteredData = {};
    for (const key in updateData) {
      if (validColumns.includes(key)) {
        filteredData[key] = updateData[key];
      } else {
        console.warn(`⚠️ [updateDestination] Filtering out column: ${key}`);
      }
    }

    const { data: updated, error } = await supabase
      .from('destinations')
      .update(filteredData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating destination:', error);
      throw error;
    }

    return updated;
  } catch (error) {
    console.error('Error in updateDestination:', error);
    throw error;
  }
}

/**
 * Delete destination
 */
export async function deleteDestination(id) {
  try {
    const { error } = await supabase
      .from('destinations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting destination:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteDestination:', error);
    throw error;
  }
}

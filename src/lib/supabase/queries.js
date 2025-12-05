'use client';

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
          region
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
    const { data: updated, error } = await supabase
      .from('packages')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data: updated, error: null };
  } catch (error) {
    console.error('Error updating package:', error);
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
        destinations (id, name)
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


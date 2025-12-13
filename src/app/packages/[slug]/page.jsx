import { getPackageBySlug } from '@/lib/supabase/server-queries';
import { supabaseAdmin } from '@/lib/supabase/server';
import PackageDetailClient from './PackageDetailClient';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  if (!slug) {
    return {
      title: 'Package Not Found | Turquoise Holidays',
      description: 'The requested travel package could not be found.',
    };
  }

  try {
    // Use server-side Supabase client for metadata generation
    const { data: packageData, error } = await supabaseAdmin
      .from('packages')
      .select(`
        title,
        subtitle,
        description,
        duration_display,
        destinations (
          name
        )
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    
    if (error || !packageData) {
      return {
        title: 'Package Not Found | Turquoise Holidays',
        description: 'The requested travel package could not be found.',
      };
    }

    // Get destination name from destinations relation
    // Supabase returns destinations as an object (not array) for foreign key relationships
    const destinationName = packageData.destinations?.name || '';
    
    // Format title: "{destination.name} - {package.title} | Turquoise Holidays"
    const title = destinationName 
      ? `${destinationName} - ${packageData.title} | Turquoise Holidays`
      : `${packageData.title} | Turquoise Holidays`;

    return {
      title,
      description: packageData.subtitle || packageData.description?.replace(/<[^>]*>/g, '').substring(0, 160) || `Explore ${packageData.title} with Turquoise Holidays. ${packageData.duration_display || ''} travel package.`,
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Package | Turquoise Holidays',
      description: 'Explore travel packages with Turquoise Holidays.',
    };
  }
}

export default async function PackageDetailPage({ params }) {
  const { slug } = await params;
  
  // Pre-fetch package data for initial render
  let initialPackageData = null;
  let error = null;
  
  if (slug) {
    try {
      initialPackageData = await getPackageBySlug(slug);
      if (!initialPackageData) {
        error = 'Package not found';
      }
    } catch (err) {
      console.error('Error pre-fetching package:', err);
      error = err.message || 'Failed to load package';
    }
  } else {
    error = 'Invalid package slug';
  }

  // Return fallback UI if there's an error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Package Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <a
            href="/packages"
            className="inline-block px-6 py-3 bg-turquoise-600 hover:bg-turquoise-700 text-white rounded-lg font-semibold transition-colors"
          >
            Browse Packages
          </a>
        </div>
      </div>
    );
  }

  return <PackageDetailClient initialPackageData={initialPackageData} slug={slug} />;
}

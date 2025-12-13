import { getDestinationBySlug } from '@/lib/supabase/server-queries';
import { supabaseAdmin } from '@/lib/supabase/server';
import DestinationDetailClient from './DestinationDetailClient';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  if (!slug) {
    return {
      title: 'Destination Not Found | Turquoise Holidays',
      description: 'The requested destination could not be found.',
    };
  }

  try {
    // Use server-side Supabase client for metadata generation
    const { data: destinationData, error } = await supabaseAdmin
      .from('destinations')
      .select('name, description')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    
    if (error || !destinationData) {
      return {
        title: 'Destination Not Found | Turquoise Holidays',
        description: 'The requested destination could not be found.',
      };
    }

    return {
      title: `${destinationData.name} | Turquoise Holidays`,
      description: destinationData.description?.replace(/<[^>]*>/g, '').substring(0, 160) || `Explore ${destinationData.name} with Turquoise Holidays. Discover amazing travel packages and experiences.`,
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Destination | Turquoise Holidays',
      description: 'Explore destinations with Turquoise Holidays.',
    };
  }
}

export default async function DestinationDetailPage({ params }) {
  const { slug } = await params;
  
  // Pre-fetch destination data for initial render
  let initialDestinationData = null;
  let error = null;
  
  if (slug) {
    try {
      initialDestinationData = await getDestinationBySlug(slug);
      if (!initialDestinationData) {
        error = 'Destination not found';
      }
    } catch (err) {
      console.error('Error pre-fetching destination:', err);
      error = err.message || 'Failed to load destination';
    }
  } else {
    error = 'Invalid destination slug';
  }

  // Return fallback UI if there's an error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Destination Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <a
            href="/destinations"
            className="inline-block px-6 py-3 bg-turquoise-600 hover:bg-turquoise-700 text-white rounded-lg font-semibold transition-colors"
          >
            Browse Destinations
          </a>
        </div>
      </div>
    );
  }

  return <DestinationDetailClient initialDestinationData={initialDestinationData} slug={slug} />;
}


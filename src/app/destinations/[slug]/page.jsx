import { getDestinationBySlug } from '@/lib/supabase/queries';
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
  if (slug) {
    try {
      initialDestinationData = await getDestinationBySlug(slug);
    } catch (error) {
      console.error('Error pre-fetching destination:', error);
    }
  }

  return <DestinationDetailClient initialDestinationData={initialDestinationData} slug={slug} />;
}


import { getPackageBySlug } from '@/lib/supabase/queries';
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
    const packageData = await getPackageBySlug(slug);
    
    if (!packageData) {
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
  if (slug) {
    try {
      initialPackageData = await getPackageBySlug(slug);
    } catch (error) {
      console.error('Error pre-fetching package:', error);
    }
  }

  return <PackageDetailClient initialPackageData={initialPackageData} slug={slug} />;
}

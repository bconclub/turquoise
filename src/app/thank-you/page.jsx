import { Suspense } from 'react';
import ThankYouContent from './ThankYouContent';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <>
          <Header />
          <main className="min-h-screen bg-gray-50 pt-20 md:pt-24">
            <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-600"></div>
              </div>
            </div>
          </main>
          <Footer />
        </>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}


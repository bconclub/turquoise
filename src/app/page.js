import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SearchBar from '@/components/search/SearchBar';

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center text-white overflow-hidden pt-20 md:pt-24">
          <Image
            src="/Home.jpg"
            alt="Turquoise Holidays - Beautiful travel destination"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40 z-10" />

          <div className="container relative z-20 text-center px-4">
            <p className="text-sm md:text-base uppercase tracking-widest mb-4 text-turquoise-200">
              Explore the world
            </p>
            <h1 className="text-[2.7225rem] md:text-[3.63rem] lg:text-[4.5375rem] font-bold mb-6 leading-none">
              Inspiring Destinations<br />Within Your Reach
            </h1>
            
            {/* Search Bar */}
            <SearchBar />
          </div>

        </section>

        {/* Exotic Destinations Section */}
        <section className="py-20 bg-gradient-to-b from-cream to-white">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-turquoise-900 mb-4">
                Exotic Destinations, Expertly Curated
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Handpicked locations that will take your breath away
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Large Featured Destination */}
              <div className="md:row-span-2 relative h-[500px] rounded-3xl overflow-hidden group cursor-pointer">
                <Image
                  src="https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=2070"
                  alt="Switzerland Alps - Matterhorn"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-3xl font-bold mb-2">Switzerland</h3>
                  <p className="text-sm text-gray-200">Alpine Adventures</p>
                </div>
              </div>

              {/* Temple Destination */}
              <div className="relative h-[240px] rounded-3xl overflow-hidden group cursor-pointer">
                <Image
                  src="https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=2070"
                  alt="Ancient Buddhist Temple Thailand"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-1">Thailand</h3>
                  <p className="text-sm text-gray-200">Cultural Heritage</p>
                </div>
              </div>

              {/* Balloon Destination */}
              <div className="relative h-[240px] rounded-3xl overflow-hidden group cursor-pointer">
                <Image
                  src="https://images.unsplash.com/photo-1609137144813-7d9921338f24?q=80&w=2070"
                  alt="Cappadocia Hot Air Balloons Turkey"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-1">Turkey</h3>
                  <p className="text-sm text-gray-200">Hot Air Balloons</p>
                </div>
              </div>

              {/* Islands Destination */}
              <div className="md:col-span-2 relative h-[240px] rounded-3xl overflow-hidden group cursor-pointer">
                <Image
                  src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=2065"
                  alt="Maldives Tropical Islands"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-1">Maldives</h3>
                  <p className="text-sm text-gray-200">Tropical Paradise</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Explore By Experience Section */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-turquoise-900 mb-4">
                Explore By Experience
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Choose your adventure style and let us craft the perfect journey
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="relative h-[350px] rounded-3xl overflow-hidden group cursor-pointer">
                <Image
                  src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2071"
                  alt="Vibrant City Experience"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white p-6">
                    <h3 className="text-3xl font-bold mb-3">Vibrant Cities</h3>
                    <p className="text-sm opacity-90">Experience urban culture</p>
                  </div>
                </div>
              </div>

              <div className="relative h-[350px] rounded-3xl overflow-hidden group cursor-pointer">
                <Image
                  src="https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=2071"
                  alt="Historic Travel Experience"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white p-6">
                    <h3 className="text-3xl font-bold mb-3">Historic Travel</h3>
                    <p className="text-sm opacity-90">Journey through time</p>
                  </div>
                </div>
              </div>

              <div className="relative h-[350px] rounded-3xl overflow-hidden group cursor-pointer">
                <Image
                  src="https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=2070"
                  alt="Desert Safari Experience"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white p-6">
                    <h3 className="text-3xl font-bold mb-3">Desert Safari</h3>
                    <p className="text-sm opacity-90">Adventure awaits</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Turquoise Section */}
        <section className="py-20 bg-turquoise-600 text-white">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-8">
                  Why Turquoise<br />Holidays?
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Craft and Flexibility</h3>
                      <p className="text-turquoise-100">Tailor-made itineraries designed around your preferences</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">24/7 Travel Insights</h3>
                      <p className="text-turquoise-100">Expert guidance whenever you need it</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Unmatched Experiences</h3>
                      <p className="text-turquoise-100">Access to exclusive destinations and activities</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Best Value Guarantee</h3>
                      <p className="text-turquoise-100">Premium quality at competitive prices</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative h-[500px] rounded-3xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070"
                  alt="Mountain landscape at sunset"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-turquoise-600/20"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Your Memories Section */}
        <section className="py-20 bg-gradient-to-b from-white to-cream">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-turquoise-900 mb-4">
                Your Memories, Captured Forever
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Every journey tells a story
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                'photo-1488646953014-85cb44e25828',
                'photo-1469854523086-cc02fe5d8800',
                'photo-1476514525535-07fb3b4ae5f1',
                'photo-1530789253388-582c481c54b0',
                'photo-1503220317375-aaad61436b1b',
                'photo-1500835556837-99ac94a94552',
                'photo-1507525428034-b723cf961d3e',
                'photo-1476900543704-4312b78632f8'
              ].map((id, i) => (
                <div key={i} className="relative h-[200px] rounded-2xl overflow-hidden group cursor-pointer">
                  <Image
                    src={`https://images.unsplash.com/${id}?q=80&w=800`}
                    alt={`Travel memory ${i + 1}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The Turquoise Way Section */}
        <section className="py-20 bg-turquoise-700 text-white">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                The Turquoise Way
              </h2>
              <p className="text-turquoise-100 max-w-2xl mx-auto">
                Our proven process for creating unforgettable journeys
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                { title: 'Discover', desc: 'Share your travel dreams' },
                { title: 'Design', desc: 'We craft your perfect itinerary' },
                { title: 'Refine', desc: 'Customize every detail' },
                { title: 'Experience', desc: 'Enjoy your journey' }
              ].map((step, i) => {
                const images = [
                  'photo-1488646953014-85cb44e25828',
                  'photo-1488085061387-422e29b40080',
                  'photo-1436491865332-7a61a109cc05',
                  'photo-1501785888041-af3ef285b470'
                ];
                return (
                  <div key={i} className="relative h-[300px] rounded-3xl overflow-hidden group cursor-pointer">
                    <Image
                      src={`https://images.unsplash.com/${images[i]}?q=80&w=800`}
                      alt={step.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-turquoise-900/90 via-turquoise-700/60 to-turquoise-500/40" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 text-2xl font-bold">
                        {i + 1}
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                      <p className="text-sm text-turquoise-100">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-32 text-white overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070"
            alt="Travel destination"
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-turquoise-900/70" />
          <div className="absolute inset-0 bg-black/30" />

          <div className="container relative z-10 text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Ready for your next great escape?
            </h2>
            <p className="text-xl mb-8 text-gray-200 max-w-2xl mx-auto">
              Let's start planning your dream vacation today
            </p>
            <Link
              href="/customize"
              className="inline-block bg-white text-turquoise-900 hover:bg-gray-100 px-10 py-4 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Start Planning
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

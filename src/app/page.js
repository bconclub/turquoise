import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center text-white overflow-hidden">
          <Image
            src="/hero-beach.png"
            alt="Tropical beach destination"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40 z-10" />

          <div className="container relative z-20 text-center px-4">
            <p className="text-sm md:text-base uppercase tracking-widest mb-4 text-turquoise-200">
              Explore the world
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              Inspiring Destinations<br />Within Your Reach
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-200">
              Discover breathtaking places and create memories that last forever
            </p>
            <Link
              href="/destinations"
              className="inline-block bg-turquoise-500 hover:bg-turquoise-400 text-white px-10 py-4 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Explore Now
            </Link>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/80">
            <span className="text-xs uppercase tracking-wider">Scroll</span>
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
              <div className="w-1 h-3 bg-white/70 rounded-full animate-bounce"></div>
            </div>
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
                  src="/dest-matterhorn.png"
                  alt="Switzerland Alps"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
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
                  src="/dest-temple.png"
                  alt="Ancient Temples"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
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
                  src="/dest-balloon.png"
                  alt="Cappadocia"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
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
                  src="/dest-islands.png"
                  alt="Maldives Islands"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
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
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-pink-600" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white p-6">
                    <h3 className="text-3xl font-bold mb-3">Vibrant Cities</h3>
                    <p className="text-sm opacity-90">Experience urban culture</p>
                  </div>
                </div>
              </div>

              <div className="relative h-[350px] rounded-3xl overflow-hidden group cursor-pointer bg-gradient-to-br from-amber-700 to-orange-900">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white p-6">
                    <h3 className="text-3xl font-bold mb-3">Historic Travel</h3>
                    <p className="text-sm opacity-90">Journey through time</p>
                  </div>
                </div>
              </div>

              <div className="relative h-[350px] rounded-3xl overflow-hidden group cursor-pointer bg-gradient-to-br from-yellow-600 to-red-700">
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
                <div className="absolute inset-0 bg-gradient-to-br from-turquoise-400 to-turquoise-800"></div>
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
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="relative h-[200px] rounded-2xl overflow-hidden group cursor-pointer">
                  <div className={`absolute inset-0 bg-gradient-to-br ${i % 4 === 0 ? 'from-blue-400 to-blue-600' :
                      i % 4 === 1 ? 'from-orange-400 to-orange-600' :
                        i % 4 === 2 ? 'from-green-400 to-green-600' :
                          'from-purple-400 to-purple-600'
                    }`} />
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
              ].map((step, i) => (
                <div key={i} className="relative h-[300px] rounded-3xl overflow-hidden group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-turquoise-500 to-turquoise-900" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 text-2xl font-bold">
                      {i + 1}
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                    <p className="text-sm text-turquoise-100">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-32 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-turquoise-900 to-turquoise-700" />
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

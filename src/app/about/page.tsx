import { Heart, Shield, Users } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-indigo-900 py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
            Our Mission
          </h1>
          <p className="mt-6 text-xl text-indigo-100 max-w-3xl mx-auto leading-relaxed">
            We believe every dog deserves a loving home. Our platform connects passionate dog lovers with beautiful companions looking for their forever family.
          </p>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Why We Do It</h2>
            <div className="mt-2 h-1 w-20 bg-indigo-600 mx-auto rounded"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:-translate-y-1 transition-transform">
              <div className="mx-auto w-16 h-16 bg-rose-100 text-rose-600 flex items-center justify-center rounded-full mb-6">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Compassion First</h3>
              <p className="text-gray-600 leading-relaxed">
                We prioritize the well-being of the dogs above all else. Our goal is to ensure they find safe, caring, and permanent homes where they can thrive.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:-translate-y-1 transition-transform">
              <div className="mx-auto w-16 h-16 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded-full mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Trust & Safety</h3>
              <p className="text-gray-600 leading-relaxed">
                We maintain a secure platform where users can safely interact, share profiles, and communicate without compromising their privacy or security.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:-translate-y-1 transition-transform">
              <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 flex items-center justify-center rounded-full mb-6">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Community Driven</h3>
              <p className="text-gray-600 leading-relaxed">
                Our platform is built for and by dog lovers. We foster a supportive community that shares advice, stories, and a mutual love for our canine friends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:gap-16">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <img
                src="https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&q=80"
                alt="Happy dog with owner"
                className="rounded-3xl shadow-xl object-cover h-[500px] w-full"
              />
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">The Story Behind DogProfiles</h2>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  It started with a simple observation: there were too many wonderful dogs struggling to find visibility, and too many eager families who couldn't find the right companion.
                </p>
                <p>
                  Traditional platforms were either too complicated, heavily outdated, or lacked the visual appeal needed to let these dogs' personalities shine through. We wanted to build something better—a premium, seamless experience that makes discovering your next best friend a joy rather than a chore.
                </p>
                <p>
                  Today, DogProfiles serves as a modern bridge. Whether you are looking to adopt, or you are helping a dog find a new home, we provide the tools to make those beautiful connections happen.
                </p>
              </div>
              <div className="mt-10">
                <Link
                  href="/register"
                  className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all hover:-translate-y-0.5"
                >
                  Join Our Community
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

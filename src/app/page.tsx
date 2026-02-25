import Link from 'next/link';
import Image from 'next/image';

const tournaments = [
  {
    year: 2021,
    label: 'First Annual',
    location: 'Palm Springs, California',
    logo: '/logos/rgao-2021.png',
  },
  {
    year: 2022,
    label: '2nd Annual',
    location: 'Pinehurst, North Carolina',
    logo: '/logos/rgao-2022.png',
  },
  {
    year: 2023,
    label: '3rd Annual',
    location: 'Scottsdale, Arizona',
    logo: '/logos/rgao-2023.png',
  },
  {
    year: 2024,
    label: '4th Annual',
    location: 'San Diego, California',
    logo: '/logos/rgao-2024.png',
  },
  {
    year: 2025,
    label: '5th Annual',
    location: 'Charleston, South Carolina',
    logo: '/logos/rgao-2025.png',
  },
  {
    year: 2026,
    label: '6th Annual',
    location: 'Cabo San Lucas, Mexico',
    logo: '/logos/rgao-2026.png',
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-[#1a4731] text-[#f5f0e8] py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)',
            backgroundSize: '20px 20px'
          }} />
        </div>
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-40">
              <Image
                src="/logos/rgao-2026.png"
                alt="RGAO 2026 - 6th Annual - Cabo San Lucas, Mexico"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>
          <div className="inline-block border border-[#c9a84c]/40 px-4 py-1 rounded-full text-[#c9a84c] text-sm font-medium mb-4 uppercase tracking-widest">
            Est. 2021
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-[#f5f0e8]">
            Republican Golf
            <span className="block text-[#c9a84c]">Association Open</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#f5f0e8]/80 mb-3 italic">
            &ldquo;Excellence on Every Fairway&rdquo;
          </p>
          <p className="text-[#f5f0e8]/70 max-w-2xl mx-auto mb-10">
            The premier annual golf tournament celebrating skill, tradition, and camaraderie.
            Join us for the 2026 RGAO Championship in Cabo San Lucas, Mexico.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-[#c9a84c] text-[#1a4731] px-8 py-3 rounded-lg font-bold text-lg hover:bg-[#b8943a] transition-colors shadow-lg"
            >
              View Leaderboard
            </Link>
            <Link
              href="/draft"
              className="border-2 border-[#c9a84c] text-[#c9a84c] px-8 py-3 rounded-lg font-bold text-lg hover:bg-[#c9a84c] hover:text-[#1a4731] transition-colors"
            >
              Join the Draft
            </Link>
          </div>
        </div>
      </section>

      {/* Tournament Info Banner */}
      <section className="bg-[#c9a84c] py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 text-[#1a4731] font-semibold text-sm">
            <span>📅 6th Annual Tournament: 2026</span>
            <span>📍 Cabo San Lucas, Mexico</span>
            <span>⛳ 6 Years of RGAO</span>
            <span>🏆 Who Will Take the Title?</span>
          </div>
        </div>
      </section>

      {/* Tournament History / Logos Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <div className="text-[#c9a84c] font-semibold uppercase tracking-widest text-sm mb-2">Our Journey</div>
            <h2 className="text-4xl font-bold text-[#1a4731] mb-3">Tournament History</h2>
            <p className="text-[#1a4731]/60 max-w-2xl mx-auto">
              From our inaugural event in Palm Springs to the shores of Cabo San Lucas, the RGAO has
              grown into a tradition unlike any other.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {tournaments.map((t) => (
              <div
                key={t.year}
                className={`flex flex-col items-center text-center rounded-2xl p-5 border transition-transform hover:scale-105 ${
                  t.year === 2026
                    ? 'bg-[#1a4731] border-[#c9a84c] shadow-lg shadow-[#c9a84c]/20'
                    : 'bg-[#f5f0e8] border-[#c9a84c]/20'
                }`}
              >
                <div className="relative w-24 h-32 mb-3">
                  <Image
                    src={t.logo}
                    alt={`RGAO ${t.year} - ${t.label} - ${t.location}`}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className={`text-lg font-bold mb-0.5 ${
                  t.year === 2026 ? 'text-[#c9a84c]' : 'text-[#1a4731]'
                }`}>
                  {t.year}
                </div>
                <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                  t.year === 2026 ? 'text-[#f5f0e8]/80' : 'text-[#c9a84c]'
                }`}>
                  {t.label}
                </div>
                <div className={`text-xs leading-tight ${
                  t.year === 2026 ? 'text-[#f5f0e8]/60' : 'text-[#1a4731]/60'
                }`}>
                  {t.location}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[#f5f0e8]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '16', label: 'Players Registered' },
              { value: '6', label: 'Tournaments Hosted' },
              { value: '5', label: 'Past Champions' },
              { value: '2', label: 'Draft Teams' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl p-6 border border-[#c9a84c]/20">
                <div className="text-4xl font-bold text-[#1a4731] mb-1">{stat.value}</div>
                <div className="text-[#1a4731]/60 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-[#c9a84c] font-semibold uppercase tracking-widest text-sm mb-3">About the Tournament</div>
              <h2 className="text-4xl font-bold text-[#1a4731] mb-5">A Tradition of Excellence</h2>
              <p className="text-[#1a4731]/70 mb-4 leading-relaxed">
                The Republican Golf Association Open has been the premier annual golf event since its
                founding in 2021. What started as a friendly gathering of golf enthusiasts in Palm Springs
                has grown into a fiercely competitive tournament spanning six years and six incredible destinations.
              </p>
              <p className="text-[#1a4731]/70 mb-6 leading-relaxed">
                From the deserts of Arizona to the coasts of South Carolina, every year our members
                compete with the same passion and dedication that defines the spirit of our association.
                This year, we head international for the first time — Cabo San Lucas, Mexico.
              </p>
              <Link
                href="/records"
                className="inline-flex items-center text-[#c9a84c] font-semibold hover:text-[#1a4731] transition-colors"
              >
                View Historic Records →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '🏆', title: 'Championship Trophy', desc: 'The coveted RGAO trophy, awarded to our annual champion' },
                { icon: '📊', title: 'Live Scoring', desc: 'Real-time leaderboard updates throughout the tournament' },
                { icon: '🤝', title: 'Fantasy Draft', desc: 'Build your dream team with our interactive draft board' },
                { icon: '📝', title: 'Tournament Blog', desc: 'News, interviews, and course analysis from our experts' },
              ].map((item) => (
                <div key={item.title} className="bg-[#f5f0e8] rounded-xl p-5 border border-[#c9a84c]/20 shadow-sm">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="font-bold text-[#1a4731] text-sm mb-1">{item.title}</div>
                  <div className="text-[#1a4731]/60 text-xs">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#1a4731] py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-[#f5f0e8] mb-4">Ready to Compete?</h2>
          <p className="text-[#f5f0e8]/70 mb-8">
            Join the 2026 RGAO in Cabo San Lucas and experience the pinnacle of our annual golf tradition.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard" className="bg-[#c9a84c] text-[#1a4731] px-8 py-3 rounded-lg font-bold hover:bg-[#b8943a] transition-colors">
              View Current Standings
            </Link>
            <Link href="/blog" className="border border-[#f5f0e8]/40 text-[#f5f0e8] px-8 py-3 rounded-lg font-bold hover:bg-[#f5f0e8]/10 transition-colors">
              Read Tournament Blog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

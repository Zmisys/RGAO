import Link from 'next/link';

const sponsors = [
  { name: 'Eagle Ridge Country Club', tier: 'Platinum' },
  { name: 'Fairway Financial Group', tier: 'Gold' },
  { name: 'Par Excellence Insurance', tier: 'Gold' },
  { name: 'Birdie\'s Sports Equipment', tier: 'Silver' },
  { name: 'The 19th Hole Restaurant', tier: 'Silver' },
  { name: 'Green & Associates Law', tier: 'Bronze' },
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
            <div className="bg-[#c9a84c] rounded-full w-24 h-24 flex items-center justify-center text-5xl shadow-2xl">
              ⛳
            </div>
          </div>
          <div className="inline-block border border-[#c9a84c]/40 px-4 py-1 rounded-full text-[#c9a84c] text-sm font-medium mb-4 uppercase tracking-widest">
            Est. 2017
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
            Join us for the 2024 RGAO Championship.
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
            <span>📅 Tournament Date: October 15–18, 2024</span>
            <span>📍 Eagle Ridge Country Club</span>
            <span>⛳ 72-Hole Stroke Play</span>
            <span>🏆 $10,000 Prize Pool</span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '12', label: 'Players Registered' },
              { value: '7', label: 'Tournaments Held' },
              { value: '6', label: 'Past Champions' },
              { value: '4', label: 'Draft Teams' },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#f5f0e8] rounded-xl p-6 border border-[#c9a84c]/20">
                <div className="text-4xl font-bold text-[#1a4731] mb-1">{stat.value}</div>
                <div className="text-[#1a4731]/60 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-[#f5f0e8]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-[#c9a84c] font-semibold uppercase tracking-widest text-sm mb-3">About the Tournament</div>
              <h2 className="text-4xl font-bold text-[#1a4731] mb-5">A Tradition of Excellence</h2>
              <p className="text-[#1a4731]/70 mb-4 leading-relaxed">
                The Republican Golf Association Open has been the premier annual golf event since its founding in 2017.
                What started as a friendly gathering of golf enthusiasts has grown into a fiercely competitive tournament
                with a rich tradition of excellence.
              </p>
              <p className="text-[#1a4731]/70 mb-6 leading-relaxed">
                Every year, our members compete on championship-caliber courses with the same passion and dedication
                that defines both the game of golf and the spirit of our association.
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
                { icon: '��', title: 'Tournament Blog', desc: 'News, interviews, and course analysis from our experts' },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-xl p-5 border border-[#c9a84c]/20 shadow-sm">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="font-bold text-[#1a4731] text-sm mb-1">{item.title}</div>
                  <div className="text-[#1a4731]/60 text-xs">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Sponsors */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="text-[#c9a84c] font-semibold uppercase tracking-widest text-sm mb-2">Our Partners</div>
            <h2 className="text-3xl font-bold text-[#1a4731]">Tournament Sponsors</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {sponsors.map((s) => (
              <div key={s.name} className="flex flex-col items-center justify-center bg-[#f5f0e8] rounded-xl p-4 border border-[#c9a84c]/20 text-center">
                <div className={`text-xs font-bold px-2 py-0.5 rounded-full mb-2 ${
                  s.tier === 'Platinum' ? 'bg-gray-300 text-gray-700' :
                  s.tier === 'Gold' ? 'bg-[#c9a84c] text-[#1a4731]' :
                  s.tier === 'Silver' ? 'bg-gray-200 text-gray-600' :
                  'bg-amber-700 text-white'
                }`}>{s.tier}</div>
                <div className="text-[#1a4731] text-sm font-medium">{s.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#1a4731] py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-[#f5f0e8] mb-4">Ready to Compete?</h2>
          <p className="text-[#f5f0e8]/70 mb-8">
            Join the 2024 RGAO and experience the pinnacle of our annual golf tradition.
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

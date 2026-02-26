import Link from 'next/link';
import { logo2021, logo2022, logo2023, logo2024, logo2025, logo2026 } from '@/data/logos';

const pastTournaments = [
  { year: 2021, location: 'Palm Springs, CA', logo: logo2021 },
  { year: 2022, location: 'Pinehurst, NC', logo: logo2022 },
  { year: 2023, location: 'Scottsdale, AZ', logo: logo2023 },
  { year: 2024, location: 'San Diego, CA', logo: logo2024 },
  { year: 2025, location: 'Charleston, SC', logo: logo2025 },
];

const courses = [
  {
    round: 1,
    name: 'El Cardonal',
    format: '2v2 Cart Score (net)',
    day: 'Thursday',
    time: '1:00 PM',
    teeBox: 'III',
    yardage: '6,291',
  },
  {
    round: 2,
    name: 'The Oasis Short Course',
    format: '2v2 Scramble',
    day: 'Friday',
    time: '9:00 AM',
    teeBox: '',
    yardage: '',
  },
  {
    round: 3,
    name: 'The Dunes Course',
    format: '2v2 Best Ball (net)',
    day: 'Friday',
    time: '1:00 PM',
    teeBox: 'III',
    yardage: '6,427',
  },
  {
    round: 4,
    name: 'Solmar Golf Links',
    format: '1v1 Singles Match Play (net)',
    day: 'Saturday',
    time: '8:10 AM',
    teeBox: 'Blue',
    yardage: '6,311',
  },
];

export default function HomePage() {
  return (
    <div>
      {/* ===== HERO — CABO 2026 ===== */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#1a4731]">
        {/* Layered background — sun glow + ocean gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f2d1f] via-[#1a4731] to-[#1a4731]" />
          {/* Sun glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(ellipse at center, #c9a84c 0%, transparent 70%)',
            }}
          />
          {/* Subtle pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)',
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          {/* Location tag */}
          <div className="inline-flex items-center gap-2 border border-[#c9a84c]/30 bg-[#c9a84c]/10 backdrop-blur-sm px-5 py-2 rounded-full mb-8">
            <span className="text-[#c9a84c] text-sm font-bold uppercase tracking-[0.2em]">
              Cabo San Lucas, Mexico
            </span>
          </div>

          {/* Main 2026 logo */}
          <div className="flex justify-center mb-8">
            <img
              src={logo2026}
              alt="RGAO 2026 — 6th Annual — Cabo San Lucas, Mexico"
              className="w-48 h-60 md:w-64 md:h-80 object-contain drop-shadow-2xl hero-logo-glow"
            />
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-[#f5f0e8] mb-3 tracking-tight">
            RGAO <span className="text-[#c9a84c]">2026</span>
          </h1>

          <p className="text-lg md:text-xl text-[#f5f0e8]/60 font-light mb-2 tracking-wide uppercase">
            6th Annual &middot; Republican Golf Association Open
          </p>
          <p className="text-[#c9a84c] text-lg md:text-2xl italic font-medium mb-10">
            &ldquo;Where the Desert Meets the Sea&rdquo;
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-[#c9a84c] text-[#1a4731] px-10 py-4 rounded-lg font-bold text-lg hover:bg-[#b8943a] transition-all shadow-lg shadow-[#c9a84c]/20 hover:shadow-[#c9a84c]/40"
            >
              View Leaderboard
            </Link>
            <Link
              href="/draft"
              className="border-2 border-[#c9a84c]/60 text-[#c9a84c] px-10 py-4 rounded-lg font-bold text-lg hover:bg-[#c9a84c] hover:text-[#1a4731] transition-all"
            >
              Join the Draft
            </Link>
          </div>

          {/* Scroll hint */}
          <div className="mt-16 animate-bounce text-[#c9a84c]/40">
            <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* ===== DESTINATION BANNER ===== */}
      <section className="bg-[#c9a84c] py-5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-2 text-[#1a4731] font-bold text-sm tracking-wide">
            <span>CABO SAN LUCAS</span>
            <span className="text-[#1a4731]/40 hidden sm:inline">&bull;</span>
            <span>BAJA CALIFORNIA SUR</span>
            <span className="text-[#1a4731]/40 hidden sm:inline">&bull;</span>
            <span>MEXICO</span>
            <span className="text-[#1a4731]/40 hidden sm:inline">&bull;</span>
            <span>2026</span>
          </div>
        </div>
      </section>

      {/* ===== THE DESTINATION ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <div className="text-[#c9a84c] font-semibold uppercase tracking-[0.2em] text-sm mb-3">
              The Destination
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[#1a4731] mb-5">
              Cabo San Lucas
            </h2>
            <p className="text-[#1a4731]/70 max-w-3xl mx-auto text-lg leading-relaxed">
              For the first time in RGAO history, we go international. At the southern tip of
              the Baja Peninsula, where the Pacific Ocean meets the Sea of Cortez,
              16 competitors will battle across four world-class courses in one of golf&apos;s
              most breathtaking destinations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-[#1a4731] to-[#0f2d1f] rounded-2xl p-8 text-center">
              <div className="text-4xl font-black text-[#c9a84c] mb-1">4</div>
              <div className="text-[#f5f0e8] font-bold mb-2">Championship Rounds</div>
              <div className="text-[#f5f0e8]/50 text-sm">
                Three days of competition across four distinct courses in the Cabo corridor
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#1a4731] to-[#0f2d1f] rounded-2xl p-8 text-center">
              <div className="text-4xl font-black text-[#c9a84c] mb-1">16</div>
              <div className="text-[#f5f0e8] font-bold mb-2">Competitors</div>
              <div className="text-[#f5f0e8]/50 text-sm">
                Two captains. Two teams. One Ryder Cup-style showdown under the Mexican sun
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#1a4731] to-[#0f2d1f] rounded-2xl p-8 text-center">
              <div className="text-4xl font-black text-[#c9a84c] mb-1">20</div>
              <div className="text-[#f5f0e8] font-bold mb-2">Points at Stake</div>
              <div className="text-[#f5f0e8]/50 text-sm">
                First to 10.5 wins. Every match, every hole, every shot matters
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== THE COURSES ===== */}
      <section className="py-20 bg-[#f5f0e8]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <div className="text-[#c9a84c] font-semibold uppercase tracking-[0.2em] text-sm mb-3">
              The Courses
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[#1a4731] mb-5">
              Four Rounds. Four Courses.
            </h2>
            <p className="text-[#1a4731]/60 max-w-2xl mx-auto">
              From the Tiger Woods-designed El Cardonal to the oceanside Solmar Golf Links,
              every round brings a new challenge.
            </p>
          </div>

          <div className="space-y-4">
            {courses.map((c) => (
              <div
                key={c.round}
                className={`bg-white rounded-xl border overflow-hidden transition-all hover:shadow-lg ${
                  c.round === 4
                    ? 'border-[#c9a84c] shadow-md shadow-[#c9a84c]/10'
                    : 'border-[#c9a84c]/20'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center">
                  {/* Round number */}
                  <div
                    className={`flex items-center justify-center md:w-24 py-3 md:py-0 md:min-h-[100px] font-black text-2xl ${
                      c.round === 4
                        ? 'bg-[#c9a84c] text-[#1a4731]'
                        : 'bg-[#1a4731] text-[#c9a84c]'
                    }`}
                  >
                    R{c.round}
                  </div>

                  {/* Course info */}
                  <div className="flex-1 p-5 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-[#1a4731]">
                          {c.name}
                          {c.round === 4 && (
                            <span className="ml-2 text-xs bg-[#c9a84c] text-[#1a4731] px-2 py-0.5 rounded-full font-bold uppercase">
                              Finals
                            </span>
                          )}
                        </h3>
                        <p className="text-[#1a4731]/60 text-sm mt-1">{c.format}</p>
                      </div>
                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#1a4731]/70">
                        <span className="font-semibold">{c.day}</span>
                        <span>{c.time}</span>
                        {c.teeBox && <span>Tees: {c.teeBox}</span>}
                        {c.yardage && <span>{c.yardage} yds</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CAPTAINS ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-[#c9a84c] font-semibold uppercase tracking-[0.2em] text-sm mb-3">
            The Captains
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-[#1a4731] mb-5">
            Who Will Lead?
          </h2>
          <p className="text-[#1a4731]/60 max-w-2xl mx-auto mb-12">
            Two captains will draft their squads and lead them into battle across the courses
            of Cabo. Every pick counts. Every strategy matters.
          </p>

          <div className="grid sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="rounded-2xl border-2 border-[#c9a84c]/30 p-8 bg-[#f5f0e8] hover:border-[#c9a84c] transition-colors">
              <div className="w-20 h-20 rounded-full bg-[#1a4731] flex items-center justify-center mx-auto mb-4">
                <span className="text-[#c9a84c] text-2xl font-black">CD</span>
              </div>
              <div className="text-xl font-bold text-[#1a4731]">Cole Dominguez</div>
              <div className="text-[#c9a84c] font-semibold text-sm mt-1">Team DOM</div>
              <div className="text-[#1a4731]/50 text-sm mt-2">2 Handicap</div>
            </div>
            <div className="rounded-2xl border-2 border-[#c9a84c]/30 p-8 bg-[#f5f0e8] hover:border-[#c9a84c] transition-colors">
              <div className="w-20 h-20 rounded-full bg-[#1a4731] flex items-center justify-center mx-auto mb-4">
                <span className="text-[#c9a84c] text-2xl font-black">RP</span>
              </div>
              <div className="text-xl font-bold text-[#1a4731]">Ryan Parker</div>
              <div className="text-[#c9a84c] font-semibold text-sm mt-1">Team RP</div>
              <div className="text-[#1a4731]/50 text-sm mt-2">6 Handicap</div>
            </div>
          </div>

          <div className="mt-10">
            <Link
              href="/draft"
              className="inline-flex items-center gap-2 text-[#c9a84c] font-bold hover:text-[#1a4731] transition-colors text-lg"
            >
              View the Draft Board
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== LEGACY — Est. 2021 ===== */}
      <section className="py-20 bg-[#1a4731] overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <div className="text-[#c9a84c] font-semibold uppercase tracking-[0.2em] text-sm mb-3">
              Est. 2021
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[#f5f0e8] mb-5">
              Six Years of RGAO
            </h2>
            <p className="text-[#f5f0e8]/50 max-w-2xl mx-auto">
              From Palm Springs to Cabo San Lucas — every year, a new destination.
              Every year, a new champion. The tradition continues.
            </p>
          </div>

          {/* Past tournament logos in a row */}
          <div className="flex justify-center gap-6 md:gap-10 flex-wrap mb-12">
            {pastTournaments.map((t) => (
              <div key={t.year} className="flex flex-col items-center group">
                <div className="w-16 h-20 md:w-20 md:h-28 mb-3 opacity-60 group-hover:opacity-100 transition-opacity">
                  <img
                    src={t.logo}
                    alt={`RGAO ${t.year}`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-[#c9a84c] font-bold text-sm">{t.year}</div>
                <div className="text-[#f5f0e8]/40 text-xs">{t.location}</div>
              </div>
            ))}

            {/* 2026 — featured */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-28 md:w-24 md:h-32 mb-3 ring-2 ring-[#c9a84c]/30 rounded-xl p-1">
                <img
                  src={logo2026}
                  alt="RGAO 2026 — Cabo San Lucas"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-[#c9a84c] font-black text-sm">2026</div>
              <div className="text-[#c9a84c]/70 text-xs font-semibold">Cabo San Lucas</div>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: '6', label: 'Tournaments' },
              { value: '5', label: 'Past Champions' },
              { value: '6', label: 'Host Cities' },
              { value: '1st', label: 'International Year' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center py-4 border border-[#c9a84c]/20 rounded-xl bg-[#c9a84c]/5"
              >
                <div className="text-2xl font-black text-[#c9a84c]">{stat.value}</div>
                <div className="text-[#f5f0e8]/50 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-20 bg-[#f5f0e8]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-[#c9a84c] font-semibold uppercase tracking-[0.2em] text-sm mb-3">
                Tournament Hub
              </div>
              <h2 className="text-4xl font-black text-[#1a4731] mb-5">
                Everything You Need
              </h2>
              <p className="text-[#1a4731]/70 mb-6 leading-relaxed text-lg">
                Follow every match, track every point, and relive every moment of the
                2026 RGAO in Cabo San Lucas. Our tournament hub keeps you connected
                to the action.
              </p>
              <Link
                href="/records"
                className="inline-flex items-center gap-2 text-[#c9a84c] font-bold hover:text-[#1a4731] transition-colors"
              >
                View Historic Records
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  title: 'Live Leaderboard',
                  desc: 'Real-time scoring and team standings updated throughout each round',
                  href: '/dashboard',
                },
                {
                  title: 'Draft Board',
                  desc: 'Interactive team draft with coin flip, pick timer, and live selections',
                  href: '/draft',
                },
                {
                  title: 'Tournament Blog',
                  desc: 'Previews, course breakdowns, player profiles, and post-round recaps',
                  href: '/blog',
                },
                {
                  title: 'All-Time Records',
                  desc: 'Champions, lowest rounds, and historic moments from every RGAO',
                  href: '/records',
                },
              ].map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="bg-white rounded-xl p-5 border border-[#c9a84c]/20 shadow-sm hover:border-[#c9a84c] hover:shadow-md transition-all group"
                >
                  <div className="font-bold text-[#1a4731] text-sm mb-2 group-hover:text-[#c9a84c] transition-colors">
                    {item.title}
                  </div>
                  <div className="text-[#1a4731]/60 text-xs leading-relaxed">{item.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative py-20 px-4 text-center overflow-hidden bg-[#1a4731]">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(-45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)',
            backgroundSize: '16px 16px',
          }}
        />
        <div className="relative max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <img
              src={logo2026}
              alt="RGAO 2026"
              className="w-20 h-28 object-contain opacity-80"
            />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-[#f5f0e8] mb-4">
            See You in <span className="text-[#c9a84c]">Cabo</span>
          </h2>
          <p className="text-[#f5f0e8]/60 mb-10 text-lg">
            The 6th Annual RGAO awaits. Cabo San Lucas, Mexico.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-[#c9a84c] text-[#1a4731] px-10 py-4 rounded-lg font-bold text-lg hover:bg-[#b8943a] transition-all shadow-lg shadow-[#c9a84c]/20"
            >
              View Current Standings
            </Link>
            <Link
              href="/blog"
              className="border-2 border-[#f5f0e8]/30 text-[#f5f0e8] px-10 py-4 rounded-lg font-bold text-lg hover:bg-[#f5f0e8]/10 transition-all"
            >
              Read Tournament Blog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

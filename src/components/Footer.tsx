import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#1a4731] text-[#f5f0e8] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-[#c9a84c] text-xl">⛳</span>
              <span className="font-bold text-lg text-[#c9a84c]">RGAO</span>
            </div>
            <p className="text-[#f5f0e8]/70 text-sm">
              Republican Golf Association Open — celebrating excellence on the fairways since 2017.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-[#c9a84c] mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-[#f5f0e8]/70">
              <li><Link href="/" className="hover:text-[#c9a84c] transition-colors">Home</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#c9a84c] transition-colors">Leaderboard</Link></li>
              <li><Link href="/draft" className="hover:text-[#c9a84c] transition-colors">Draft Board</Link></li>
              <li><Link href="/blog" className="hover:text-[#c9a84c] transition-colors">Blog</Link></li>
              <li><Link href="/records" className="hover:text-[#c9a84c] transition-colors">Records</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-[#c9a84c] mb-3">Tournament Info</h3>
            <ul className="space-y-2 text-sm text-[#f5f0e8]/70">
              <li>📅 Annual Tournament</li>
              <li>🏆 Est. 2017</li>
              <li>⛳ 72-Hole Stroke Play</li>
              <li>🎯 Handicap Division Available</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#f5f0e8]/20 mt-8 pt-6 text-center text-sm text-[#f5f0e8]/50">
          © {new Date().getFullYear()} Republican Golf Association Open. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

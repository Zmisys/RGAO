'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Leaderboard' },
    { href: '/draft', label: 'Draft Board' },
    { href: '/blog', label: 'Blog' },
    { href: '/records', label: 'Records' },
  ];

  return (
    <nav className="bg-[#1a4731] text-[#f5f0e8] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <span className="text-[#c9a84c] text-2xl">⛳</span>
            <Link href="/" className="font-bold text-xl tracking-wide text-[#c9a84c]">
              RGAO
            </Link>
            <span className="hidden sm:block text-[#f5f0e8]/60 text-sm">Republican Golf Association Open</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex space-x-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-[#c9a84c] text-[#1a4731]'
                    : 'text-[#f5f0e8] hover:bg-[#1a4731]/80 hover:text-[#c9a84c]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded text-[#f5f0e8] hover:text-[#c9a84c]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2 rounded text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-[#c9a84c] text-[#1a4731]'
                    : 'text-[#f5f0e8] hover:bg-[#1a4731]/80 hover:text-[#c9a84c]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

import Link from 'next/link';
import { blogPosts } from '@/data/blog';

export default function BlogPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="text-[#c9a84c] font-semibold uppercase tracking-widest text-sm mb-2">RGAO News</div>
        <h1 className="text-4xl font-bold text-[#1a4731] mb-1">Tournament Blog</h1>
        <p className="text-[#1a4731]/60">News, interviews, and course analysis from the Republican Golf Association Open</p>
      </div>

      <div className="grid gap-6">
        {blogPosts.map((post, index) => (
          <article
            key={post.slug}
            className={`bg-white rounded-2xl border border-[#c9a84c]/20 shadow-sm overflow-hidden hover:shadow-md transition-shadow ${index === 0 ? 'md:flex' : ''}`}
          >
            {index === 0 && (
              <div className="md:w-48 bg-[#1a4731] flex items-center justify-center text-7xl p-8 flex-shrink-0">
                ⛳
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  post.category === 'Tournament' ? 'bg-[#c9a84c] text-[#1a4731]' :
                  post.category === 'Interview' ? 'bg-green-100 text-green-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {post.category}
                </span>
                <span className="text-xs text-[#1a4731]/50">{post.date}</span>
                <span className="text-xs text-[#1a4731]/50">By {post.author}</span>
              </div>
              <h2 className={`font-bold text-[#1a4731] mb-2 ${index === 0 ? 'text-2xl' : 'text-xl'}`}>
                {post.title}
              </h2>
              <p className="text-[#1a4731]/70 text-sm mb-4 leading-relaxed">{post.excerpt}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center text-[#c9a84c] font-semibold text-sm hover:text-[#1a4731] transition-colors"
              >
                Read Full Article →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

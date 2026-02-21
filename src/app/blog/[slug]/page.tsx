import Link from 'next/link';
import { blogPosts } from '@/data/blog';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return blogPosts.map(post => ({ slug: post.slug }));
}

function renderContent(content: string) {
  return content.split('\n\n').map((paragraph, i) => {
    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
      return <h3 key={i} className="text-xl font-bold text-[#1a4731] mt-6 mb-2">{paragraph.replace(/\*\*/g, '')}</h3>;
    }
    const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="text-[#1a4731]/80 leading-relaxed mb-4">
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="text-[#1a4731] font-bold">{part.replace(/\*\*/g, '')}</strong>;
          }
          return part;
        })}
      </p>
    );
  });
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find(p => p.slug === params.slug);
  if (!post) notFound();

  const otherPosts = blogPosts.filter(p => p.slug !== post.slug);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link href="/blog" className="inline-flex items-center text-[#c9a84c] font-semibold text-sm mb-6 hover:text-[#1a4731] transition-colors">
        ← Back to Blog
      </Link>

      <article className="bg-white rounded-2xl border border-[#c9a84c]/20 shadow-sm overflow-hidden mb-8">
        <div className="bg-[#1a4731] px-8 py-10">
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
              post.category === 'Tournament' ? 'bg-[#c9a84c] text-[#1a4731]' :
              post.category === 'Interview' ? 'bg-green-400 text-green-900' :
              'bg-blue-400 text-blue-900'
            }`}>
              {post.category}
            </span>
            <span className="text-[#f5f0e8]/60 text-sm">{post.date}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#f5f0e8] mb-3">{post.title}</h1>
          <p className="text-[#f5f0e8]/60 text-sm">By {post.author}</p>
        </div>
        <div className="px-8 py-8">
          <p className="text-lg text-[#1a4731]/70 italic border-l-4 border-[#c9a84c] pl-4 mb-6">{post.excerpt}</p>
          <div>{renderContent(post.content)}</div>
        </div>
      </article>

      {/* Related Posts */}
      {otherPosts.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-[#1a4731] mb-4">More from the Blog</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {otherPosts.map(other => (
              <Link key={other.slug} href={`/blog/${other.slug}`} className="bg-white rounded-xl border border-[#c9a84c]/20 p-5 hover:shadow-md transition-shadow">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  other.category === 'Tournament' ? 'bg-[#c9a84c] text-[#1a4731]' :
                  other.category === 'Interview' ? 'bg-green-100 text-green-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {other.category}
                </span>
                <h3 className="font-bold text-[#1a4731] mt-2 mb-1 text-sm">{other.title}</h3>
                <p className="text-[#1a4731]/60 text-xs">{other.date}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: collection } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .eq('visibility', 'public')
    .single();

  if (!collection) {
    return (
      <>
        <style>{`
          body { background-color: #ffffff; color: #1a1a1a; margin: 0; }
          @media (prefers-color-scheme: dark) {
            body { background-color: #1a1a1a; color: #f5f5f0; }
          }
        `}</style>
        <main style={{ fontFamily: 'sans-serif', padding: '40px 24px', maxWidth: 600, margin: '0 auto' }}>
          <h1 style={{ fontSize: 24, fontWeight: 500 }}>Collection not found</h1>
          <p style={{ color: '#888' }}>This collection may be private or does not exist.</p>
        </main>
      </>
    );
  }

  const { data: curator } = await supabase
    .from('users')
    .select('username, display_name, email')
    .eq('id', collection.user_id)
    .single();

  const curatorHandle = curator?.username
    ? `@${curator.username}`
    : curator?.display_name
    || curator?.email?.split('@')[0]
    || 'ShelfIt user';

  const { data: items } = await supabase
    .from('collection_saves')
    .select('*, saves(*, links(*))')
    .eq('collection_id', collection.id);

  const linkCount = items?.length ?? 0;

  return (
    <>
      <style>{`
        body { background-color: #ffffff; color: #1a1a1a; margin: 0; }
        .card {
          border: 0.5px solid #e0e0e0;
          border-radius: 12px;
          padding: 14px 16px;
          background: #ffffff;
          overflow: hidden;
          word-break: break-word;
          text-decoration: none;
          display: block;
          margin-bottom: 12px;
        }
        .card:hover { opacity: 0.85; }
        .card-category { font-size: 10px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .card-title { font-size: 15px; font-weight: 500; color: #1a1a1a; margin-bottom: 4px; }
        .card-summary { font-size: 13px; color: #888; line-height: 1.5; }
        .card-url { font-size: 11px; color: #A0B8D0; margin-top: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .curator { color: #1a1a1a; }
        .meta { color: #888; }
        .footer { margin-top: 48px; padding-top: 24px; border-top: 0.5px solid #e0e0e0; text-align: center; }
        .footer p { font-size: 12px; color: #888; }
        @media (prefers-color-scheme: dark) {
          body { background-color: #1a1a1a; color: #f5f5f0; }
          .card { background: #2a2a2a; border-color: #333; }
          .card-title { color: #f5f5f0; }
          .card-summary { color: #999; }
          .card-category { color: #666; }
          .curator { color: #f5f5f0; }
          .meta { color: #666; }
          .footer { border-top-color: #333; }
          .footer p { color: #666; }
        }
      `}</style>
      <main style={{ fontFamily: 'sans-serif', padding: '40px 24px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            <div style={{ width: 32, height: 8, borderRadius: 4, background: '#D4C4A0' }} />
            <div style={{ width: 32, height: 8, borderRadius: 4, background: '#A8C4B4' }} />
            <div style={{ width: 32, height: 8, borderRadius: 4, background: '#A0B8D0' }} />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 500, margin: '0 0 4px', letterSpacing: -0.5 }}>
            {collection.name}
          </h1>
          <p className="meta" style={{ fontSize: 13, margin: '0 0 4px' }}>
            Curated by <strong className="curator">{curatorHandle}</strong>
          </p>
          <p className="meta" style={{ fontSize: 13, margin: 0 }}>
            {linkCount} link{linkCount !== 1 ? 's' : ''}
          </p>
        </div>

        <div>
          {items?.map((item: any) => {
            const link = item.saves?.links;
            if (!link) return null;
            return (
              <a key={item.id} href={link.url} target="_blank" rel="noopener noreferrer" className="card">
                <div className="card-category">{link.ai_category || 'other'}</div>
                <div className="card-title">{link.title}</div>
                {link.ai_summary && <div className="card-summary">{link.ai_summary}</div>}
                <div className="card-url">{link.url}</div>
              </a>
            );
          })}
        </div>

        <div className="footer">
          <p>saved with <strong>ShelfIt</strong></p>
        </div>
      </main>
    </>
  );
}

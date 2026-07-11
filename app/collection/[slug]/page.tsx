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
      <main style={{ fontFamily: 'sans-serif', padding: '40px 24px', maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 500 }}>Collection not found</h1>
        <p style={{ color: '#888' }}>This collection may be private or does not exist.</p>
      </main>
    );
  }

  // Fetch curator display name
  const { data: curator } = await supabase
    .from('users')
    .select('display_name, email')
    .eq('id', collection.user_id)
    .single();

  const curatorName = curator?.display_name || curator?.email?.split('@')[0] || 'ShelfIt user';

  const { data: items } = await supabase
    .from('collection_saves')
    .select('*, saves(*, links(*))')
    .eq('collection_id', collection.id);

  const linkCount = items?.length ?? 0;

  return (
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
        <p style={{ color: '#888', fontSize: 13, margin: '0 0 4px' }}>
          Curated by <strong style={{ color: '#1A1A1A' }}>{curatorName}</strong>
        </p>
        <p style={{ color: '#888', fontSize: 13, margin: 0 }}>
          {linkCount} link{linkCount !== 1 ? 's' : ''}
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items?.map((item: any) => {
          const link = item.saves?.links;
          if (!link) return null;
          const cardStyle = {
            border: '0.5px solid #E0E0E0',
            borderRadius: 12,
            padding: '14px 16px',
            background: '#fff',
            cursor: 'pointer',
            overflow: 'hidden',
            wordBreak: 'break-word' as const,
          };
          return (
            <a key={item.id} href={link.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div style={cardStyle}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                  {link.ai_category || 'other'}
                </div>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#1A1A1A', marginBottom: 4 }}>
                  {link.title}
                </div>
                <div style={{ fontSize: 13, color: '#888', lineHeight: 1.5 }}>
                  {link.ai_summary}
                </div>
                <div style={{ fontSize: 11, color: '#A0B8D0', marginTop: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {link.url}
                </div>
              </div>
            </a>
          );
        })}
      </div>
      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '0.5px solid #E0E0E0', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#888' }}>saved with <strong>ShelfIt</strong></p>
      </div>
    </main>
  );
}

import { useEffect, useState } from 'react';
import api from '../../api/client';

interface TrendingTag {
  name: string;
  slug: string;
  post_count: string;
}

interface TrendingPost {
  id: string;
  username: string;
  display_name: string;
  likes: string;
  comments: string;
  shares: string;
}

export default function RightSidebar() {
  const [tags, setTags] = useState<TrendingTag[]>([]);
  const [posts, setPosts] = useState<TrendingPost[]>([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const [tagsRes, postsRes] = await Promise.all([
          api.get('/trending/tags'),
          api.get('/trending/posts'),
        ]);
        setTags(tagsRes.data.trending_tags);
        setPosts(postsRes.data.trending_posts);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTrending();
  }, []);

  const growthColors = ['#FF1493', '#FF3EA5', '#C4006A', '#FF1493', '#FF3EA5'];
  const growthPct = ['+320%', '+210%', '+180%', '+145%', '+120%'];

  const gradients = [
    'linear-gradient(135deg,#3D0A28,#7A1CAC)',
    'linear-gradient(135deg,#1E0840,#C4006A)',
    'linear-gradient(135deg,#30043E,#FF1493)',
    'linear-gradient(135deg,#200A28,#7A1CAC)',
    'linear-gradient(135deg,#3D1808,#C4006A)',
  ];

  return (
    <div>

      {/* Trending Now */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 800, letterSpacing: '.06em', color: '#fff', textTransform: 'uppercase' }}>
            🔥 TRENDING NOW
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--pink)', cursor: 'pointer' }}>View all</span>
        </div>

        {tags.length > 0 ? tags.map((tag, i) => (
          <div
            key={tag.slug}
            style={{
              display: 'flex', alignItems: 'center',
              padding: '9px 0',
              borderBottom: i < tags.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, flex: 1, color: '#fff' }}>#{tag.name}</span>
            <span style={{ fontSize: 12, color: 'var(--sub)', marginRight: 10 }}>{tag.post_count} posts</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: growthColors[i], display: 'flex', alignItems: 'center', gap: 3 }}>
              🔥 {growthPct[i]}
            </span>
          </div>
        )) : (
          /* Placeholder data */
          [
            { name: 'DarkAI', count: '12.4K', pct: '+320%' },
            { name: 'MonstersUnite', count: '8.7K', pct: '+210%' },
            { name: 'ShadowRealm', count: '6.1K', pct: '+180%' },
            { name: 'NeonDemon', count: '4.3K', pct: '+145%' },
            { name: 'CursedVibes', count: '3.2K', pct: '+120%' },
          ].map((tag, i) => (
            <div
              key={tag.name}
              style={{
                display: 'flex', alignItems: 'center',
                padding: '9px 0',
                borderBottom: i < 4 ? '1px solid rgba(255,255,255,.04)' : 'none',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, flex: 1, color: '#fff' }}>#{tag.name}</span>
              <span style={{ fontSize: 12, color: 'var(--sub)', marginRight: 10 }}>{tag.count} posts</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: growthColors[i] }}>🔥 {tag.pct}</span>
            </div>
          ))
        )}
      </div>

      {/* Top Monsters */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.06em', color: '#fff', textTransform: 'uppercase' }}>
            👹 TOP MONSTERS
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--pink)', cursor: 'pointer' }}>View all</span>
        </div>

        {(posts.length > 0 ? posts : [
          { username: 'NightCrawler', score: '98.6' },
          { username: 'ShadowQueen', score: '96.2' },
          { username: 'HellBeliever', score: '94.8' },
          { username: 'DemonSlayer', score: '93.1' },
          { username: 'DarkPrince', score: '91.7' },
        ]).map((item: any, i) => (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: 11,
              padding: '10px 0',
              borderBottom: i < 4 ? '1px solid rgba(255,255,255,.04)' : 'none',
              cursor: 'pointer',
            }}
          >
            <span style={{ width: 16, fontSize: 13, fontWeight: 700, color: 'var(--sub)', textAlign: 'center' }}>
              {i + 1}
            </span>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              background: gradients[i % gradients.length],
              border: '2px solid rgba(255,20,147,.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 16,
            }}>
              {(item.username || item.display_name || '?').charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                {item.username || item.display_name}
                {i < 2 && (
                  <span style={{
                    width: 15, height: 15, borderRadius: '50%',
                    background: 'var(--pink)', fontSize: 8,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 6px rgba(255,20,147,.4)',
                  }}>✓</span>
                )}
              </div>
              <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 1 }}>
                @{(item.username || '').toLowerCase()}
              </div>
            </div>
            <div style={{
              fontSize: 22, fontWeight: 800, color: 'var(--pink)',
              textShadow: '0 0 15px rgba(255,20,147,.35)',
            }}>
              {item.score || (98.6 - i * 1.8).toFixed(1)}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
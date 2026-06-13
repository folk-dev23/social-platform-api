import { useEffect, useState } from 'react';
import api from '../api/client';
import Layout from '../components/layout/Layout';
import RightSidebar from '../components/layout/RightSidebar';
import Composer from '../components/feed/Composer';
import PostCard from '../components/feed/PostCard';

interface Post {
  id: string;
  content: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  likes: string;
  comments: string;
  shares: string;
  tags: string[];
  feed_reason: string;
  score: number;
  created_at: string;
  image_urls?: string[];
}

const tabs = ['For You', 'Following', 'Trending'];

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('For You');

  const fetchFeed = async () => {
    setIsLoading(true);
    try {
      const endpoint = activeTab === 'Following' ? '/feed' : '/feed/public';
      const res = await api.get(endpoint);
      setPosts(res.data.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [activeTab]);

  return (
    <Layout rightSidebar={<RightSidebar />}>
      <div style={{ maxWidth: 660, margin: '0 auto', padding: '18px 16px' }}>

        {/* Composer */}
        <Composer onPostCreated={fetchFeed} />

        {/* Feed Tabs */}
        <div style={{
          display: 'flex', alignItems: 'center',
          borderBottom: '1px solid var(--border)',
          marginBottom: 16,
        }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 18px',
                fontSize: 14, fontWeight: 700,
                color: activeTab === tab ? '#fff' : 'var(--sub)',
                background: 'transparent', border: 'none',
                borderBottom: activeTab === tab ? '2px solid var(--pink)' : '2px solid transparent',
                marginBottom: -1,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                transition: 'all .18s',
              }}
            >
              {tab}
            </button>
          ))}

          {/* Sort */}
          <div style={{
            marginLeft: 'auto',
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 12px', borderRadius: 8,
            fontSize: 13, fontWeight: 600, color: 'var(--sub)',
            background: 'rgba(255,255,255,.04)',
            border: '1px solid var(--border)',
            cursor: 'pointer', marginBottom: 8,
          }}>
            Latest ▾
          </div>
        </div>

        {/* Feed */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--sub)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>👹</div>
            <div style={{ fontSize: 14 }}>Loading the dark feed...</div>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--sub)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🌑</div>
            <div style={{ fontSize: 14 }}>No posts yet. Be the first monster to post!</div>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onRefresh={fetchFeed} />
          ))
        )}

      </div>
    </Layout>
  );
}
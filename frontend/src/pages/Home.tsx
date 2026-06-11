import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';
import CreatePost from '../components/CreatePost';

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
}

export default function Home() {
  const { user, logout } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      const res = await api.get('/feed/public');
      setPosts(res.data.posts);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleLike = async (postId: string) => {
    try {
      await api.post(`/posts/${postId}/react`);
      fetchFeed();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">🐾 Popular Monsters</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">@{user?.username}</span>
            <button
              onClick={logout}
              className="text-sm text-gray-400 hover:text-white transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Create Post */}
        <CreatePost onPostCreated={fetchFeed} />

        {/* Feed */}
        {isLoading ? (
          <div className="text-center text-gray-400 py-20">Loading feed...</div>
        ) : posts.length === 0 ? (
          <div className="text-center text-gray-400 py-20">No posts yet</div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition"
              >
                {/* Feed Reason */}
                <div className="text-xs text-purple-400 mb-3 font-medium">
                  ✦ {post.feed_reason}
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {post.username[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {post.display_name || post.username}
                    </p>
                    <p className="text-gray-500 text-xs">@{post.username}</p>
                  </div>
                </div>

                {/* Content */}
                <p className="text-gray-200 text-sm leading-relaxed mb-3">
                  {post.content}
                </p>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Engagement */}
                <div className="flex items-center gap-5 text-gray-500 text-sm pt-3 border-t border-gray-800">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1 hover:text-red-400 transition"
                  >
                    ❤️ {post.likes}
                  </button>
                  <span>💬 {post.comments}</span>
                  <span>🔁 {post.shares}</span>
                  <span className="ml-auto text-xs">
                    Score: {post.score.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
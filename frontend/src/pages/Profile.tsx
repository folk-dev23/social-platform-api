import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';

interface Profile {
  id: string;
  username: string;
  email: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  website: string | null;
  created_at: string;
}

interface Post {
  id: string;
  content: string;
  tags: string[];
  likes: string;
  comments: string;
  created_at: string;
}

export default function Profile() {
  const { username } = useParams();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, postsRes, followersRes, followingRes] = await Promise.all([
          api.get(`/users/${username}`),
          api.get(`/posts?username=${username}`),
          api.get(`/users/${username}/followers`),
          api.get(`/users/${username}/following`),
        ]);
        setProfile(profileRes.data.user);
        setPosts(postsRes.data.posts || []);
        setFollowers(followersRes.data.followers);
        setFollowing(followingRes.data.following);
        setIsFollowing(
          followersRes.data.followers.some((f: any) => f.username === user?.username)
        );
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await api.delete(`/users/${username}/follow`);
        setIsFollowing(false);
        setFollowers((prev) => prev.filter((f) => f.username !== user?.username));
      } else {
        await api.post(`/users/${username}/follow`);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">User not found</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-white">🐾 Popular Monsters</Link>
          <span className="text-gray-400 text-sm">@{user?.username}</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                {profile.username[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-white font-bold text-xl">
                  {profile.display_name || profile.username}
                </h2>
                <p className="text-gray-400 text-sm">@{profile.username}</p>
              </div>
            </div>
            {user?.username !== username && (
              <button
                onClick={handleFollow}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  isFollowing
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>

          {profile.bio && (
            <p className="text-gray-300 text-sm mb-3">{profile.bio}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-400">
            {profile.location && <span>📍 {profile.location}</span>}
            {profile.website && (
              <a href={profile.website} className="text-purple-400 hover:underline">
                🔗 Website
              </a>
            )}
          </div>

          <div className="flex gap-6 mt-4 pt-4 border-t border-gray-800">
            <div className="text-center">
              <p className="text-white font-bold">{followers.length}</p>
              <p className="text-gray-400 text-xs">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-white font-bold">{following.length}</p>
              <p className="text-gray-400 text-xs">Following</p>
            </div>
            <div className="text-center">
              <p className="text-white font-bold">{posts.length}</p>
              <p className="text-gray-400 text-xs">Posts</p>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No posts yet</p>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
              >
                <p className="text-gray-200 text-sm mb-3">{post.content}</p>
                {post.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-4 text-gray-500 text-sm pt-3 border-t border-gray-800">
                  <span>❤️ {post.likes}</span>
                  <span>💬 {post.comments}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
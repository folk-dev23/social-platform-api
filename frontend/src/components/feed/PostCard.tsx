import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import Avatar from '../ui/Avatar';

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
  feed_reason?: string;
  score?: number;
  created_at: string;
  image_urls?: string[];
}

interface PostCardProps {
  post: Post;
  onRefresh?: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function PostCard({ post, onRefresh }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(parseInt(post.likes) || 0);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await api.post(`/posts/${post.id}/react`);
      if (liked) {
        setLikeCount((prev) => prev - 1);
      } else {
        setLikeCount((prev) => prev + 1);
      }
      setLiked(!liked);
      onRefresh?.();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        transition: 'border-color .2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,20,147,.18)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      {/* Feed Reason */}
      {post.feed_reason && (
        <div style={{
          fontSize: 11, fontWeight: 700,
          color: 'var(--pink)',
          marginBottom: 10,
          display: 'flex', alignItems: 'center', gap: 5,
          opacity: .8,
        }}>
          ✦ {post.feed_reason.toUpperCase()}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <Link to={`/profile/${post.username}`}>
          <Avatar
            src={post.avatar_url}
            name={post.username}
            size="md"
          />
        </Link>
        <div>
          <Link
            to={`/profile/${post.username}`}
            style={{
              fontSize: 15, fontWeight: 700, color: '#fff',
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            {post.display_name || post.username}
            <span style={{ fontSize: 12, color: 'var(--sub)', fontWeight: 400 }}>
              @{post.username} · {timeAgo(post.created_at)}
            </span>
          </Link>
        </div>
        <div style={{ marginLeft: 'auto', color: 'var(--sub)', cursor: 'pointer', fontSize: 18 }}>···</div>
      </div>

      {/* Content */}
      <div style={{
        fontSize: 14, lineHeight: 1.65,
        color: 'rgba(255,255,255,.85)',
        marginBottom: 12,
        whiteSpace: 'pre-wrap',
      }}>
        {post.content}
      </div>

      {/* Images */}
      {post.image_urls && post.image_urls.length > 0 && (
        <div style={{ marginBottom: 12, borderRadius: 12, overflow: 'hidden' }}>
          <img
            src={post.image_urls[0]}
            alt="post"
            style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {post.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 12, fontWeight: 600,
                color: 'var(--hotpink)',
                background: 'rgba(255,62,165,.08)',
                border: '1px solid rgba(255,62,165,.15)',
                padding: '3px 10px', borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 2,
        paddingTop: 10,
        borderTop: '1px solid var(--border)',
      }}>
        {/* Like */}
        <button
          onClick={handleLike}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 13px', borderRadius: 100,
            fontSize: 13, fontWeight: 700,
            color: liked ? 'var(--pink)' : 'var(--sub)',
            background: 'transparent', border: 'none', cursor: 'pointer',
            transition: 'all .18s',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <span style={{ fontSize: 17 }}>{liked ? '🩷' : '🤍'}</span>
          {likeCount}
        </button>

        {/* Comment */}
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 13px', borderRadius: 100,
          fontSize: 13, fontWeight: 700,
          color: 'var(--sub)', background: 'transparent',
          border: 'none', cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
        }}>
          <span style={{ fontSize: 17 }}>💬</span>
          {post.comments}
        </button>

        {/* Share */}
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 13px', borderRadius: 100,
          fontSize: 13, fontWeight: 700,
          color: 'var(--sub)', background: 'transparent',
          border: 'none', cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
        }}>
          <span style={{ fontSize: 17 }}>🔁</span>
          {post.shares}
        </button>

        {/* Views */}
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 13px', borderRadius: 100,
          fontSize: 13, fontWeight: 700,
          color: 'var(--sub)', background: 'transparent',
          border: 'none', cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
        }}>
          <span style={{ fontSize: 17 }}>👁</span>
          {parseInt(post.likes) * 8}
        </button>

        {/* Score */}
        {post.score && (
          <div style={{
            marginLeft: 'auto',
            fontSize: 11, fontWeight: 700,
            color: 'rgba(255,20,147,.4)',
            background: 'rgba(48,4,62,.6)',
            border: '1px solid rgba(122,28,172,.2)',
            padding: '3px 8px', borderRadius: 6,
            fontFamily: 'Space Mono, monospace',
          }}>
            ⚡ {post.score.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
}
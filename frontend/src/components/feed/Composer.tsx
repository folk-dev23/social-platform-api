import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import Avatar from '../ui/Avatar';
import api from '../../api/client';

interface ComposerProps {
  onPostCreated: () => void;
}

export default function Composer({ onPostCreated }: ComposerProps) {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      const tagArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      await api.post('/posts', { content, tags: tagArray });
      setContent('');
      setTags('');
      setExpanded(false);
      onPostCreated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      padding: 15,
      marginBottom: 16,
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, marginBottom: expanded ? 12 : 0 }}>
        <Avatar name={user?.username} size="md" showOnline />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setExpanded(true)}
          placeholder="What's on your mind, monster?"
          rows={expanded ? 3 : 1}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,.03)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '10px 14px',
            color: '#fff',
            fontSize: 14,
            fontFamily: 'Inter, sans-serif',
            outline: 'none',
            resize: 'none',
            transition: 'all .2s',
            lineHeight: 1.6,
          }}
          onFocusCapture={(e) => (e.target.style.borderColor = 'rgba(255,20,147,.3)')}
          onBlurCapture={(e) => (e.target.style.borderColor = 'var(--border)')}
        />
      </div>

      {/* Expanded area */}
      {expanded && (
        <>
          {/* Tags input */}
          <div style={{ paddingLeft: 51, marginBottom: 12 }}>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tags: react, webdev, monsters (comma separated)"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,.03)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '8px 12px',
                color: '#fff',
                fontSize: 12,
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginLeft: 51, marginBottom: 10,
              background: 'rgba(255,0,85,.08)',
              border: '1px solid rgba(255,0,85,.2)',
              color: '#FF5577',
              borderRadius: 8, padding: '8px 12px',
              fontSize: 12,
            }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{
            paddingTop: 12,
            borderTop: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            {[
              { icon: '🖼️', label: 'Image' },
              { icon: '🎬', label: 'Video' },
              { icon: '📊', label: 'Poll' },
              { icon: '😈', label: 'Feeling' },
            ].map((a) => (
              <button
                key={a.label}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '7px 12px', borderRadius: 8,
                  fontSize: 13, fontWeight: 600,
                  color: 'var(--sub)',
                  background: 'transparent', border: 'none',
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  transition: 'all .18s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,.05)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--sub)';
                }}
              >
                <span>{a.icon}</span> {a.label}
              </button>
            ))}

            <button
              onClick={() => { setExpanded(false); setContent(''); setTags(''); }}
              style={{
                padding: '7px 14px', borderRadius: 8,
                fontSize: 13, fontWeight: 600,
                color: 'var(--sub)',
                background: 'transparent',
                border: '1px solid var(--border)',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                marginLeft: 'auto',
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={isLoading || !content.trim()}
              style={{
                padding: '7px 22px', borderRadius: 8,
                fontSize: 13, fontWeight: 700,
                color: '#fff',
                background: 'var(--pink)',
                border: 'none',
                cursor: content.trim() ? 'pointer' : 'not-allowed',
                opacity: content.trim() ? 1 : .5,
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 4px 16px rgba(255,20,147,.3)',
                transition: 'all .2s',
              }}
            >
              {isLoading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </>
      )}

      {/* Collapsed actions */}
      {!expanded && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          paddingTop: 12, paddingLeft: 51,
          borderTop: '1px solid var(--border)',
          marginTop: 12,
        }}>
          {[
            { icon: '🖼️', label: 'Image' },
            { icon: '🎬', label: 'Video' },
            { icon: '📊', label: 'Poll' },
            { icon: '😈', label: 'Feeling' },
          ].map((a) => (
            <button
              key={a.label}
              onClick={() => setExpanded(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '7px 12px', borderRadius: 8,
                fontSize: 13, fontWeight: 600,
                color: 'var(--sub)',
                background: 'transparent', border: 'none',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              <span>{a.icon}</span> {a.label}
            </button>
          ))}
          <button
            onClick={handleSubmit}
            disabled={isLoading || !content.trim()}
            style={{
              marginLeft: 'auto',
              padding: '7px 22px', borderRadius: 8,
              fontSize: 13, fontWeight: 700, color: '#fff',
              background: 'var(--pink)', border: 'none',
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              boxShadow: '0 4px 16px rgba(255,20,147,.3)',
              opacity: content.trim() ? 1 : .5,
            }}
          >
            Post
          </button>
        </div>
      )}
    </div>
  );
}
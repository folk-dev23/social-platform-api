import { useState } from 'react';
import api from '../api/client';

interface Props {
  onPostCreated: () => void;
}

export default function CreatePost({ onPostCreated }: Props) {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      onPostCreated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4">
      <h2 className="text-white font-semibold mb-3">What's on your mind?</h2>
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-2 mb-3 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition resize-none text-sm"
          placeholder="Share something with the monsters..."
          rows={3}
        />
        <div className="flex items-center gap-3 mt-3">
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 transition text-sm"
            placeholder="Tags: react, typescript, webdev"
          />
          <button
            type="submit"
            disabled={isLoading || !content.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-lg px-5 py-2 text-sm transition"
          >
            {isLoading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
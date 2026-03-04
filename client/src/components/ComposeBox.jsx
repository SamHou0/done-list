import { useState } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

const MOODS = [
  { value: 'great', emoji: '🚀', label: 'Great' },
  { value: 'good', emoji: '😊', label: 'Good' },
  { value: 'neutral', emoji: '😐', label: 'Okay' },
  { value: 'tired', emoji: '😴', label: 'Tired' },
  { value: 'bad', emoji: '😞', label: 'Rough' },
];

export default function ComposeBox({ onPost }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('good');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const maxLen = 500;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/posts', { content, mood });
      onPost(data);
      setContent('');
      setMood('good');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl p-5 border"
      style={{ background: '#1a1a24', borderColor: '#2e2e3e' }}>

      <div className="flex gap-3">
        <img src={user.avatar} alt={user.username}
          className="w-10 h-10 rounded-full flex-shrink-0 mt-0.5" />

        <form onSubmit={handleSubmit} className="flex-1">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What did you accomplish today? ✦"
            rows={3}
            maxLength={maxLen}
            className="w-full resize-none text-sm outline-none bg-transparent"
            style={{ color: '#e8e8f0', caretColor: '#7c6af7' }}
          />

          <div className="mt-3 flex items-center justify-between flex-wrap gap-3">
            {/* Mood selector */}
            <div className="flex gap-1.5">
              {MOODS.map(m => (
                <button key={m.value} type="button"
                  onClick={() => setMood(m.value)}
                  title={m.label}
                  className="w-8 h-8 rounded-lg text-base transition-all duration-150"
                  style={{
                    background: mood === m.value ? 'rgba(124,106,247,0.2)' : 'transparent',
                    border: `1px solid ${mood === m.value ? '#7c6af7' : 'transparent'}`,
                    transform: mood === m.value ? 'scale(1.15)' : 'scale(1)',
                  }}>
                  {m.emoji}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* Char count */}
              <span className="text-xs" style={{
                color: content.length > maxLen * 0.9 ? '#f87171' : '#8888a8'
              }}>
                {content.length}/{maxLen}
              </span>

              <button type="submit"
                disabled={loading || !content.trim()}
                className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  background: (loading || !content.trim())
                    ? '#2e2e3e'
                    : 'linear-gradient(135deg, #7c6af7, #a78bfa)',
                  color: (loading || !content.trim()) ? '#8888a8' : '#fff',
                  cursor: (loading || !content.trim()) ? 'not-allowed' : 'pointer',
                  boxShadow: (!loading && content.trim()) ? '0 2px 12px rgba(124,106,247,0.35)' : 'none',
                }}>
                {loading ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-2 text-xs" style={{ color: '#f87171' }}>{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}

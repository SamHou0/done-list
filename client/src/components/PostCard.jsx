import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

const MOOD_MAP = {
  great:   { emoji: '🚀', color: '#34d399', label: 'Great day' },
  good:    { emoji: '😊', color: '#60a5fa', label: 'Good day' },
  neutral: { emoji: '😐', color: '#fbbf24', label: 'Okay day' },
  tired:   { emoji: '😴', color: '#a78bfa', label: 'Tired' },
  bad:     { emoji: '😞', color: '#f87171', label: 'Rough day' },
};

export default function PostCard({ post, onLike, onDelete }) {
  const { user } = useAuth();
  const [liking, setLiking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const mood = MOOD_MAP[post.mood] || MOOD_MAP.neutral;

  const timeAgo = formatDistanceToNow(new Date(post.created_at + 'Z'), { addSuffix: true });

  const handleLike = async () => {
    if (!user || liking) return;
    setLiking(true);
    try {
      const { data } = await api.post(`/posts/${post.id}/like`);
      onLike(post.id, data.liked, data.like_count);
    } finally {
      setLiking(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await api.delete(`/posts/${post.id}`);
      onDelete(post.id);
    } catch {
      setDeleting(false);
    }
  };

  return (
    <article className="rounded-2xl border overflow-hidden transition-all duration-200 group"
      style={{
        background: '#1a1a24',
        borderColor: '#2e2e3e',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#3e3e54'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#2e2e3e'}>

      {/* Mood accent bar */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${mood.color}60, transparent)` }} />

      <div className="p-5 flex gap-3">
        {/* Avatar */}
        <img src={post.avatar} alt={post.username}
          className="w-10 h-10 rounded-full flex-shrink-0 ring-2"
          style={{ ringColor: '#2e2e3e' }} />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm" style={{ color: '#e8e8f0' }}>
                {post.username}
              </span>
              <span className="text-xs" style={{ color: '#8888a8' }}>{timeAgo}</span>
              {/* Mood badge */}
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: mood.color + '18',
                  border: `1px solid ${mood.color}30`,
                  color: mood.color,
                }}>
                {mood.emoji} {mood.label}
              </span>
            </div>

            {/* Delete button (own posts) */}
            {user?.username === post.username && (
              <button onClick={handleDelete} disabled={deleting}
                className="opacity-0 group-hover:opacity-100 text-xs px-2 py-1 rounded-lg transition-all duration-150"
                style={{ color: '#8888a8', background: '#22222e' }}>
                {deleting ? '…' : 'Delete'}
              </button>
            )}
          </div>

          {/* Content */}
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words"
            style={{ color: '#d0d0e8' }}>
            {post.content}
          </p>

          {/* Like button */}
          <div className="mt-3 flex items-center gap-1.5">
            <button onClick={handleLike} disabled={!user || liking}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all duration-150"
              style={{
                background: post.liked ? 'rgba(249,115,22,0.12)' : 'transparent',
                border: `1px solid ${post.liked ? 'rgba(249,115,22,0.3)' : '#2e2e3e'}`,
                color: post.liked ? '#fb923c' : '#8888a8',
                cursor: user ? 'pointer' : 'default',
              }}>
              <span>{post.liked ? '🔥' : '🤍'}</span>
              <span>{post.like_count || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

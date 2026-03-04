import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import ComposeBox from '../components/ComposeBox';
import Navbar from '../components/Navbar';

export default function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      const { data } = await api.get('/posts');
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleNewPost = (post) => {
    setPosts(prev => [post, ...prev]);
  };

  const handleLike = (postId, liked, like_count) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, liked, like_count } : p));
  };

  const handleDelete = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  return (
    <div className="min-h-screen" style={{ background: '#0f0f13' }}>
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Hero text */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#e8e8f0' }}>
            What did you do today?
          </h1>
          <p className="text-sm" style={{ color: '#8888a8' }}>
            Share your wins — big or small. Every day counts.
          </p>
        </div>

        {/* Compose box for logged-in users */}
        {user && (
          <div className="mb-6">
            <ComposeBox onPost={handleNewPost} />
          </div>
        )}

        {/* Feed */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl h-32 animate-pulse"
                style={{ background: '#1a1a24', border: '1px solid #2e2e3e' }} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState loggedIn={!!user} />
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <PostCard key={post.id} post={post}
                onLike={handleLike} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState({ loggedIn }) {
  return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">✦</div>
      <p className="text-lg font-medium mb-2" style={{ color: '#e8e8f0' }}>No posts yet</p>
      <p className="text-sm" style={{ color: '#8888a8' }}>
        {loggedIn ? 'Be the first to share what you accomplished!' : 'Sign in to share your daily wins.'}
      </p>
    </div>
  );
}

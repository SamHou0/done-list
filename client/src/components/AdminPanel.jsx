import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import api from '../api';
import CreateUserModal from './CreateUserModal';

export default function AdminPanel({ onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async (user) => {
    if (!confirm(`Delete @${user.username}? This will also delete all their posts.`)) return;
    setDeletingId(user.id);
    try {
      await api.delete(`/admin/users/${user.id}`);
      setUsers(prev => prev.filter(u => u.id !== user.id));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreated = () => {
    setShowCreate(false);
    fetchUsers();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        onClick={e => e.target === e.currentTarget && onClose()}>

        <div className="w-full max-w-lg rounded-2xl border flex flex-col"
          style={{
            background: '#1a1a24', borderColor: '#2e2e3e',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
            maxHeight: '80vh',
          }}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
            style={{ borderColor: '#2e2e3e' }}>
            <div>
              <h2 className="text-base font-semibold" style={{ color: '#e8e8f0' }}>User management</h2>
              <p className="text-xs mt-0.5" style={{ color: '#8888a8' }}>
                {users.length} {users.length === 1 ? 'user' : 'users'} total
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium"
                style={{
                  background: 'linear-gradient(135deg, #7c6af7, #a78bfa)',
                  color: '#fff',
                  boxShadow: '0 2px 10px rgba(124,106,247,0.3)',
                }}>
                + New user
              </button>
              <button onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: '#22222e', color: '#8888a8' }}>×</button>
            </div>
          </div>

          {/* User list */}
          <div className="overflow-y-auto flex-1 px-3 py-3">
            {error && (
              <p className="text-xs px-3 py-2 mb-3 rounded-lg"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </p>
            )}

            {loading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => (
                  <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: '#22222e' }} />
                ))}
              </div>
            ) : (
              <div className="space-y-1.5">
                {users.map(user => (
                  <div key={user.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl group"
                    style={{ background: '#22222e' }}>

                    <img src={user.avatar} alt={user.username}
                      className="w-9 h-9 rounded-full flex-shrink-0"
                      style={{ outline: '2px solid #2e2e3e' }} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate" style={{ color: '#e8e8f0' }}>
                          {user.username}
                        </span>
                        {user.is_admin ? (
                          <span className="text-xs px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}>
                            admin
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs truncate" style={{ color: '#8888a8' }}>{user.email}</span>
                        <span className="text-xs" style={{ color: '#444458' }}>·</span>
                        <span className="text-xs flex-shrink-0" style={{ color: '#444458' }}>
                          {user.post_count} {user.post_count === 1 ? 'post' : 'posts'}
                        </span>
                        <span className="text-xs" style={{ color: '#444458' }}>·</span>
                        <span className="text-xs flex-shrink-0" style={{ color: '#444458' }}>
                          joined {formatDistanceToNow(new Date(user.created_at + 'Z'), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    {!user.is_admin && (
                      <button
                        onClick={() => handleDelete(user)}
                        disabled={deletingId === user.id}
                        className="opacity-0 group-hover:opacity-100 text-xs px-2.5 py-1.5 rounded-lg flex-shrink-0 transition-all"
                        style={{
                          background: 'rgba(239,68,68,0.1)',
                          color: '#f87171',
                          border: '1px solid rgba(239,68,68,0.2)',
                          cursor: deletingId === user.id ? 'not-allowed' : 'pointer',
                        }}>
                        {deletingId === user.id ? '…' : 'Delete'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  );
}

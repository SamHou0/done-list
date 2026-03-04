import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AvatarModal({ onClose }) {
  const { user, updateAvatar } = useAuth();
  const [url, setUrl] = useState(user.avatar || '');
  const [preview, setPreview] = useState(user.avatar || '');
  const [previewOk, setPreviewOk] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    setPreview(e.target.value);
    setPreviewOk(true);
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await updateAvatar(url.trim());
      setSuccess(true);
      setTimeout(onClose, 800);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update avatar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="w-full max-w-sm rounded-2xl border p-6"
        style={{ background: '#1a1a24', borderColor: '#2e2e3e', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold" style={{ color: '#e8e8f0' }}>Change avatar</h2>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-base"
            style={{ background: '#22222e', color: '#8888a8' }}>×</button>
        </div>

        {/* Preview */}
        <div className="flex justify-center mb-5">
          <div className="relative">
            <img
              src={previewOk && preview ? preview : `https://api.dicebear.com/7.x/thumbs/svg?seed=${user.username}`}
              alt="avatar preview"
              onError={() => setPreviewOk(false)}
              onLoad={() => setPreviewOk(true)}
              className="w-20 h-20 rounded-full object-cover"
              style={{ outline: '3px solid #7c6af7', outlineOffset: '2px' }}
            />
            <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center text-xs"
              style={{ background: '#7c6af7', color: '#fff' }}>✎</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#8888a8' }}>
              Image URL
            </label>
            <input
              type="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://example.com/avatar.png"
              required
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: '#22222e', border: '1px solid #2e2e3e', color: '#e8e8f0' }}
              onFocus={e => { e.target.style.borderColor = '#7c6af7'; e.target.style.boxShadow = '0 0 0 3px rgba(124,106,247,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = '#2e2e3e'; e.target.style.boxShadow = 'none'; }}
            />
            {!previewOk && url && (
              <p className="mt-1 text-xs" style={{ color: '#f87171' }}>
                Can't load image from this URL — it will still be saved if valid.
              </p>
            )}
          </div>

          {error && (
            <div className="text-sm px-3 py-2 rounded-lg"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm px-3 py-2 rounded-lg"
              style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
              ✓ Avatar updated!
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-xl text-sm font-medium"
              style={{ background: '#22222e', color: '#8888a8', border: '1px solid #2e2e3e' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading || !url.trim()}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: (loading || !url.trim()) ? '#3a3a50' : 'linear-gradient(135deg, #7c6af7, #a78bfa)',
                color: (loading || !url.trim()) ? '#8888a8' : '#fff',
                cursor: (loading || !url.trim()) ? 'not-allowed' : 'pointer',
                boxShadow: (!loading && url.trim()) ? '0 4px 16px rgba(124,106,247,0.3)' : 'none',
              }}>
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

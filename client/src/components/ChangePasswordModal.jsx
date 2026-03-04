import { useState } from 'react';
import api from '../api';

export default function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.next !== form.confirm) {
      return setError('New passwords do not match');
    }
    setLoading(true);
    try {
      await api.patch('/auth/password', { current_password: form.current, new_password: form.next });
      setSuccess(true);
      setTimeout(onClose, 900);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
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

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold" style={{ color: '#e8e8f0' }}>Change password</h2>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: '#22222e', color: '#8888a8' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Current password" name="current" value={form.current} onChange={handleChange} />
          <Field label="New password" name="next" value={form.next} onChange={handleChange} placeholder="min 6 characters" />
          <Field label="Confirm new password" name="confirm" value={form.confirm} onChange={handleChange} />

          {error && (
            <p className="text-sm px-3 py-2 rounded-lg"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm px-3 py-2 rounded-lg"
              style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
              ✓ Password changed!
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-xl text-sm font-medium"
              style={{ background: '#22222e', color: '#8888a8', border: '1px solid #2e2e3e' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: loading ? '#3a3a50' : 'linear-gradient(135deg, #7c6af7, #a78bfa)',
                color: loading ? '#8888a8' : '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(124,106,247,0.3)',
              }}>
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, placeholder = '••••••••' }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#8888a8' }}>{label}</label>
      <input name={name} type="password" value={value} onChange={onChange}
        placeholder={placeholder} required
        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
        style={{ background: '#22222e', border: '1px solid #2e2e3e', color: '#e8e8f0' }}
        onFocus={e => { e.target.style.borderColor = '#7c6af7'; e.target.style.boxShadow = '0 0 0 3px rgba(124,106,247,0.15)'; }}
        onBlur={e => { e.target.style.borderColor = '#2e2e3e'; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  );
}

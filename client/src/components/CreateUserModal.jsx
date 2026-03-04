import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function CreateUserModal({ onClose }) {
  const { createUser } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const user = await createUser(form.username, form.email, form.password);
      setSuccess(`✓ Account created for @${user.username}`);
      setForm({ username: '', email: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="w-full max-w-md rounded-2xl border p-6"
        style={{ background: '#1a1a24', borderColor: '#2e2e3e', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>

        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: '#e8e8f0' }}>Create user account</h2>
            <p className="text-xs mt-0.5" style={{ color: '#8888a8' }}>Admin action — the new user can log in immediately</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-colors hover:opacity-80"
            style={{ background: '#22222e', color: '#8888a8' }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Username" name="username" value={form.username} onChange={handleChange} placeholder="new_user" />
          <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="user@example.com" />
          <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="min 6 characters" />

          {error && (
            <div className="text-sm px-3 py-2 rounded-lg"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm px-3 py-2 rounded-lg"
              style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
              {success}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ background: '#22222e', color: '#8888a8', border: '1px solid #2e2e3e' }}>
              Close
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: loading ? '#3a3a50' : 'linear-gradient(135deg, #7c6af7, #a78bfa)',
                color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(124,106,247,0.3)',
              }}>
              {loading ? 'Creating…' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, type = 'text', value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#8888a8' }}>{label}</label>
      <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required
        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
        style={{ background: '#22222e', border: '1px solid #2e2e3e', color: '#e8e8f0' }}
        onFocus={e => { e.target.style.borderColor = '#7c6af7'; e.target.style.boxShadow = '0 0 0 3px rgba(124,106,247,0.15)'; }}
        onBlur={e => { e.target.style.borderColor = '#2e2e3e'; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  );
}

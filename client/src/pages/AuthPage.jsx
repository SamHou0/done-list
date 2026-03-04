import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AuthPage({ mode = 'login' }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isLogin = mode === 'login';

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register(form.username, form.email, form.password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0f0f13 0%, #1a1020 50%, #0f0f13 100%)' }}>

      {/* Decorative blobs */}
      <div className="absolute top-20 left-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7c6af7, transparent)' }} />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-3xl">✦</span>
            <span className="text-2xl font-bold tracking-tight" style={{ color: '#e8e8f0' }}>DoneList</span>
          </div>
          <p className="text-sm" style={{ color: '#8888a8' }}>
            {isLogin ? 'Welcome back! Share what you accomplished today.' : 'Join and start sharing your daily wins.'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 border"
          style={{ background: '#1a1a24', borderColor: '#2e2e3e', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>

          <h1 className="text-xl font-semibold mb-6" style={{ color: '#e8e8f0' }}>
            {isLogin ? 'Sign in' : 'Create account'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <InputField label="Username" name="username" value={form.username}
                onChange={handleChange} placeholder="your_name" autoComplete="username" />
            )}
            <InputField label="Email" name="email" type="email" value={form.email}
              onChange={handleChange} placeholder="you@example.com" autoComplete="email" />
            <InputField label="Password" name="password" type="password" value={form.password}
              onChange={handleChange} placeholder={isLogin ? '••••••••' : 'min 6 characters'} autoComplete={isLogin ? 'current-password' : 'new-password'} />

            {error && (
              <div className="text-sm px-3 py-2 rounded-lg"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
              style={{
                background: loading ? '#3a3a50' : 'linear-gradient(135deg, #7c6af7, #a78bfa)',
                color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(124,106,247,0.35)',
              }}>
              {loading ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm" style={{ color: '#8888a8' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link to={isLogin ? '/register' : '/login'}
              className="font-medium transition-colors hover:opacity-80"
              style={{ color: '#a78bfa' }}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, name, type = 'text', value, onChange, placeholder, autoComplete }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#8888a8' }}>{label}</label>
      <input
        name={name} type={type} value={value} onChange={onChange}
        placeholder={placeholder} autoComplete={autoComplete} required
        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
        style={{
          background: '#22222e',
          border: '1px solid #2e2e3e',
          color: '#e8e8f0',
        }}
        onFocus={e => {
          e.target.style.borderColor = '#7c6af7';
          e.target.style.boxShadow = '0 0 0 3px rgba(124,106,247,0.15)';
        }}
        onBlur={e => {
          e.target.style.borderColor = '#2e2e3e';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}

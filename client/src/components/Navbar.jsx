import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AvatarModal from './AvatarModal';
import ChangePasswordModal from './ChangePasswordModal';
import AdminPanel from './AdminPanel';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState(null); // 'avatar' | 'password' | 'admin'
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!menu) return;
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menu]);

  const open = (m) => { setMenu(false); setModal(m); };

  return (
    <>
      <header className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{ background: 'rgba(15,15,19,0.85)', borderColor: '#2e2e3e' }}>
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">

          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl transition-transform group-hover:scale-110">✦</span>
            <span className="font-bold tracking-tight" style={{ color: '#e8e8f0' }}>DoneList</span>
          </Link>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenu(v => !v)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-colors"
                style={{ background: menu ? '#22222e' : 'transparent' }}>
                <img src={user.avatar} alt={user.username}
                  className="w-7 h-7 rounded-full"
                  style={{ outline: '2px solid #3e3e54' }} />
                <span className="text-sm font-medium hidden sm:block" style={{ color: '#e8e8f0' }}>
                  {user.username}
                </span>
                {user.is_admin && (
                  <span className="text-xs px-1.5 py-0.5 rounded hidden sm:block"
                    style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}>
                    admin
                  </span>
                )}
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  style={{ color: '#8888a8', transform: menu ? 'rotate(180deg)' : '', transition: 'transform 0.15s' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {menu && (
                <div className="absolute right-0 mt-1.5 w-52 rounded-xl border py-1.5 z-50"
                  style={{ background: '#1a1a24', borderColor: '#2e2e3e', boxShadow: '0 16px 40px rgba(0,0,0,0.5)' }}>

                  {/* User info */}
                  <div className="px-3 py-2 mb-1 border-b" style={{ borderColor: '#2e2e3e' }}>
                    <p className="text-xs font-medium" style={{ color: '#e8e8f0' }}>{user.username}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#8888a8' }}>
                      {user.is_admin ? '⚡ Administrator' : 'Member'}
                    </p>
                  </div>

                  <MenuItem icon="🖼" label="Change avatar" onClick={() => open('avatar')} />
                  <MenuItem icon="🔑" label="Change password" onClick={() => open('password')} />

                  {user.is_admin && (
                    <>
                      <div className="my-1 mx-3 border-t" style={{ borderColor: '#2e2e3e' }} />
                      <MenuItem icon="👥" label="Manage users" onClick={() => open('admin')} accent />
                    </>
                  )}

                  <div className="my-1 mx-3 border-t" style={{ borderColor: '#2e2e3e' }} />
                  <MenuItem icon="↩" label="Sign out" onClick={() => { logout(); navigate('/login'); }} danger />
                </div>
              )}
            </div>
          ) : (
            <Link to="/login"
              className="text-sm px-4 py-1.5 rounded-lg font-medium"
              style={{
                background: 'linear-gradient(135deg, #7c6af7, #a78bfa)',
                color: '#fff',
                boxShadow: '0 2px 12px rgba(124,106,247,0.3)',
              }}>
              Sign in
            </Link>
          )}
        </div>
      </header>

      {modal === 'avatar'    && <AvatarModal onClose={() => setModal(null)} />}
      {modal === 'password'  && <ChangePasswordModal onClose={() => setModal(null)} />}
      {modal === 'admin'     && <AdminPanel onClose={() => setModal(null)} />}
    </>
  );
}

function MenuItem({ icon, label, onClick, accent, danger }) {
  const color = danger ? '#f87171' : accent ? '#a78bfa' : '#d0d0e8';
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors"
      style={{ color }}
      onMouseEnter={e => e.currentTarget.style.background = '#22222e'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <span className="text-base">{icon}</span>
      {label}
    </button>
  );
}

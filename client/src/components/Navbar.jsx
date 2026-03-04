import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CreateUserModal from './CreateUserModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{ background: 'rgba(15,15,19,0.85)', borderColor: '#2e2e3e' }}>
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl transition-transform group-hover:scale-110">✦</span>
            <span className="font-bold tracking-tight" style={{ color: '#e8e8f0' }}>DoneList</span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Admin badge + create user button */}
                {user.is_admin ? (
                  <button onClick={() => setShowModal(true)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 hover:opacity-80"
                    style={{
                      background: 'rgba(251,191,36,0.1)',
                      border: '1px solid rgba(251,191,36,0.25)',
                      color: '#fbbf24',
                    }}>
                    <span>⚡</span>
                    <span className="hidden sm:inline">Create user</span>
                  </button>
                ) : null}

                <div className="flex items-center gap-2">
                  <img src={user.avatar} alt={user.username}
                    className="w-7 h-7 rounded-full"
                    style={{ outline: '2px solid #2e2e3e' }} />
                  <span className="text-sm font-medium hidden sm:block" style={{ color: '#e8e8f0' }}>
                    {user.username}
                  </span>
                </div>
                <button onClick={handleLogout}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                  style={{ background: '#22222e', color: '#8888a8', border: '1px solid #2e2e3e' }}>
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/login"
                className="text-sm px-4 py-1.5 rounded-lg font-medium transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #7c6af7, #a78bfa)',
                  color: '#fff',
                  boxShadow: '0 2px 12px rgba(124,106,247,0.3)',
                }}>
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      {showModal && <CreateUserModal onClose={() => setShowModal(false)} />}
    </>
  );
}

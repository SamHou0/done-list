import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{
        background: 'rgba(15,15,19,0.85)',
        borderColor: '#2e2e3e',
      }}>
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-xl transition-transform group-hover:scale-110">✦</span>
          <span className="font-bold tracking-tight" style={{ color: '#e8e8f0' }}>DoneList</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <img src={user.avatar} alt={user.username}
                  className="w-7 h-7 rounded-full ring-2"
                  style={{ ringColor: '#7c6af7' }} />
                <span className="text-sm font-medium hidden sm:block" style={{ color: '#e8e8f0' }}>
                  {user.username}
                </span>
              </div>
              <button onClick={handleLogout}
                className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200 hover:opacity-80"
                style={{ background: '#22222e', color: '#8888a8', border: '1px solid #2e2e3e' }}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"
                className="text-sm px-3 py-1.5 rounded-lg transition-all duration-200 hover:opacity-80"
                style={{ color: '#8888a8' }}>
                Sign in
              </Link>
              <Link to="/register"
                className="text-sm px-3 py-1.5 rounded-lg font-medium transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #7c6af7, #a78bfa)',
                  color: '#fff',
                  boxShadow: '0 2px 12px rgba(124,106,247,0.3)',
                }}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const PAGES = [
  { label: 'Buy', href: '/search' },
  { label: 'Rent', href: '/search?type=rent' },
  { label: 'New Projects', href: '/search?type=projects' },
  { label: 'Commercial', href: '/search?type=commercial' },
  { label: 'Map View', href: '/map' },
  { label: 'Agents', href: '/dashboard' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
    setDropOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handler(e) { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleLogout() {
    logout();
    setDropOpen(false);
    navigate('/');
  }

  const initials = user ? user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '';

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="logo">Esta<span>tiq</span></Link>

        <div className="nav-links">
          {PAGES.map(p => {
            const base = p.href.split('?')[0];
            const active = location.pathname === base;
            return (
              <Link key={p.label} to={p.href} className={`nav-link ${active ? 'active' : ''}`}>{p.label}</Link>
            );
          })}
        </div>

        <div className="nav-right">
          {user ? (
            <div className="nav-user" ref={dropRef}>
              <div className="nav-avatar" onClick={() => setDropOpen(v => !v)} title={user.name}>{initials}</div>
              {dropOpen && (
                <div className="nav-dropdown">
                  <div className="nd-header">
                    <div className="nd-name">{user.name}</div>
                    <div className="nd-role">
                      <span className={`nd-role-badge ${user.role === 'franchise' ? 'nd-role-franchise' : 'nd-role-customer'}`}>
                        {user.role === 'franchise' ? '🏢 Franchise Partner' : '👤 Customer'}
                      </span>
                    </div>
                  </div>
                  <button className="nd-item" onClick={() => { navigate('/dashboard'); setDropOpen(false); }}>
                    <i className="ti ti-layout-dashboard"></i> Dashboard
                  </button>
                  <button className="nd-item" onClick={() => { navigate('/dashboard?section=saved'); setDropOpen(false); }}>
                    <i className="ti ti-heart"></i> Saved Properties
                  </button>
                  <button className="nd-item" onClick={() => { navigate('/dashboard?section=alerts'); setDropOpen(false); }}>
                    <i className="ti ti-bell"></i> My Alerts
                  </button>
                  <div className="nd-divider"></div>
                  <button className="nd-item" onClick={() => { navigate('/change-password'); setDropOpen(false); }}>
                    <i className="ti ti-lock"></i> Change Password
                  </button>
                  <button className="nd-item" onClick={() => { navigate('/dashboard?section=settings'); setDropOpen(false); }}>
                    <i className="ti ti-settings"></i> Settings
                  </button>
                  <div className="nd-divider"></div>
                  <button className="nd-item logout" onClick={handleLogout}>
                    <i className="ti ti-logout"></i> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/dashboard" className="btn-post">+ Post Property</Link>
              <Link to="/login" className="btn-signin">Sign In</Link>
            </>
          )}
          {/* Hamburger */}
          <button className="hamburger" onClick={() => setMenuOpen(v => !v)} aria-label="Toggle menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* Mobile nav overlay */}
      <div className={`mobile-nav ${menuOpen ? 'open' : ''}`}>
        {PAGES.map(p => (
          <Link key={p.label} to={p.href} className="nav-link" onClick={() => setMenuOpen(false)}>{p.label}</Link>
        ))}
        <div className="mobile-nav-btns">
          {user ? (
            <>
              <div style={{ padding: '12px 0', borderBottom: '0.5px solid rgba(255,255,255,0.1)', marginBottom: 8 }}>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>{user.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>
                  {user.role === 'franchise' ? 'Franchise Partner' : 'Customer'} · {user.email}
                </div>
              </div>
              <Link to="/dashboard" className="btn-post" style={{ textAlign: 'center', padding: '12px' }} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/change-password" className="btn-post" style={{ textAlign: 'center', padding: '12px' }} onClick={() => setMenuOpen(false)}>Change Password</Link>
              <button className="btn-signin" style={{ padding: '12px', borderRadius: 8 }} onClick={() => { handleLogout(); setMenuOpen(false); }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/signup" className="btn-post" style={{ textAlign: 'center', padding: '12px' }} onClick={() => setMenuOpen(false)}>Create Account</Link>
              <Link to="/login" className="btn-signin" style={{ textAlign: 'center', padding: '12px', borderRadius: 8 }} onClick={() => setMenuOpen(false)}>Sign In</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}

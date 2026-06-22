import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, findUser } from '../context/AuthContext.jsx';

const ROLES = [
  { key: 'customer', label: 'Customer', icon: 'ti-user', color: 'nd-role-customer' },
  { key: 'franchise', label: 'Franchise', icon: 'ti-building-store', color: 'nd-role-franchise' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter email and password.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const user = findUser(email);
    if (!user) { setError('No account found with this email.'); setLoading(false); return; }
    if (user.password !== password) { setError('Incorrect password. Please try again.'); setLoading(false); return; }
    if (user.role !== role) { setError(`This account is registered as a ${user.role}. Please select the correct role.`); setLoading(false); return; }
    login(user);
    navigate(role === 'franchise' ? '/dashboard?section=post' : '/');
  }

  return (
    <div className="auth-page">
      {/* LEFT PANEL */}
      <div className="auth-left">
        <div className="auth-left-bg"></div>
        <div className="auth-left-glow"></div>
        <div className="auth-left-glow2"></div>
        <div className="auth-brand">Esta<span>tiq</span></div>
        <h2 className="auth-headline">Welcome<br />back to<br /><em>your search</em></h2>
        <p className="auth-sub">Log in to continue exploring verified properties across India's top cities.</p>
        <div className="auth-features">
          <div className="auth-feature"><div className="af-icon"><i className="ti ti-heart"></i></div><span className="af-text">Access your saved properties instantly</span></div>
          <div className="auth-feature"><div className="af-icon"><i className="ti ti-bell"></i></div><span className="af-text">Get alerts for price drops & new matches</span></div>
          <div className="auth-feature"><div className="af-icon"><i className="ti ti-shield-check"></i></div><span className="af-text">Verified listings, zero brokerage</span></div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <div style={{ marginBottom: 24 }}>
            <Link to="/" style={{ fontSize: 13, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
              <i className="ti ti-arrow-left"></i> Back to home
            </Link>
            <h2>Sign in</h2>
            <p className="auth-desc">Choose your account type and enter your credentials.</p>
          </div>

          {/* Role Tabs */}
          <div className="role-tabs">
            {ROLES.map(r => (
              <button key={r.key} className={`role-tab ${role === r.key ? 'active' : ''}`} onClick={() => { setRole(r.key); setError(''); }}>
                <i className={`ti ${r.icon}`}></i> {r.label}
              </button>
            ))}
          </div>

          {role === 'franchise' && (
            <div className="franchise-notice">
              <i className="ti ti-info-circle"></i>
              <span>Franchise partners have access to listing management, leads, and analytics dashboards.</span>
            </div>
          )}

          {error && <div className="form-error"><i className="ti ti-alert-circle"></i> {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-icon-wrap">
                <i className="ti ti-mail"></i>
                <input className="form-control" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Password
                <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
              </label>
              <div className="input-icon-wrap">
                <i className="ti ti-lock"></i>
                <input className="form-control" type={showPwd ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" className="eye-toggle" onClick={() => setShowPwd(v => !v)}>
                  <i className={`ti ${showPwd ? 'ti-eye-off' : 'ti-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="form-check">
              <input type="checkbox" id="remember" checked={remember} onChange={e => setRemember(e.target.checked)} />
              <label htmlFor="remember">Remember me for 30 days</label>
            </div>

            <button type="submit" className="btn-full btn-full-navy" disabled={loading}>
              {loading ? <><i className="ti ti-loader-2" style={{ animation: 'spin 1s linear infinite' }}></i> Signing in…</> : <><i className="ti ti-login"></i> Sign In as {role === 'franchise' ? 'Franchise' : 'Customer'}</>}
            </button>
          </form>

          <div className="auth-footer-link" style={{ marginTop: 16 }}>
            Don't have an account? <Link to="/signup"><a>Create one free</a></Link>
          </div>
          <div className="auth-footer-link" style={{ marginTop: 8 }}>
            Are you a franchise partner? <Link to="/signup?role=franchise"><a>Apply here →</a></Link>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

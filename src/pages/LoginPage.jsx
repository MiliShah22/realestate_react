import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, findUser, DEFAULT_ACCOUNTS } from '../context/AuthContext.jsx';

const ROLES = [
  { key: 'customer', label: 'Customer', icon: 'ti-user' },
  { key: 'franchise', label: 'Franchise', icon: 'ti-building-store' },
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

  const demoAccount = DEFAULT_ACCOUNTS.find(a => a.role === role);

  function fillDemo() {
    setEmail(demoAccount.email);
    setPassword(demoAccount.password);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter email and password.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const user = findUser(email);
    setLoading(false);
    if (!user) { setError('No account found with this email.'); return; }
    if (user.password !== password) { setError('Incorrect password. Please try again.'); return; }
    if (user.role !== role) {
      setError(`This account is registered as a ${user.role}. Please select the correct role tab.`);
      return;
    }
    login(user);
    navigate(role === 'franchise' ? '/dashboard' : '/');
  }

  return (
    <div className="auth-page">
      {/* ── LEFT PANEL ── */}
      <div className="auth-left">
        <div className="auth-left-bg"></div>
        <div className="auth-left-glow"></div>
        <div className="auth-left-glow2"></div>
        <Link to="/" className="auth-brand">Esta<span>tiq</span></Link>
        <h2 className="auth-headline">Welcome<br />back to<br /><em>your search</em></h2>
        <p className="auth-sub">Log in to continue exploring verified properties across India's top cities.</p>
        <div className="auth-features">
          <div className="auth-feature">
            <div className="af-icon"><i className="ti ti-heart"></i></div>
            <span className="af-text">Access your saved properties instantly</span>
          </div>
          <div className="auth-feature">
            <div className="af-icon"><i className="ti ti-bell"></i></div>
            <span className="af-text">Get alerts for price drops & new matches</span>
          </div>
          <div className="auth-feature">
            <div className="af-icon"><i className="ti ti-shield-check"></i></div>
            <span className="af-text">Verified listings, zero brokerage</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <Link to="/" style={{ fontSize: 13, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
            <i className="ti ti-arrow-left"></i> Back to home
          </Link>
          <h2>Sign in</h2>
          <p className="auth-desc">Choose your account type and enter your credentials.</p>

          {/* Role Tabs */}
          <div className="role-tabs">
            {ROLES.map(r => (
              <button key={r.key} className={`role-tab ${role === r.key ? 'active' : ''}`}
                onClick={() => { setRole(r.key); setEmail(''); setPassword(''); setError(''); }}>
                <i className={`ti ${r.icon}`}></i> {r.label}
              </button>
            ))}
          </div>

          {/* Demo Credentials Banner */}
          <div className="demo-banner">
            <div className="demo-banner-top">
              <div className="demo-banner-icon">
                <i className={`ti ${role === 'franchise' ? 'ti-building-store' : 'ti-user-check'}`}></i>
              </div>
              <div className="demo-banner-text">
                <div className="demo-banner-title">
                  {role === 'franchise' ? 'Franchise Demo Account' : 'Customer Demo Account'}
                </div>
                <div className="demo-banner-sub">Use these credentials to explore the full {role} experience</div>
              </div>
            </div>
            <div className="demo-creds">
              <div className="demo-cred-row">
                <span className="demo-cred-label"><i className="ti ti-mail"></i> Email</span>
                <span className="demo-cred-value">{demoAccount.email}</span>
              </div>
              <div className="demo-cred-row">
                <span className="demo-cred-label"><i className="ti ti-lock"></i> Password</span>
                <span className="demo-cred-value">{demoAccount.password}</span>
              </div>
            </div>
            <button type="button" className="demo-fill-btn" onClick={fillDemo}>
              <i className="ti ti-bolt"></i> Auto-fill & sign in
            </button>
          </div>

          {role === 'franchise' && (
            <div className="franchise-notice">
              <i className="ti ti-info-circle"></i>
              <span>Franchise partners have access to listing management, lead tracking, and analytics dashboards.</span>
            </div>
          )}

          {error && <div className="form-error"><i className="ti ti-alert-circle"></i> {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-icon-wrap">
                <i className="ti ti-mail"></i>
                <input className="form-control" type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">
                Password
                <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
              </label>
              <div className="input-icon-wrap">
                <i className="ti ti-lock"></i>
                <input className="form-control" type={showPwd ? 'text' : 'password'}
                  placeholder="Enter your password" value={password}
                  onChange={e => setPassword(e.target.value)} />
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
              {loading
                ? <><i className="ti ti-loader-2" style={{ animation: 'spin 1s linear infinite' }}></i> Signing in…</>
                : <><i className="ti ti-login"></i> Sign In as {role === 'franchise' ? 'Franchise' : 'Customer'}</>}
            </button>
          </form>

          <div className="auth-footer-link" style={{ marginTop: 16 }}>
            Don't have an account? <Link to="/signup">Create one free</Link>
          </div>
          <div className="auth-footer-link" style={{ marginTop: 8 }}>
            Franchise partner? <Link to="/signup?role=franchise">Apply here →</Link>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

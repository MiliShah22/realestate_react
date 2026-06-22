import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, findUser, updatePassword } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

function pwdStrength(pwd) {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return { score: s, label: ['','Weak','Fair','Good','Strong'][s], color: ['','#e84040','#f0a020','#2d8a56','#16a34a'][s], width: `${s*25}%` };
}

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const pwd = pwdStrength(newPwd);

  if (!user) {
    return (
      <>
        <Navbar />
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24 }}>
          <i className="ti ti-lock" style={{ fontSize: 48, color: 'var(--text3)' }}></i>
          <p style={{ fontSize: 15, color: 'var(--text2)' }}>You must be logged in to change your password.</p>
          <button className="btn-navy" style={{ padding: '10px 24px' }} onClick={() => navigate('/login')}>Sign In</button>
        </div>
        <Footer />
      </>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!currentPwd || !newPwd || !confirmPwd) { setError('Please fill all fields.'); return; }
    const stored = findUser(user.email);
    if (stored?.password !== currentPwd) { setError('Current password is incorrect.'); return; }
    if (currentPwd === newPwd) { setError('New password must be different from current password.'); return; }
    if (pwd.score < 2) { setError('New password is too weak. Add numbers, uppercase & special characters.'); return; }
    if (newPwd !== confirmPwd) { setError('New passwords do not match.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    updatePassword(user.email, newPwd);
    setLoading(false);
    setSuccess(true);
  }

  return (
    <>
      <Navbar />
      <div style={{ background: 'var(--cream)', minHeight: 'calc(100vh - 64px)', padding: '40px 20px' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>

          {/* Breadcrumb */}
          <div className="breadcrumb" style={{ marginBottom: 24 }}>
            <Link to="/">Home</Link>
            <i className="ti ti-chevron-right" style={{ fontSize: 12 }}></i>
            <Link to="/dashboard">My Account</Link>
            <i className="ti ti-chevron-right" style={{ fontSize: 12 }}></i>
            <span>Change Password</span>
          </div>

          <div className="post-form" style={{ background: '#fff', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', padding: 32 }}>

            {!success ? (
              <>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, paddingBottom: 20, borderBottom: '0.5px solid var(--border)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#e8ebf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'var(--navy)' }}>
                    <i className="ti ti-lock"></i>
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontFamily: "'Playfair Display',serif", fontWeight: 700, color: 'var(--navy)' }}>Change Password</div>
                    <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>Logged in as {user.email}</div>
                  </div>
                </div>

                {/* Security tips */}
                <div style={{ background: '#f8f9fb', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: 24, fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>
                  <strong style={{ color: 'var(--navy)', fontSize: 12 }}>Tips for a strong password:</strong><br />
                  Use 8+ characters · Mix uppercase & lowercase · Add numbers · Include special characters (!@#$%)
                </div>

                {error && <div className="form-error"><i className="ti ti-alert-circle"></i> {error}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Current Password *</label>
                    <div className="input-icon-wrap">
                      <i className="ti ti-lock"></i>
                      <input
                        className="form-control"
                        type={showCurrent ? 'text' : 'password'}
                        placeholder="Enter current password"
                        value={currentPwd}
                        onChange={e => setCurrentPwd(e.target.value)}
                      />
                      <button type="button" className="eye-toggle" onClick={() => setShowCurrent(v => !v)}>
                        <i className={`ti ${showCurrent ? 'ti-eye-off' : 'ti-eye'}`}></i>
                      </button>
                    </div>
                    <div style={{ textAlign: 'right', marginTop: 4 }}>
                      <Link to="/forgot-password" className="forgot-link" style={{ float: 'none' }}>Forgot current password?</Link>
                    </div>
                  </div>

                  <div className="divider"></div>

                  <div className="form-group">
                    <label className="form-label">New Password *</label>
                    <div className="input-icon-wrap">
                      <i className="ti ti-lock-plus"></i>
                      <input
                        className="form-control"
                        type={showNew ? 'text' : 'password'}
                        placeholder="Create new password"
                        value={newPwd}
                        onChange={e => setNewPwd(e.target.value)}
                      />
                      <button type="button" className="eye-toggle" onClick={() => setShowNew(v => !v)}>
                        <i className={`ti ${showNew ? 'ti-eye-off' : 'ti-eye'}`}></i>
                      </button>
                    </div>
                    {newPwd && (
                      <>
                        <div className="strength-bar">
                          <div className="strength-fill" style={{ width: pwd.width, background: pwd.color }}></div>
                        </div>
                        <div className="strength-label" style={{ color: pwd.color }}>
                          Password strength: {pwd.label}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8 }}>
                          {[['8+ characters', newPwd.length >= 8], ['Uppercase letter', /[A-Z]/.test(newPwd)], ['Number', /[0-9]/.test(newPwd)], ['Special character', /[^A-Za-z0-9]/.test(newPwd)]].map(([label, ok]) => (
                            <div key={label} style={{ fontSize: 11, color: ok ? 'var(--success)' : 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <i className={`ti ${ok ? 'ti-check' : 'ti-x'}`} style={{ fontSize: 12 }}></i> {label}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm New Password *</label>
                    <div className="input-icon-wrap">
                      <i className="ti ti-lock-check"></i>
                      <input
                        className="form-control"
                        type="password"
                        placeholder="Repeat new password"
                        value={confirmPwd}
                        onChange={e => setConfirmPwd(e.target.value)}
                      />
                    </div>
                    {confirmPwd && (
                      <div style={{ fontSize: 12, marginTop: 4, color: newPwd === confirmPwd ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <i className={`ti ${newPwd === confirmPwd ? 'ti-check' : 'ti-x'}`} style={{ fontSize: 12 }}></i>
                        {newPwd === confirmPwd ? 'Passwords match' : 'Passwords do not match'}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    <button type="button" className="btn-outline" style={{ flex: 1, padding: '12px' }} onClick={() => navigate('/dashboard')}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-full btn-full-navy" style={{ flex: 2 }} disabled={loading}>
                      {loading ? 'Updating…' : <><i className="ti ti-lock-check"></i> Update Password</>}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="success-box">
                <div className="success-icon"><i className="ti ti-check"></i></div>
                <h3>Password Changed!</h3>
                <p>Your password has been updated successfully. For security, all other sessions have been signed out.</p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
                  <button className="btn-outline" style={{ padding: '10px 20px' }} onClick={() => { logout(); navigate('/login'); }}>
                    Sign in again
                  </button>
                  <button className="btn-navy" style={{ padding: '10px 20px' }} onClick={() => navigate('/dashboard')}>
                    Go to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

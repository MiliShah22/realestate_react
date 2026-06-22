import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { findUser, updatePassword } from '../context/AuthContext.jsx';

function pwdStrength(pwd) {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return { score: s, label: ['','Weak','Fair','Good','Strong'][s], color: ['','#e84040','#f0a020','#2d8a56','#16a34a'][s], width: `${s*25}%` };
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=newpwd, 4=success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['','','','','','']);
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const pwd = pwdStrength(newPwd);

  function handleOtp(i, val) {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5) document.getElementById(`fp-otp-${i+1}`)?.focus();
  }

  async function step1Submit(e) {
    e.preventDefault(); setError('');
    if (!email) { setError('Please enter your email.'); return; }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) { setError('Enter a valid email address.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const user = findUser(email);
    setLoading(false);
    if (!user) { setError('No account found with this email.'); return; }
    setStep(2);
  }

  async function step2Submit(e) {
    e.preventDefault(); setError('');
    if (otp.join('').length < 6) { setError('Enter the 6-digit OTP.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
    setStep(3);
  }

  async function step3Submit(e) {
    e.preventDefault(); setError('');
    if (!newPwd || !confirmPwd) { setError('Please fill both fields.'); return; }
    if (pwd.score < 2) { setError('Password is too weak.'); return; }
    if (newPwd !== confirmPwd) { setError('Passwords do not match.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    updatePassword(email, newPwd);
    setLoading(false);
    setStep(4);
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-bg"></div>
        <div className="auth-left-glow"></div>
        <div className="auth-left-glow2"></div>
        <div className="auth-brand">Esta<span>tiq</span></div>
        <h2 className="auth-headline">Reset your<br /><em>password</em><br />safely</h2>
        <p className="auth-sub">We use OTP verification to ensure only you can reset your Estatiq account password.</p>
        <div className="auth-features">
          <div className="auth-feature"><div className="af-icon"><i className="ti ti-mail"></i></div><span className="af-text">OTP sent to your registered email</span></div>
          <div className="auth-feature"><div className="af-icon"><i className="ti ti-shield-lock"></i></div><span className="af-text">End-to-end encrypted reset flow</span></div>
          <div className="auth-feature"><div className="af-icon"><i className="ti ti-clock"></i></div><span className="af-text">OTP valid for 10 minutes only</span></div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <Link to="/login" style={{ fontSize: 13, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
            <i className="ti ti-arrow-left"></i> Back to login
          </Link>

          <div className="step-dots">
            {[1,2,3,4].map(s => (
              <div key={s} className={`step-dot ${s === step ? 'active' : s < step ? 'done' : ''}`}></div>
            ))}
          </div>

          {/* Step 1 – Email */}
          {step === 1 && (
            <>
              <h2>Forgot password?</h2>
              <p className="auth-desc">Enter the email linked to your account and we'll send a reset OTP.</p>
              {error && <div className="form-error"><i className="ti ti-alert-circle"></i> {error}</div>}
              <form onSubmit={step1Submit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-icon-wrap">
                    <i className="ti ti-mail"></i>
                    <input className="form-control" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>
                <button type="submit" className="btn-full btn-full-navy" disabled={loading}>
                  {loading ? 'Sending OTP…' : <><i className="ti ti-send"></i> Send Reset OTP</>}
                </button>
              </form>
            </>
          )}

          {/* Step 2 – OTP */}
          {step === 2 && (
            <>
              <h2>Enter OTP</h2>
              <p className="auth-desc">A 6-digit code was sent to <strong>{email}</strong>. Check your inbox.</p>
              {error && <div className="form-error"><i className="ti ti-alert-circle"></i> {error}</div>}
              <form onSubmit={step2Submit}>
                <div className="otp-inputs">
                  {otp.map((v, i) => (
                    <input key={i} id={`fp-otp-${i}`} className="otp-input" maxLength={1} value={v}
                      onChange={e => handleOtp(i, e.target.value)}
                      onKeyDown={e => { if (e.key === 'Backspace' && !v && i > 0) document.getElementById(`fp-otp-${i-1}`)?.focus(); }}
                    />
                  ))}
                </div>
                <button type="submit" className="btn-full btn-full-navy" disabled={loading}>
                  {loading ? 'Verifying…' : <><i className="ti ti-check"></i> Verify OTP</>}
                </button>
              </form>
              <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text3)', marginTop: 14 }}>
                Didn't get it? <a style={{ color: 'var(--navy)', fontWeight: 600, cursor: 'pointer' }} onClick={() => setStep(1)}>Change email</a> or <a style={{ color: 'var(--navy)', fontWeight: 600, cursor: 'pointer' }}>Resend OTP</a>
              </p>
              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>(Demo: any 6 digits work)</p>
            </>
          )}

          {/* Step 3 – New Password */}
          {step === 3 && (
            <>
              <h2>Set new password</h2>
              <p className="auth-desc">Choose a strong password you haven't used before.</p>
              {error && <div className="form-error"><i className="ti ti-alert-circle"></i> {error}</div>}
              <form onSubmit={step3Submit}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="input-icon-wrap">
                    <i className="ti ti-lock"></i>
                    <input className="form-control" type={showPwd ? 'text' : 'password'} placeholder="New strong password" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
                    <button type="button" className="eye-toggle" onClick={() => setShowPwd(v => !v)}>
                      <i className={`ti ${showPwd ? 'ti-eye-off' : 'ti-eye'}`}></i>
                    </button>
                  </div>
                  {newPwd && <><div className="strength-bar"><div className="strength-fill" style={{ width: pwd.width, background: pwd.color }}></div></div><div className="strength-label" style={{ color: pwd.color }}>{pwd.label}</div></>}
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <div className="input-icon-wrap">
                    <i className="ti ti-lock-check"></i>
                    <input className="form-control" type="password" placeholder="Repeat new password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} />
                  </div>
                  {confirmPwd && newPwd !== confirmPwd && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>Passwords do not match</div>}
                </div>
                <button type="submit" className="btn-full btn-full-gold" disabled={loading}>
                  {loading ? 'Updating…' : <><i className="ti ti-lock-check"></i> Update Password</>}
                </button>
              </form>
            </>
          )}

          {/* Step 4 – Success */}
          {step === 4 && (
            <div className="success-box">
              <div className="success-icon"><i className="ti ti-check"></i></div>
              <h3>Password updated!</h3>
              <p>Your password has been reset successfully. You can now sign in with your new credentials.</p>
              <button className="btn-full btn-full-navy" style={{ marginTop: 24 }} onClick={() => navigate('/login')}>
                <i className="ti ti-login"></i> Go to Login
              </button>
            </div>
          )}

          {step < 4 && (
            <div className="auth-footer-link" style={{ marginTop: 20 }}>
              Remembered it? <Link to="/login"><a>Back to login</a></Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

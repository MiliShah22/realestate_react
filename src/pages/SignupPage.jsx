import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { gql } from '../lib/gqlClient.js';
import { REQUEST_PASSWORD_RESET_MUTATION, VERIFY_OTP_MUTATION } from '../lib/queries.js';

const ROLES = [
  { key:'customer',  label:'Customer',          icon:'ti-user' },
  { key:'franchise', label:'Franchise Partner',  icon:'ti-building-store' },
];

function pwdStrength(pwd) {
  let s=0;
  if(pwd.length>=8)s++;
  if(/[A-Z]/.test(pwd))s++;
  if(/[0-9]/.test(pwd))s++;
  if(/[^A-Za-z0-9]/.test(pwd))s++;
  return {score:s,label:['','Weak','Fair','Good','Strong'][s],color:['','#e84040','#f0a020','#2d8a56','#16a34a'][s],width:`${s*25}%`};
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { signup } = useAuth();

  const [role, setRole]   = useState(params.get('role')||'customer');
  const [step, setStep]   = useState(1);
  const [form, setForm]   = useState({ name:'',phone:'',city:'',businessName:'',gstin:'',email:'',password:'',confirmPwd:'' });
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(['','','','','','']);
  const [otpError, setOtpError] = useState('');

  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const pwd = pwdStrength(form.password);

  function handleOtp(i,val) {
    if(!/^\d?$/.test(val))return;
    const next=[...otp]; next[i]=val; setOtp(next);
    if(val && i<5) document.getElementById(`otp-${i+1}`)?.focus();
  }

  async function step1(e) {
    e.preventDefault(); setError('');
    if(!form.name||!form.phone||!form.city){setError('Please fill all required fields.');return;}
    if(role==='franchise'&&!form.businessName){setError('Business name is required.');return;}
    setStep(2);
  }

  async function step2(e) {
    e.preventDefault(); setError('');
    if(!form.email||!form.password||!form.confirmPwd){setError('Please fill all fields.');return;}
    if(!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)){setError('Enter a valid email address.');return;}
    if(pwd.score<2){setError('Password is too weak.');return;}
    if(form.password!==form.confirmPwd){setError('Passwords do not match.');return;}
    if(!agree){setError('Please accept the Terms & Privacy Policy.');return;}
    setLoading(true);
    try {
      // Register via API — API sends OTP to email
      await signup(form, role);
      // On success, user is logged in — skip OTP step if API auto-verifies
      // (depends on API config). Move to OTP step to collect code.
      setStep(3);
    } catch(err) {
      setError(err.message||'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function step3(e) {
    e.preventDefault(); setOtpError('');
    const code = otp.join('');
    if(code.length<6){setOtpError('Please enter the 6-digit OTP.');return;}
    setLoading(true);
    try {
      // verifyOtp args: contact (email), code, purpose
      await gql(VERIFY_OTP_MUTATION, { contact: form.email, code, purpose: 'EMAIL_VERIFY' });
      navigate(role==='franchise'?'/dashboard':'/');
    } catch(err) {
      setOtpError(err.message||'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-bg"></div>
        <div className="auth-left-glow"></div>
        <div className="auth-left-glow2"></div>
        <Link to="/" className="auth-brand">Esta<span>tiq</span></Link>
        <h2 className="auth-headline">Join<br /><em>2.4 lakh+</em><br />property seekers</h2>
        <p className="auth-sub">Create a free account and start searching verified properties across India's fastest growing cities.</p>
        <div className="auth-features">
          <div className="auth-feature"><div className="af-icon"><i className="ti ti-map-pin"></i></div><span className="af-text">Search 2.4L+ verified listings</span></div>
          <div className="auth-feature"><div className="af-icon"><i className="ti ti-calculator"></i></div><span className="af-text">EMI calculator &amp; budget planner</span></div>
          <div className="auth-feature"><div className="af-icon"><i className="ti ti-users"></i></div><span className="af-text">Connect directly with builders &amp; agents</span></div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <Link to="/" style={{fontSize:13,color:'var(--text3)',display:'flex',alignItems:'center',gap:6,marginBottom:20}}>
            <i className="ti ti-arrow-left"></i> Back to home
          </Link>

          <div className="step-dots">
            {[1,2,3].map(s=>(
              <div key={s} className={`step-dot ${s===step?'active':s<step?'done':''}`}></div>
            ))}
          </div>

          <h2>{step===1?'Create account':step===2?'Account details':'Verify email'}</h2>
          <p className="auth-desc">
            {step===1?'Tell us about yourself.':step===2?'Set your login credentials.':`Enter the OTP sent to ${form.email}`}
          </p>

          {step===1 && (
            <>
              <div className="role-tabs">
                {ROLES.map(r=>(
                  <button key={r.key} className={`role-tab ${role===r.key?'active':''}`} onClick={()=>{setRole(r.key);setError('');}}>
                    <i className={`ti ${r.icon}`}></i> {r.label.split(' ')[0]}
                  </button>
                ))}
              </div>
              {role==='franchise'&&<div className="franchise-notice"><i className="ti ti-building-store"></i><span>Franchise partners get a dedicated dashboard with listing management, lead tracking, and analytics.</span></div>}
              {error&&<div className="form-error"><i className="ti ti-alert-circle"></i> {error}</div>}
              <form onSubmit={step1}>
                <div className="form-group"><label className="form-label">Full Name *</label><div className="input-icon-wrap"><i className="ti ti-user"></i><input className="form-control" placeholder="Arjun Reddy" value={form.name} onChange={e=>set('name',e.target.value)}/></div></div>
                <div className="grid-2" style={{gap:14}}>
                  <div className="form-group"><label className="form-label">Phone *</label><div className="input-icon-wrap"><i className="ti ti-phone"></i><input className="form-control" placeholder="+91 98765 43210" value={form.phone} onChange={e=>set('phone',e.target.value)}/></div></div>
                  <div className="form-group"><label className="form-label">City *</label><div className="input-icon-wrap"><i className="ti ti-map-pin"></i><select className="form-control" value={form.city} onChange={e=>set('city',e.target.value)} style={{paddingLeft:38}}><option value="">Select city</option>{['Bengaluru','Mumbai','Delhi NCR','Hyderabad','Pune','Chennai','Kolkata','Ahmedabad'].map(c=><option key={c}>{c}</option>)}</select></div></div>
                </div>
                {role==='franchise'&&<>
                  <div className="form-group"><label className="form-label">Business / Agency Name *</label><div className="input-icon-wrap"><i className="ti ti-building-store"></i><input className="form-control" placeholder="Your Agency Name" value={form.businessName} onChange={e=>set('businessName',e.target.value)}/></div></div>
                  <div className="form-group"><label className="form-label">GSTIN (optional)</label><div className="input-icon-wrap"><i className="ti ti-file-certificate"></i><input className="form-control" placeholder="22AAAAA0000A1Z5" value={form.gstin} onChange={e=>set('gstin',e.target.value)}/></div></div>
                </>}
                <button type="submit" className="btn-full btn-full-navy" style={{marginTop:8}}>Continue <i className="ti ti-arrow-right"></i></button>
              </form>
            </>
          )}

          {step===2&&(
            <>
              {error&&<div className="form-error"><i className="ti ti-alert-circle"></i> {error}</div>}
              <form onSubmit={step2}>
                <div className="form-group"><label className="form-label">Email Address *</label><div className="input-icon-wrap"><i className="ti ti-mail"></i><input className="form-control" type="email" placeholder="you@example.com" value={form.email} onChange={e=>set('email',e.target.value)}/></div></div>
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <div className="input-icon-wrap"><i className="ti ti-lock"></i><input className="form-control" type={showPwd?'text':'password'} placeholder="Create a strong password" value={form.password} onChange={e=>set('password',e.target.value)}/><button type="button" className="eye-toggle" onClick={()=>setShowPwd(v=>!v)}><i className={`ti ${showPwd?'ti-eye-off':'ti-eye'}`}></i></button></div>
                  {form.password&&<><div className="strength-bar"><div className="strength-fill" style={{width:pwd.width,background:pwd.color}}></div></div><div className="strength-label" style={{color:pwd.color}}>{pwd.label} password</div></>}
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password *</label>
                  <div className="input-icon-wrap"><i className="ti ti-lock-check"></i><input className="form-control" type={showConfirm?'text':'password'} placeholder="Repeat your password" value={form.confirmPwd} onChange={e=>set('confirmPwd',e.target.value)}/><button type="button" className="eye-toggle" onClick={()=>setShowConfirm(v=>!v)}><i className={`ti ${showConfirm?'ti-eye-off':'ti-eye'}`}></i></button></div>
                  {form.confirmPwd&&form.password!==form.confirmPwd&&<div style={{fontSize:12,color:'var(--danger)',marginTop:4}}>Passwords do not match</div>}
                </div>
                <div className="form-check"><input type="checkbox" id="agree" checked={agree} onChange={e=>setAgree(e.target.checked)}/><label htmlFor="agree">I agree to Estatiq's <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></label></div>
                <div style={{display:'flex',gap:10}}>
                  <button type="button" className="btn-outline" style={{flex:1,padding:13}} onClick={()=>{setStep(1);setError('');}}><i className="ti ti-arrow-left"></i> Back</button>
                  <button type="submit" className="btn-full btn-full-navy" style={{flex:2}} disabled={loading}>{loading?'Creating account…':'Create Account'}</button>
                </div>
              </form>
            </>
          )}

          {step===3&&(
            <form onSubmit={step3}>
              {otpError&&<div className="form-error"><i className="ti ti-alert-circle"></i> {otpError}</div>}
              <div className="otp-inputs">
                {otp.map((v,i)=>(
                  <input key={i} id={`otp-${i}`} className="otp-input" maxLength={1} value={v}
                    onChange={e=>handleOtp(i,e.target.value)}
                    onKeyDown={e=>{if(e.key==='Backspace'&&!v&&i>0)document.getElementById(`otp-${i-1}`)?.focus();}}/>
                ))}
              </div>
              <button type="submit" className="btn-full btn-full-gold" disabled={loading}>
                {loading?'Verifying…':<><i className="ti ti-check"></i> Verify &amp; Get Started</>}
              </button>
              <p style={{textAlign:'center',fontSize:13,color:'var(--text3)',marginTop:16}}>
                Didn't receive it? <a style={{color:'var(--navy)',fontWeight:600,cursor:'pointer'}} onClick={()=>gql(REQUEST_PASSWORD_RESET_MUTATION,{email:form.email})}>Resend OTP</a>
              </p>
            </form>
          )}

          <div className="auth-footer-link" style={{marginTop:20}}>
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

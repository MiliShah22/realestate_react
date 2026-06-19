import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import PropCard from '../components/PropCard.jsx';
import Stars from '../components/Stars.jsx';
import { PROPERTIES } from '../data/data.js';

const BADGE_LABEL = { new: 'New', hot: 'Hot', ready: 'Ready to Move', proj: 'Project' };

export default function PropertyDetailPage() {
  const params = useParams();
  const id = parseInt(params.id);
  const prop = PROPERTIES.find((p) => p.id === id) || PROPERTIES[0];

  const [tab, setTab] = useState('desc');
  const [loanAmt, setLoanAmt] = useState(Math.round(prop.priceLakhs * 0.8));
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [downPay, setDownPay] = useState(20);
  const [emi, setEmi] = useState({ monthly: 0, total: 0, interest: 0 });

  useEffect(() => {
    const principal = loanAmt * 100000;
    const r = rate / 12 / 100;
    const n = tenure * 12;
    const monthly = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = monthly * n;
    setEmi({ monthly, total, interest: total - principal });
  }, [loanAmt, rate, tenure]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const similar = PROPERTIES.filter((p) => p.id !== prop.id).slice(0, 3);

  return (
    <>
      <Navbar />

      <div className={`detail-hero ${prop.color}`}>
        <i className="ti ti-building" aria-hidden="true"></i>
        <div className="hero-overlay"></div>
        <div className="hero-badges">
          <span className={`prop-badge badge-${prop.badge}`}>{BADGE_LABEL[prop.badge] || prop.badge}</span>
          <span className="prop-badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
            RERA Verified
          </span>
        </div>
        <div className="hero-info">
          <div className="hi-left">
            <h1>{prop.name}</h1>
            <p>
              <i className="ti ti-map-pin" aria-hidden="true"></i> {prop.loc}
            </p>
          </div>
          <div className="hi-right">
            <div className="price-big">{prop.price}</div>
            <div className="price-psf">onwards · ₹8,621/sq.ft</div>
          </div>
        </div>
      </div>

      <div className="thumb-strip">
        {['blue', 'green', 'warm', 'purple'].map((c, i) => (
          <div key={c} className={`thumb ${c} ${i === 0 ? 'active-thumb' : ''}`}>
            <i className="ti ti-building" aria-hidden="true"></i>
          </div>
        ))}
        <div
          className="thumb"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px dashed rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.3)',
            fontSize: 13,
            fontWeight: 500,
            width: 'auto',
            padding: '0 14px',
          }}
        >
          +12 Photos
        </div>
      </div>

      <div className="detail-layout">
        <div className="detail-main">
          <div className="breadcrumb">
            <Link to="/">Home</Link> <i className="ti ti-chevron-right" style={{ fontSize: 12 }}></i>
            <Link to="/search">Properties</Link> <i className="ti ti-chevron-right" style={{ fontSize: 12 }}></i>
            <span>{prop.name}</span>
          </div>

          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, marginBottom: 8 }}>{prop.name}</h2>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <i className="ti ti-map-pin" style={{ fontSize: 14 }}></i> {prop.loc}
              </span>
              <span className="tag tag-navy">{prop.type}</span>
              <span className="tag tag-green">{prop.status}</span>
              <span
                style={{
                  fontSize: 13,
                  color: 'var(--text3)',
                  marginLeft: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <i className="ti ti-eye" style={{ fontSize: 14 }}></i> {prop.views} views
              </span>
            </div>
          </div>

          <div className="overview-grid">
            <div className="ov-card">
              <div className="ov-label">Configuration</div>
              <div className="ov-val">{prop.bhk}</div>
            </div>
            <div className="ov-card">
              <div className="ov-label">Carpet Area</div>
              <div className="ov-val">{prop.area}</div>
            </div>
            <div className="ov-card">
              <div className="ov-label">Status</div>
              <div className="ov-val">{prop.status}</div>
            </div>
            <div className="ov-card">
              <div className="ov-label">Possession</div>
              <div className="ov-val">{prop.possession}</div>
            </div>
            <div className="ov-card">
              <div className="ov-label">Developer</div>
              <div className="ov-val">{prop.builder}</div>
            </div>
            <div className="ov-card">
              <div className="ov-label">Rating</div>
              <div className="ov-val" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Stars rating={prop.rating} /> <span style={{ fontSize: 13 }}>{prop.rating}</span>
              </div>
            </div>
          </div>

          <div className="tabs">
            <button className={`tab-btn ${tab === 'desc' ? 'active' : ''}`} onClick={() => setTab('desc')}>
              Description
            </button>
            <button className={`tab-btn ${tab === 'amenities' ? 'active' : ''}`} onClick={() => setTab('amenities')}>
              Amenities
            </button>
            <button className={`tab-btn ${tab === 'specs' ? 'active' : ''}`} onClick={() => setTab('specs')}>
              Floor Plan
            </button>
          </div>

          {tab === 'desc' && (
            <>
              <p className="desc-text">
                {prop.desc} This property is developed by {prop.builder}, one of India's most trusted real
                estate developers. The project adheres to all RERA guidelines and offers complete transparency in
                documentation and delivery timelines.
              </p>
              <p className="desc-text">
                The project is strategically located with easy access to top educational institutions, hospitals, IT
                parks, and shopping centres. Residents will enjoy a peaceful yet well-connected lifestyle.
              </p>
            </>
          )}

          {tab === 'amenities' && (
            <div className="amenities-grid">
              {[...prop.amenities, "Children's Play Area", 'Lift', 'CCTV Surveillance', 'Intercom'].map((a) => (
                <div className="amenity" key={a}>
                  <i className="ti ti-check" aria-hidden="true"></i> {a}
                </div>
              ))}
            </div>
          )}

          {tab === 'specs' && (
            <div style={{ background: '#f8f9fb', borderRadius: 'var(--radius)', padding: 40, textAlign: 'center', color: 'var(--text3)' }}>
              <i className="ti ti-layout-2" style={{ fontSize: 48, marginBottom: 12, display: 'block', opacity: 0.4 }}></i>
              <p style={{ fontSize: 14 }}>Floor plan available on request.</p>
              <button className="btn-navy" style={{ marginTop: 14 }}>
                Request Floor Plan
              </button>
            </div>
          )}

          {/* EMI CALCULATOR */}
          <div className="emi-box">
            <h3>EMI Calculator</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Loan Amount (₹ Lakhs)</label>
                <input
                  type="number"
                  className="form-control"
                  value={loanAmt}
                  min="5"
                  max="1000"
                  onChange={(e) => setLoanAmt(Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Interest Rate (%)</label>
                <input
                  type="number"
                  className="form-control"
                  value={rate}
                  step="0.1"
                  min="6"
                  max="15"
                  onChange={(e) => setRate(Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tenure (Years)</label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  style={{ marginTop: 8 }}
                />
                <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{tenure} yrs</div>
              </div>
              <div className="form-group">
                <label className="form-label">Down Payment (%)</label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={downPay}
                  onChange={(e) => setDownPay(Number(e.target.value))}
                  style={{ marginTop: 8 }}
                />
                <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{downPay}%</div>
              </div>
            </div>
            <div className="emi-result">
              <div className="emi-amount">₹{Math.round(emi.monthly).toLocaleString('en-IN')}</div>
              <div className="emi-label">Monthly EMI (estimated)</div>
              <div className="emi-breakdown">
                <div className="emi-bd">
                  <div className="emi-bd-num">₹{(emi.total / 100000).toFixed(1)}L</div>
                  <div className="emi-bd-lbl">Total Payment</div>
                </div>
                <div className="emi-bd">
                  <div className="emi-bd-num">₹{(emi.interest / 100000).toFixed(1)}L</div>
                  <div className="emi-bd-lbl">Total Interest</div>
                </div>
              </div>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 12, textAlign: 'center' }}>
              *EMI is indicative. Actual rates depend on bank and applicant profile.
            </p>
          </div>
        </div>

        <aside className="detail-sidebar">
          <div className="contact-card">
            <div className="contact-price">{prop.price}</div>
            <div className="contact-psf">{prop.area} · ₹8,621/sq.ft</div>
            <div className="divider"></div>
            <div className="agent-row">
              <div className="agent-avatar">PS</div>
              <div>
                <div className="agent-name">Priya Sharma</div>
                <div className="agent-tag">Verified Agent · {prop.builder}</div>
                <div className="agent-rating">
                  <Stars rating={4.9} /> <span>4.9 (312 deals)</span>
                </div>
              </div>
            </div>
            <div className="contact-btns">
              <button className="btn-call">
                <i className="ti ti-phone" aria-hidden="true"></i> Call Agent
              </button>
              <button className="btn-whatsapp">
                <i className="ti ti-brand-whatsapp" aria-hidden="true"></i> WhatsApp
              </button>
              <button className="btn-email-cta">
                <i className="ti ti-mail" aria-hidden="true"></i> Send Enquiry
              </button>
            </div>
            <div className="divider"></div>
            <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', lineHeight: 1.6 }}>
              <i className="ti ti-shield-check" style={{ color: 'var(--sage)', fontSize: 14, verticalAlign: -2 }}></i>{' '}
              RERA Registered · Trusted Agent · Zero Brokerage for Buyers
            </div>
          </div>

          <div style={{ background: '#fff', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginTop: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Location</h4>
            <Link to="/map">
              <div
                style={{
                  background: '#f0f2f8',
                  borderRadius: 'var(--radius-sm)',
                  height: 140,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text3)',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <i className="ti ti-map" style={{ fontSize: 32, display: 'block', marginBottom: 8, opacity: 0.4 }}></i>
                  View on Map
                </div>
              </div>
            </Link>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 12, lineHeight: 1.6 }}>{prop.loc}</p>
          </div>
        </aside>
      </div>

      <div className="section" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <h2 className="section-title">Similar Properties</h2>
          <Link className="see-all" to="/search">
            View all →
          </Link>
        </div>
        <div className="similar-grid">
          {similar.map((p) => (
            <PropCard key={p.id} p={p} />
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}

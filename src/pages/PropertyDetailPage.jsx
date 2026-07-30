import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import PropCard from '../components/PropCard.jsx';
import Stars from '../components/Stars.jsx';
import { gql } from '../lib/gqlClient.js';
import { PROPERTY_QUERY, PROPERTIES_QUERY, CREATE_LEAD_MUTATION } from '../lib/queries.js';
import { useAuth } from '../context/AuthContext.jsx';
import { adaptProperty, adaptProperties } from '../lib/adapt.js';

const BADGE_LABEL = { new: 'New', hot: 'Hot', ready: 'Ready to Move', proj: 'Project' };

// Full detail adapter — extends the shared adapter with detail-only fields
function adaptDetail(p) {
  if (!p) return null;
  const base = adaptProperty(p);
  return {
    ...base,
    amenities: Array.isArray(p.amenities) ? p.amenities : [],
    reviews: [],
    builderPhone: null,
  };
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [prop, setProp] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('desc');

  // EMI calculator state
  const [loanAmt, setLoanAmt] = useState(80);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [emi, setEmi] = useState({ monthly: 0, total: 0, interest: 0 });

  // Lead enquiry state
  const [enquiryName, setEnquiryName] = useState(user?.name || '');
  const [enquiryPhone, setEnquiryPhone] = useState(user?.phone || '');
  const [enquiryMsg, setEnquiryMsg] = useState('');
  const [enquiryDone, setEnquiryDone] = useState(false);
  const [enquiryLoading, setEnquiryLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    (async () => {
      setLoading(true); setError('');
      try {
        const data = await gql(PROPERTY_QUERY, { id });
        if (!data.property) { setError('Property not found.'); return; }
        const adapted = adaptDetail(data.property);
        setProp(adapted);

        // Fetch similar properties (same city, same type)
        const simData = await gql(PROPERTIES_QUERY, {
          filter: { city: data.property.city, propertyType: data.property.propertyType },
          pagination: { page: 1, pageSize: 4 },
        });
        setSimilar(
          (simData.properties?.items || [])
            .filter(p => p.id !== id)
            .slice(0, 3)
            .map(adaptProperty)
        );

        // Pre-fill loan amount
        // pricePaise → Lakhs for EMI: divide by 10_000_000 (1L paise = ₹1 Lakh... wait: 1 Lakh = ₹1,00,000 = 100,000 paise × 100 = 10,000,000 paise)
        if (data.property.pricePaise) setLoanAmt(Math.round(data.property.pricePaise / 10000000 * 0.8 * 10) / 10);
      } catch (e) {
        setError(e.message || 'Failed to load property details.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // EMI calculation
  useEffect(() => {
    const principal = loanAmt * 100000;
    const r = rate / 12 / 100;
    const n = tenure * 12;
    const monthly = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = monthly * n;
    setEmi({ monthly, total, interest: total - principal });
  }, [loanAmt, rate, tenure]);
  const isFranchiseAccount = !!user && user.role !== 'customer' && user.role !== 'CUSTOMER';

  async function sendEnquiry(e) {
    e.preventDefault();
    if (isFranchiseAccount) {
      alert('Franchise accounts can\'t send property enquiries. Please sign in with a customer account.');
      return;
    }
    if (!enquiryName || !enquiryPhone) { alert('Please fill your name and phone.'); return; }
    setEnquiryLoading(true);
    try {
      await gql(CREATE_LEAD_MUTATION, {
        input: {
          propertyId: id,
          contactName: enquiryName,
          contactPhone: enquiryPhone,
          message: enquiryMsg || `Interested in ${prop.name}. Please contact me.`,
          source: 'PROPERTY_PAGE',
        },
      });
      setEnquiryDone(true);
    } catch (e) {
      alert(e.message || 'Failed to send enquiry. Please try again.');
    } finally {
      setEnquiryLoading(false);
    }
  }

  if (loading) return (
    <>
      <Navbar />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--text3)' }}>
        <i className="ti ti-loader-2" style={{ fontSize: 40, animation: 'spin 1s linear infinite' }}></i>
        <p>Loading property details…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
      <Footer />
    </>
  );

  if (error || !prop) return (
    <>
      <Navbar />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, padding: 24 }}>
        <i className="ti ti-building-off" style={{ fontSize: 48, color: 'var(--text3)', opacity: 0.4 }}></i>
        <p style={{ fontSize: 15, color: 'var(--text2)' }}>{error || 'Property not found.'}</p>
        <button className="btn-navy" style={{ padding: '10px 24px', borderRadius: 8 }} onClick={() => navigate('/search')}>
          Back to Search
        </button>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />

      {/* Hero */}
      <div className={`detail-hero ${prop.color}`}>
        <i className="ti ti-building"></i>
        <div className="hero-overlay"></div>
        <div className="hero-badges">
          <span className={`prop-badge badge-${prop.badge}`}>{BADGE_LABEL[prop.badge] || 'New'}</span>
          {prop.isVerified && <span className="prop-badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>RERA Verified</span>}
        </div>
        <div className="hero-info">
          <div className="hi-left">
            <h1>{prop.name}</h1>
            <p><i className="ti ti-map-pin"></i> {prop.loc}</p>
          </div>
          <div className="hi-right">
            <div className="price-big">{prop.price}</div>
            {prop.area && <div className="price-psf">onwards · {prop.area}</div>}
          </div>
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="thumb-strip">
        {(prop.images.length > 0 ? prop.images.slice(0, 4) : [null, null, null, null]).map((img, i) => (
          <div key={i} className={`thumb ${prop.color} ${i === 0 ? 'active-thumb' : ''}`}
            style={img?.url ? { backgroundImage: `url(${img.url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
            {!img?.url && <i className="ti ti-building"></i>}
          </div>
        ))}
        {prop.images.length > 4 && (
          <div className="thumb" style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.3)', fontSize: 13, fontWeight: 500, width: 'auto', padding: '0 14px' }}>
            +{prop.images.length - 4} Photos
          </div>
        )}
      </div>

      <div className="detail-layout">
        <div className="detail-main">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <i className="ti ti-chevron-right" style={{ fontSize: 12 }}></i>
            <Link to="/search">Properties</Link>
            <i className="ti ti-chevron-right" style={{ fontSize: 12 }}></i>
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
              <span style={{ fontSize: 13, color: 'var(--text3)', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                <i className="ti ti-eye" style={{ fontSize: 14 }}></i> {prop.views} views
              </span>
            </div>
          </div>

          <div className="overview-grid">
            <div className="ov-card"><div className="ov-label">Configuration</div><div className="ov-val">{prop.bhk}</div></div>
            <div className="ov-card"><div className="ov-label">Carpet Area</div><div className="ov-val">{prop.area}</div></div>
            <div className="ov-card"><div className="ov-label">Status</div><div className="ov-val">{prop.status}</div></div>
            <div className="ov-card"><div className="ov-label">Possession</div><div className="ov-val">{prop.possession}</div></div>
            <div className="ov-card"><div className="ov-label">Developer</div><div className="ov-val">{prop.builder}</div></div>
            <div className="ov-card">
              <div className="ov-label">Rating</div>
              <div className="ov-val" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Stars rating={prop.rating} /> <span style={{ fontSize: 13 }}>{prop.rating > 0 ? prop.rating.toFixed(1) : 'No reviews'}</span>
              </div>
            </div>
          </div>

          <div className="tabs">
            <button className={`tab-btn ${tab === 'desc' ? 'active' : ''}`} onClick={() => setTab('desc')}>Description</button>
            <button className={`tab-btn ${tab === 'amenities' ? 'active' : ''}`} onClick={() => setTab('amenities')}>Amenities</button>
            <button className={`tab-btn ${tab === 'reviews' ? 'active' : ''}`} onClick={() => setTab('reviews')}>
              Reviews {prop.reviews.length > 0 && `(${prop.reviews.length})`}
            </button>
          </div>

          {tab === 'desc' && (
            <p className="desc-text" style={{ whiteSpace: 'pre-line' }}>
              {prop.desc || `${prop.name} is a premium property located in ${prop.loc}. Built by ${prop.builder}, this ${prop.bhk} offers excellent amenities and connectivity.`}
            </p>
          )}

          {tab === 'amenities' && (
            prop.amenities.length > 0 ? (
              <div className="amenities-grid">
                {prop.amenities.map(a => (
                  <div className="amenity" key={a}><i className="ti ti-check"></i> {a}</div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '32px', textAlign: 'center', color: 'var(--text3)' }}>
                <i className="ti ti-list-check" style={{ fontSize: 36, display: 'block', marginBottom: 8, opacity: 0.3 }}></i>
                <p>Amenity details not available yet.</p>
              </div>
            )
          )}

          {tab === 'reviews' && (
            <div>
              {prop.reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text3)' }}>
                  <i className="ti ti-star" style={{ fontSize: 36, display: 'block', marginBottom: 8, opacity: 0.3 }}></i>
                  <p>No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                prop.reviews.map(r => (
                  <div key={r.id} style={{ padding: '16px 0', borderBottom: '0.5px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontWeight: 600 }}>{r.user?.name || 'User'}</div>
                      <Stars rating={r.rating} />
                    </div>
                    {r.title && <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 14 }}>{r.title}</div>}
                    <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{r.body}</p>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* EMI Calculator */}
          <div className="emi-box">
            <h3>EMI Calculator</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Loan Amount (₹ Lakhs)</label>
                <input type="number" className="form-control" value={loanAmt} min="5" max="5000"
                  onChange={e => setLoanAmt(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">Interest Rate (%)</label>
                <input type="number" className="form-control" value={rate} step="0.1" min="6" max="15"
                  onChange={e => setRate(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">Tenure (Years)</label>
                <input type="range" min="5" max="30" step="1" value={tenure}
                  onChange={e => setTenure(Number(e.target.value))} style={{ marginTop: 8 }} />
                <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{tenure} yrs</div>
              </div>
            </div>
            <div className="emi-result">
              <div className="emi-amount">₹{Math.round(emi.monthly).toLocaleString('en-IN')}</div>
              <div className="emi-label">Monthly EMI (estimated)</div>
              <div className="emi-breakdown">
                <div className="emi-bd"><div className="emi-bd-num">₹{(emi.total / 100000).toFixed(1)}L</div><div className="emi-bd-lbl">Total Payment</div></div>
                <div className="emi-bd"><div className="emi-bd-num">₹{(emi.interest / 100000).toFixed(1)}L</div><div className="emi-bd-lbl">Total Interest</div></div>
              </div>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 12, textAlign: 'center' }}>*EMI is indicative. Actual rates depend on bank and applicant profile.</p>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="detail-sidebar">
          <div className="contact-card">
            <div className="contact-price">{prop.price}</div>
            <div className="contact-psf">{prop.area} · {prop.builder}</div>
            <div className="divider"></div>

            {isFranchiseAccount ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <i className="ti ti-building-store" style={{ fontSize: 40, color: 'var(--text3)', display: 'block', marginBottom: 10, opacity: 0.5 }}></i>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text2)' }}>Enquiries are for customer accounts</div>
                <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8, lineHeight: 1.6 }}>
                  You're signed in as a Franchise Partner. Sign in with a customer account to contact the listing agent.
                </p>
              </div>
            ) : enquiryDone ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <i className="ti ti-circle-check" style={{ fontSize: 44, color: 'var(--success)', display: 'block', marginBottom: 8 }}></i>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--navy)' }}>Enquiry Sent!</div>
                <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 6 }}>The agent will contact you shortly on {enquiryPhone}.</p>
              </div>
            ) : (
              <form onSubmit={sendEnquiry}>
                <div style={{ marginBottom: 14, fontSize: 14, fontWeight: 600, color: 'var(--text1)' }}>Send Enquiry</div>
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input className="form-control" placeholder="Full name" value={enquiryName}
                    onChange={e => setEnquiryName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-control" placeholder="+91 98765 43210" value={enquiryPhone}
                    onChange={e => setEnquiryPhone(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Message (optional)</label>
                  <textarea className="form-control" rows="2" placeholder="I'm interested in this property…"
                    value={enquiryMsg} onChange={e => setEnquiryMsg(e.target.value)} style={{ resize: 'vertical' }}></textarea>
                </div>
                <div className="contact-btns">
                  <button type="submit" className="btn-call" disabled={enquiryLoading}>
                    <i className="ti ti-send"></i> {enquiryLoading ? 'Sending…' : 'Send Enquiry'}
                  </button>
                </div>
              </form>
            )}
            <div className="divider"></div>
            <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', lineHeight: 1.6 }}>
              <i className="ti ti-shield-check" style={{ color: 'var(--sage)', fontSize: 14, verticalAlign: -2 }}></i>{' '}
              {prop.isVerified ? 'RERA Verified · ' : ''}Zero Brokerage for Buyers
            </div>
          </div>

          <div style={{ background: '#fff', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginTop: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Location</h4>
            <Link to="/map">
              <div style={{ background: '#f0f2f8', borderRadius: 'var(--radius-sm)', height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 13, cursor: 'pointer' }}>
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

      {similar.length > 0 && (
        <div className="section" style={{ paddingTop: 0 }}>
          <div className="section-head">
            <h2 className="section-title">Similar Properties</h2>
            <Link className="see-all" to="/search">View all →</Link>
          </div>
          <div className="similar-grid">
            {similar.map(p => <PropCard key={p.id} p={p} />)}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

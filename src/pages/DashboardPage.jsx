import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import PropCard, { getSaved } from '../components/PropCard.jsx';
import { PROPERTIES, AGENTS } from '../data/data.js';

const MENU = [
  { key: 'overview', label: 'Overview', icon: 'ti-layout-dashboard' },
  { key: 'saved', label: 'Saved Properties', icon: 'ti-heart' },
  { key: 'searches', label: 'Recent Searches', icon: 'ti-history' },
  { key: 'alerts', label: 'My Alerts', icon: 'ti-bell' },
  { key: 'post', label: 'Post Property', icon: 'ti-plus-circle' },
  { key: 'agents', label: 'Find Agents', icon: 'ti-users' },
  { key: 'settings', label: 'Settings', icon: 'ti-settings' },
];

const SEARCH_HISTORY = [
  ['3 BHK in Whitefield, Bengaluru', '₹60L – ₹1.5Cr', '2 hours ago', 'Whitefield'],
  ['2 BHK in Chembur, Mumbai', 'Under ₹80L', 'Yesterday', 'Chembur'],
  ['Villa in Gurugram', 'Above ₹2Cr', '2 days ago', 'Gurugram'],
  ['1 BHK in Thane West', '₹30L – ₹60L', '3 days ago', 'Thane'],
  ['Plots in Hyderabad', 'Under ₹50L', '5 days ago', 'Hyderabad'],
  ['Office Space in Bengaluru', '₹50K/mo', '1 week ago', 'Bengaluru'],
];

function Toggle({ initial = false }) {
  const [on, setOn] = useState(initial);
  return <div className={`toggle ${on ? 'on' : ''}`} onClick={() => setOn((v) => !v)}></div>;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [section, setSection] = useState('overview');
  const [savedIds, setSavedIds] = useState([]);

  useEffect(() => {
    setSavedIds(getSaved());
    const sectionParam = params.get('section');
    if (sectionParam && MENU.find((m) => m.key === sectionParam)) setSection(sectionParam);
  }, [params]);

  const savedProps = PROPERTIES.filter((p) => savedIds.includes(p.id));

  return (
    <>
      <Navbar />
      <div className="dash-layout">
        {/* SIDEBAR */}
        <div className="dash-nav">
          <div className="dash-user">
            <div className="user-avatar">AR</div>
            <div className="user-name">Arjun Reddy</div>
            <div className="user-email">arjun.reddy@gmail.com</div>
            <div className="user-badge">
              <i className="ti ti-shield-check" style={{ fontSize: 12 }}></i> Verified User
            </div>
          </div>
          <nav className="dash-menu">
            {MENU.map((m) => (
              <button
                key={m.key}
                className={`dm-item ${section === m.key ? 'active' : ''}`}
                onClick={() => setSection(m.key)}
              >
                <i className={`ti ${m.icon}`} aria-hidden="true"></i> {m.label}
                {m.key === 'saved' && savedIds.length > 0 && <span className="dm-badge">{savedIds.length}</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* MAIN */}
        <div className="dash-main">
          {section === 'overview' && (
            <div>
              <h2 className="dash-heading">Welcome back, Arjun 👋</h2>
              <div className="stat-cards">
                <div className="stat-card">
                  <div className="sc-num">{savedIds.length}</div>
                  <div className="sc-label">Saved Properties</div>
                  <div className="sc-change sc-up">
                    <i className="ti ti-trending-up" style={{ fontSize: 12 }}></i> +2 this week
                  </div>
                </div>
                <div className="stat-card">
                  <div className="sc-num">6</div>
                  <div className="sc-label">Recent Searches</div>
                  <div className="sc-change sc-up">
                    <i className="ti ti-trending-up" style={{ fontSize: 12 }}></i> Active
                  </div>
                </div>
                <div className="stat-card">
                  <div className="sc-num">3</div>
                  <div className="sc-label">Active Alerts</div>
                  <div className="sc-change">
                    <i className="ti ti-bell" style={{ fontSize: 12, color: 'var(--gold2)' }}></i> 1 new match
                  </div>
                </div>
                <div className="stat-card">
                  <div className="sc-num">2</div>
                  <div className="sc-label">Enquiries Sent</div>
                  <div className="sc-change sc-up">
                    <i className="ti ti-check" style={{ fontSize: 12 }}></i> 1 reply received
                  </div>
                </div>
              </div>
              <div className="search-hist">
                <div className="sh-header">
                  <h4>Recent Activity</h4>
                  <a className="see-all" style={{ cursor: 'pointer' }}>
                    View all
                  </a>
                </div>
                <div className="sh-item" onClick={() => navigate('/search?q=Whitefield')}>
                  <div className="sh-icon">
                    <i className="ti ti-search" aria-hidden="true"></i>
                  </div>
                  <div>
                    <div className="sh-q">3 BHK in Whitefield, Bengaluru</div>
                    <div className="sh-meta">₹60L – ₹1.5Cr · 2 hours ago</div>
                  </div>
                </div>
                <div className="sh-item" onClick={() => navigate('/property/2')}>
                  <div className="sh-icon">
                    <i className="ti ti-building" aria-hidden="true"></i>
                  </div>
                  <div>
                    <div className="sh-q">Viewed: DLF The Arbour, Gurugram</div>
                    <div className="sh-meta">₹2.8 Cr · Yesterday</div>
                  </div>
                </div>
                <div className="sh-item" onClick={() => navigate('/search?q=Pune')}>
                  <div className="sh-icon">
                    <i className="ti ti-search" aria-hidden="true"></i>
                  </div>
                  <div>
                    <div className="sh-q">2 BHK in Wakad, Pune</div>
                    <div className="sh-meta">Under ₹80L · 3 days ago</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {section === 'saved' && (
            <div>
              <h2 className="dash-heading">Saved Properties</h2>
              {savedProps.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48, color: 'var(--text3)' }}>
                  <i className="ti ti-heart" style={{ fontSize: 40, display: 'block', marginBottom: 12, opacity: 0.3 }}></i>
                  <p style={{ fontSize: 14 }}>No saved properties yet.</p>
                  <button
                    className="btn-navy"
                    style={{ display: 'inline-block', marginTop: 16, padding: '10px 24px', borderRadius: 8 }}
                    onClick={() => navigate('/search')}
                  >
                    Browse Properties
                  </button>
                </div>
              ) : (
                <div className="grid-auto">
                  {savedProps.map((p) => (
                    <PropCard key={p.id} p={p} />
                  ))}
                </div>
              )}
            </div>
          )}

          {section === 'searches' && (
            <div>
              <h2 className="dash-heading">Recent Searches</h2>
              <div className="search-hist">
                <div className="sh-header">
                  <h4>Your Search History</h4>
                  <button className="btn-outline" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => alert('History cleared')}>
                    Clear all
                  </button>
                </div>
                {SEARCH_HISTORY.map(([q, budget, time, city]) => (
                  <div className="sh-item" key={q} onClick={() => navigate(`/search?q=${city}`)}>
                    <div className="sh-icon">
                      <i className="ti ti-search" aria-hidden="true"></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="sh-q">{q}</div>
                      <div className="sh-meta">
                        {budget} · {time}
                      </div>
                    </div>
                    <i className="ti ti-arrow-right" style={{ fontSize: 16, color: 'var(--text3)' }}></i>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'alerts' && (
            <div>
              <h2 className="dash-heading">My Property Alerts</h2>
              <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>
                Get notified when new properties match your criteria.
              </p>
              {[
                ['3 BHK in Whitefield, Bengaluru', '₹80L – ₹1.5Cr · Ready to Move', true],
                ['2 BHK in Pune under ₹70L', 'Ready or Under Construction', true],
                ['Villa in South Bengaluru', 'Above ₹3Cr · Swimming Pool', false],
              ].map(([title, desc, state]) => (
                <div className="alert-card" key={title}>
                  <div className="alert-icon">
                    <i className="ti ti-bell" aria-hidden="true"></i>
                  </div>
                  <div className="alert-info">
                    <div className="alert-title">{title}</div>
                    <div className="alert-desc">{desc}</div>
                  </div>
                  <Toggle initial={state} />
                </div>
              ))}
              <button className="btn-navy" style={{ marginTop: 8, padding: '11px 20px' }} onClick={() => alert('Create alert feature coming soon!')}>
                <i className="ti ti-plus" style={{ fontSize: 14, verticalAlign: -2 }}></i> Create New Alert
              </button>
            </div>
          )}

          {section === 'post' && (
            <div>
              <h2 className="dash-heading">Post Your Property</h2>
              <div className="step-indicator">
                <div className="step active">1. Basic Info</div>
                <div className="step">2. Location</div>
                <div className="step">3. Details</div>
                <div className="step">4. Photos</div>
                <div className="step">5. Preview</div>
              </div>
              <div className="post-form">
                <div className="form-section">
                  <h4>Property Basic Details</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Listing Type</label>
                      <select className="form-control">
                        <option>Sell</option>
                        <option>Rent</option>
                        <option>PG</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Property Type</label>
                      <select className="form-control">
                        <option>Apartment / Flat</option>
                        <option>Villa / Independent House</option>
                        <option>Plot / Land</option>
                        <option>Office Space</option>
                        <option>Shop / Showroom</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">BHK Configuration</label>
                      <select className="form-control">
                        <option>1 BHK</option>
                        <option>2 BHK</option>
                        <option>3 BHK</option>
                        <option>4 BHK</option>
                        <option>5+ BHK</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Expected Price (₹)</label>
                      <input type="text" className="form-control" placeholder="e.g. 75,00,000" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Carpet Area (sq.ft)</label>
                      <input type="number" className="form-control" placeholder="e.g. 1200" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Built-up Area (sq.ft)</label>
                      <input type="number" className="form-control" placeholder="e.g. 1450" />
                    </div>
                  </div>
                </div>
                <div className="form-section">
                  <h4>Possession & Status</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Availability</label>
                      <select className="form-control">
                        <option>Ready to Move</option>
                        <option>Under Construction</option>
                        <option>New Launch</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Possession Date</label>
                      <input type="month" className="form-control" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Property Description</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Describe the property — location advantages, unique features, nearby amenities..."
                    ></textarea>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn-navy" style={{ padding: '13px 28px' }}>
                    Save & Continue →
                  </button>
                  <button className="btn-outline" style={{ padding: '13px 20px' }}>
                    Save Draft
                  </button>
                </div>
              </div>
            </div>
          )}

          {section === 'agents' && (
            <div>
              <h2 className="dash-heading">Find Expert Agents</h2>
              <div className="agent-grid">
                {AGENTS.map((a) => (
                  <div className="agent-card" key={a.id}>
                    <div className="ag-top">
                      <div className="ag-avatar">
                        {a.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <div className="ag-name">{a.name}</div>
                        <div className="ag-title">{a.title}</div>
                        <div className="ag-city">
                          <i className="ti ti-map-pin" style={{ fontSize: 12 }}></i> {a.city}
                        </div>
                      </div>
                    </div>
                    <div className="ag-stats">
                      <div className="ag-stat">
                        <div className="ag-stat-num">{a.listings}</div>
                        <div className="ag-stat-lbl">Listings</div>
                      </div>
                      <div className="ag-stat">
                        <div className="ag-stat-num">{a.deals}</div>
                        <div className="ag-stat-lbl">Deals</div>
                      </div>
                      <div className="ag-stat">
                        <div className="ag-stat-num">{a.exp}</div>
                        <div className="ag-stat-lbl">Experience</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-navy" style={{ flex: 1, padding: 9, fontSize: 13 }}>
                        Contact
                      </button>
                      <button className="btn-outline" style={{ flex: 1, padding: 9, fontSize: 13 }}>
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'settings' && (
            <div>
              <h2 className="dash-heading">Account Settings</h2>
              <div className="post-form">
                <div className="form-section">
                  <h4>Personal Information</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input type="text" className="form-control" defaultValue="Arjun Reddy" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input type="tel" className="form-control" defaultValue="+91 98765 43210" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input type="email" className="form-control" defaultValue="arjun.reddy@gmail.com" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input type="text" className="form-control" defaultValue="Bengaluru" />
                    </div>
                  </div>
                </div>
                <div className="form-section">
                  <h4>Notification Preferences</h4>
                  {[
                    ['Email Alerts for new matches', true],
                    ['SMS for price drops', true],
                    ['WhatsApp updates', false],
                    ['Weekly market report', true],
                  ].map(([label, state]) => (
                    <div
                      key={label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 0',
                        borderBottom: '0.5px solid var(--border)',
                      }}
                    >
                      <span style={{ fontSize: 14, color: 'var(--text2)' }}>{label}</span>
                      <Toggle initial={state} />
                    </div>
                  ))}
                </div>
                <button className="btn-navy" style={{ padding: '12px 28px' }}>
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

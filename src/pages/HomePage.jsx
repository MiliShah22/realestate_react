import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import PropCard from '../components/PropCard.jsx';
import { PROPERTIES } from '../data/data.js';

const TABS = [
  { key: 'buy', label: 'Buy' },
  { key: 'rent', label: 'Rent' },
  { key: 'projects', label: 'New Projects' },
  { key: 'commercial', label: 'Commercial' },
  { key: 'pg', label: 'PG / Co-living' },
];

const CATEGORIES = [
  { icon: 'ti-building', label: 'Apartments', count: '1.2L listings' },
  { icon: 'ti-home', label: 'Villas', count: '18K listings' },
  { icon: 'ti-layout-grid', label: 'Plots', count: '43K listings' },
  { icon: 'ti-briefcase', label: 'Commercial', count: '26K listings' },
  { icon: 'ti-crane', label: 'New Projects', count: '3.4K projects' },
  { icon: 'ti-users', label: 'PG / Co-living', count: '51K rooms' },
];

const CITIES = [
  { name: 'Bengaluru', count: '48,200 properties', cls: 'c1' },
  { name: 'Mumbai', count: '62,400 properties', cls: 'c2' },
  { name: 'Delhi NCR', count: '55,100 properties', cls: 'c3' },
  { name: 'Hyderabad', count: '31,800 properties', cls: 'c4' },
  { name: 'Pune', count: '28,600 properties', cls: 'c5' },
  { name: 'Chennai', count: '19,300 properties', cls: 'c6' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('buy');
  const [q, setQ] = useState('');
  const [bhk, setBhk] = useState('');
  const [budget, setBudget] = useState('');

  function doSearch() {
    const params = new URLSearchParams({ type: tab });
    if (q) params.set('q', q);
    if (bhk) params.set('bhk', bhk);
    if (budget) params.set('budget', budget);
    navigate(`/search?${params.toString()}`);
  }

  const featured = PROPERTIES.slice(0, 4);

  return (
    <>
      <Navbar />

      <section className="hero">
        <div className="hero-grid"></div>
        <div className="hero-glow1"></div>
        <div className="hero-glow2"></div>
        <div className="hero-eyebrow">India's Premium Property Platform</div>
        <h1>
          Find Your <em>Perfect</em>
          <br />
          Home
        </h1>
        <p className="hero-sub">Search from 2.4 lakh+ verified properties across 30+ cities</p>

        <div className="hero-stats">
          <div>
            <div className="h-stat-num">2.4L+</div>
            <div className="h-stat-lbl">Properties</div>
          </div>
          <div className="h-stat-div"></div>
          <div>
            <div className="h-stat-num">30+</div>
            <div className="h-stat-lbl">Cities</div>
          </div>
          <div className="h-stat-div"></div>
          <div>
            <div className="h-stat-num">8.1L</div>
            <div className="h-stat-lbl">Buyers</div>
          </div>
          <div className="h-stat-div"></div>
          <div>
            <div className="h-stat-num">95K+</div>
            <div className="h-stat-lbl">Agents</div>
          </div>
        </div>

        <div className="search-box">
          <div className="s-tabs">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`s-tab ${tab === t.key ? 'active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="s-row">
            <div className="s-inp-wrap">
              <i className="ti ti-map-pin" aria-hidden="true"></i>
              <input
                className="s-inp"
                placeholder="Enter city, locality, or project..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && doSearch()}
              />
            </div>
            <select className="s-sel" value={bhk} onChange={(e) => setBhk(e.target.value)}>
              <option value="">BHK Type</option>
              <option>1 BHK</option>
              <option>2 BHK</option>
              <option>3 BHK</option>
              <option>4+ BHK</option>
              <option>Villa / Plot</option>
            </select>
            <select className="s-sel" value={budget} onChange={(e) => setBudget(e.target.value)}>
              <option value="">Budget</option>
              <option>Under ₹30L</option>
              <option>₹30L – ₹60L</option>
              <option>₹60L – ₹1Cr</option>
              <option>₹1Cr – ₹2Cr</option>
              <option>Above ₹2Cr</option>
            </select>
            <button className="s-btn" onClick={doSearch}>
              <i className="ti ti-search" aria-hidden="true"></i> Search
            </button>
          </div>
        </div>
      </section>

      <div className="section">
        <div className="section-head">
          <h2 className="section-title">Browse by Property Type</h2>
        </div>
        <div className="cats">
          {CATEGORIES.map((c) => (
            <div key={c.label} className="cat-card" onClick={() => navigate('/search')}>
              <div className="cat-icon">
                <i className={`ti ${c.icon}`} aria-hidden="true"></i>
              </div>
              <div className="cat-label">{c.label}</div>
              <div className="cat-count">{c.count}</div>
            </div>
          ))}
        </div>

        <div className="section-head">
          <h2 className="section-title">Featured Properties</h2>
          <a className="see-all" onClick={() => navigate('/search')} style={{ cursor: 'pointer' }}>
            View all →
          </a>
        </div>
        <div className="grid-auto">
          {featured.map((p) => (
            <PropCard key={p.id} p={p} />
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', padding: '48px 0' }}>
        <div className="section" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div className="section-head">
            <h2 className="section-title">Top Cities</h2>
          </div>
          <div className="city-grid">
            {CITIES.map((c) => (
              <div
                key={c.name}
                className={`city-card ${c.cls}`}
                onClick={() => navigate(`/search?city=${encodeURIComponent(c.name)}`)}
              >
                <i className="ti ti-building city-icon" aria-hidden="true"></i>
                <div>
                  <div className="city-name">{c.name}</div>
                  <div className="city-props">{c.count}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="insights-strip">
          <div className="ins-left">
            <h3>Property Market Insights</h3>
            <p>
              Bengaluru's residential market grew 18% YoY. Pune and Hyderabad continue to attract IT-driven
              demand with sub-₹1Cr inventory shrinking rapidly.
            </p>
            <button
              className="btn-outline"
              style={{ marginTop: 16, color: 'var(--gold)', borderColor: 'rgba(255,255,255,0.2)' }}
              onClick={() => navigate('/search')}
            >
              Explore trends →
            </button>
          </div>
          <div className="ins-right">
            <div className="ins-stat">
              <div className="ins-num">+18%</div>
              <div className="ins-lbl">Bengaluru YoY</div>
            </div>
            <div className="ins-stat">
              <div className="ins-num">₹6,800</div>
              <div className="ins-lbl">Avg ₹/sq.ft Pune</div>
            </div>
            <div className="ins-stat">
              <div className="ins-num">2.1L</div>
              <div className="ins-lbl">Units Sold Q1</div>
            </div>
            <div className="ins-stat">
              <div className="ins-num">14%</div>
              <div className="ins-lbl">Rental Yield</div>
            </div>
          </div>
        </div>

        <div className="section-head">
          <h2 className="section-title">Why Estatiq?</h2>
        </div>
        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon">
              <i className="ti ti-shield-check" aria-hidden="true"></i>
            </div>
            <div className="why-title">Verified Listings</div>
            <div className="why-desc">All properties are RERA-verified and field-inspected before going live.</div>
          </div>
          <div className="why-card">
            <div className="why-icon">
              <i className="ti ti-currency-rupee" aria-hidden="true"></i>
            </div>
            <div className="why-title">Zero Brokerage</div>
            <div className="why-desc">Connect directly with owners and builders — no hidden middleman fees.</div>
          </div>
          <div className="why-card">
            <div className="why-icon">
              <i className="ti ti-headset" aria-hidden="true"></i>
            </div>
            <div className="why-title">Expert Guidance</div>
            <div className="why-desc">Our 950+ certified property consultants guide you through every step.</div>
          </div>
          <div className="why-card">
            <div className="why-icon">
              <i className="ti ti-file-certificate" aria-hidden="true"></i>
            </div>
            <div className="why-title">Legal Assistance</div>
            <div className="why-desc">Free legal document review and registration support for every transaction.</div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

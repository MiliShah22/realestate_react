import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import PropCard from '../components/PropCard.jsx';
import { gql } from '../lib/gqlClient.js';
import { PROPERTIES_QUERY } from '../lib/queries.js';
import { adaptProperties } from '../lib/adapt.js';

const TABS = [
  { key: 'buy',        label: 'Buy' },
  { key: 'rent',       label: 'Rent' },
  { key: 'projects',   label: 'New Projects' },
  { key: 'commercial', label: 'Commercial' },
  { key: 'pg',         label: 'PG / Co-living' },
];

const CATEGORIES = [
  { icon: 'ti-building',     label: 'Apartments',    count: '1.2L listings',  type: 'APARTMENT' },
  { icon: 'ti-home',         label: 'Villas',         count: '18K listings',   type: 'VILLA' },
  { icon: 'ti-layout-grid',  label: 'Plots',          count: '43K listings',   type: 'PLOT' },
  { icon: 'ti-briefcase',    label: 'Commercial',     count: '26K listings',   type: 'COMMERCIAL' },
  { icon: 'ti-crane',        label: 'New Projects',   count: '3.4K projects',  type: 'APARTMENT' },
  { icon: 'ti-users',        label: 'PG / Co-living', count: '51K rooms',      type: 'PG' },
];

const CITIES = [
  { name: 'Bengaluru', count: '48,200 properties', cls: 'c1' },
  { name: 'Mumbai',    count: '62,400 properties', cls: 'c2' },
  { name: 'Delhi NCR', count: '55,100 properties', cls: 'c3' },
  { name: 'Hyderabad', count: '31,800 properties', cls: 'c4' },
  { name: 'Pune',      count: '28,600 properties', cls: 'c5' },
  { name: 'Chennai',   count: '19,300 properties', cls: 'c6' },
];

// PropCard handles adaptation internally via adaptProp()

export default function HomePage() {
  const navigate = useNavigate();
  const [tab, setTab]       = useState('buy');
  const [q, setQ]           = useState('');
  const [bhk, setBhk]       = useState('');
  const [budget, setBudget] = useState('');
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await gql(PROPERTIES_QUERY, {
          filter: { isFeatured: true },
          pagination: { page: 1, pageSize: 4 },
          sort: { field: 'VIEW_COUNT', direction: 'DESC' },
        });
        setFeatured(adaptProperties(data.properties?.items || []));
      } catch (e) {
        console.warn('Failed to load featured properties', e.message);
        setFeatured([]);
      } finally {
        setLoadingFeatured(false);
      }
    })();
  }, []);

  function doSearch() {
    const params = new URLSearchParams({ type: tab });
    if (q)      params.set('q', q);
    if (bhk)    params.set('bhk', bhk);
    if (budget) params.set('budget', budget);
    navigate(`/search?${params.toString()}`);
  }

  return (
    <>
      <Navbar />

      <section className="hero">
        <div className="hero-grid"></div>
        <div className="hero-glow1"></div>
        <div className="hero-glow2"></div>
        <div className="hero-eyebrow">India's Premium Property Platform</div>
        <h1>Find Your <em>Perfect</em><br />Home</h1>
        <p className="hero-sub">Search from verified properties across 30+ cities</p>

        <div className="hero-stats">
          <div><div className="h-stat-num">2.4L+</div><div className="h-stat-lbl">Properties</div></div>
          <div className="h-stat-div"></div>
          <div><div className="h-stat-num">30+</div><div className="h-stat-lbl">Cities</div></div>
          <div className="h-stat-div"></div>
          <div><div className="h-stat-num">8.1L</div><div className="h-stat-lbl">Buyers</div></div>
          <div className="h-stat-div"></div>
          <div><div className="h-stat-num">95K+</div><div className="h-stat-lbl">Agents</div></div>
        </div>

        <div className="search-box">
          <div className="s-tabs">
            {TABS.map(t => (
              <button key={t.key} className={`s-tab ${tab===t.key?'active':''}`} onClick={() => setTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="s-row">
            <div className="s-inp-wrap">
              <i className="ti ti-map-pin"></i>
              <input className="s-inp" placeholder="Enter city, locality, or project..."
                value={q} onChange={e => setQ(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doSearch()} />
            </div>
            <select className="s-sel" value={bhk} onChange={e => setBhk(e.target.value)}>
              <option value="">BHK Type</option>
              <option>1 BHK</option><option>2 BHK</option><option>3 BHK</option>
              <option>4+ BHK</option><option>Villa / Plot</option>
            </select>
            <select className="s-sel" value={budget} onChange={e => setBudget(e.target.value)}>
              <option value="">Budget</option>
              <option>Under ₹30L</option><option>₹30L – ₹60L</option>
              <option>₹60L – ₹1Cr</option><option>₹1Cr – ₹2Cr</option><option>Above ₹2Cr</option>
            </select>
            <button className="s-btn" onClick={doSearch}>
              <i className="ti ti-search"></i> Search
            </button>
          </div>
        </div>
      </section>

      <div className="section">
        <div className="section-head"><h2 className="section-title">Browse by Property Type</h2></div>
        <div className="cats">
          {CATEGORIES.map(c => (
            <div key={c.label} className="cat-card"
              onClick={() => navigate(`/search?propertyType=${c.type}`)}>
              <div className="cat-icon"><i className={`ti ${c.icon}`}></i></div>
              <div className="cat-label">{c.label}</div>
              <div className="cat-count">{c.count}</div>
            </div>
          ))}
        </div>

        <div className="section-head">
          <h2 className="section-title">Featured Properties</h2>
          <a className="see-all" onClick={() => navigate('/search?isFeatured=true')} style={{cursor:'pointer'}}>
            View all →
          </a>
        </div>

        {loadingFeatured ? (
          <div style={{textAlign:'center',padding:'40px',color:'var(--text3)'}}>
            <i className="ti ti-loader-2" style={{fontSize:32,animation:'spin 1s linear infinite',display:'block',marginBottom:8}}></i>
            Loading properties…
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : featured.length === 0 ? (
          <div style={{textAlign:'center',padding:'40px',color:'var(--text3)'}}>
            <i className="ti ti-building-off" style={{fontSize:40,display:'block',marginBottom:12,opacity:0.3}}></i>
            <p>No featured properties available yet.</p>
            <button className="btn-navy" style={{marginTop:12,padding:'10px 20px',borderRadius:8}}
              onClick={() => navigate('/search')}>Browse all properties</button>
          </div>
        ) : (
          <div className="grid-auto">
            {featured.map(p => <PropCard key={p.id} p={p} />)}
          </div>
        )}
      </div>

      <div style={{background:'#fff',padding:'48px 0'}}>
        <div className="section" style={{paddingTop:0,paddingBottom:0}}>
          <div className="section-head"><h2 className="section-title">Top Cities</h2></div>
          <div className="city-grid">
            {CITIES.map(c => (
              <div key={c.name} className={`city-card ${c.cls}`}
                onClick={() => navigate(`/search?city=${encodeURIComponent(c.name)}`)}>
                <i className="ti ti-building city-icon"></i>
                <div><div className="city-name">{c.name}</div><div className="city-props">{c.count}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="insights-strip">
          <div className="ins-left">
            <h3>Property Market Insights</h3>
            <p>Bengaluru's residential market grew 18% YoY. Pune and Hyderabad continue to attract IT-driven demand with sub-₹1Cr inventory shrinking rapidly.</p>
            <button className="btn-outline" style={{marginTop:16,color:'var(--gold)',borderColor:'rgba(255,255,255,0.2)'}}
              onClick={() => navigate('/search')}>Explore trends →</button>
          </div>
          <div className="ins-right">
            <div className="ins-stat"><div className="ins-num">+18%</div><div className="ins-lbl">Bengaluru YoY</div></div>
            <div className="ins-stat"><div className="ins-num">₹6,800</div><div className="ins-lbl">Avg ₹/sq.ft Pune</div></div>
            <div className="ins-stat"><div className="ins-num">2.1L</div><div className="ins-lbl">Units Sold Q1</div></div>
            <div className="ins-stat"><div className="ins-num">14%</div><div className="ins-lbl">Rental Yield</div></div>
          </div>
        </div>

        <div className="section-head"><h2 className="section-title">Why Estatiq?</h2></div>
        <div className="why-grid">
          {[
            ['ti-shield-check','Verified Listings','All properties are RERA-verified and field-inspected before going live.'],
            ['ti-currency-rupee','Zero Brokerage','Connect directly with owners and builders — no hidden middleman fees.'],
            ['ti-headset','Expert Guidance','Our 950+ certified property consultants guide you through every step.'],
            ['ti-file-certificate','Legal Assistance','Free legal document review and registration support for every transaction.'],
          ].map(([icon,title,desc]) => (
            <div key={title} className="why-card">
              <div className="why-icon"><i className={`ti ${icon}`}></i></div>
              <div className="why-title">{title}</div>
              <div className="why-desc">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}

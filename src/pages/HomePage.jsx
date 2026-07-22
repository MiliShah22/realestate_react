import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import PropCard from '../components/PropCard.jsx';
import { gql } from '../lib/gqlClient.js';
import { PROPERTIES_QUERY, PROPERTY_TYPE_COUNTS_QUERY, TOP_CITIES_QUERY, PLATFORM_STATS_QUERY } from '../lib/queries.js';
import { adaptProperties } from '../lib/adapt.js';

const TABS = [
  { key: 'buy', label: 'Buy' },
  { key: 'rent', label: 'Rent' },
  { key: 'projects', label: 'New Projects' },
  { key: 'commercial', label: 'Commercial' },
  { key: 'pg', label: 'PG / Co-living' },
];

const PROPERTY_TYPE_ICON = {
  APARTMENT: 'ti-building-skyscraper',
  VILLA: 'ti-home',
  PLOT: 'ti-map-2',
  COMMERCIAL: 'ti-building-store',
  OFFICE: 'ti-briefcase',
  PG_ROOM: 'ti-bed',
};

const CITY_COLOR_CLASSES = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'];

function formatCount(n) {
  if (n >= 100000) return `${(n / 100000).toFixed(1).replace(/\.0$/, '')}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

// PropCard handles adaptation internally via adaptProp()

export default function HomePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('buy');
  const [q, setQ] = useState('');
  const [bhk, setBhk] = useState('');
  const [budget, setBudget] = useState('');
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  const [typeCounts, setTypeCounts] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [stats, setStats] = useState(null);

  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {

    let cancelled = false;

    (async () => {

      const [featuredRes, typesRes, citiesRes, statsRes] = await Promise.allSettled([

        gql(PROPERTIES_QUERY, {

          filter: { isFeatured: true },

          pagination: { page: 1, pageSize: 4 },

          sort: { field: 'VIEW_COUNT', direction: 'DESC' },

        }),

        gql(PROPERTY_TYPE_COUNTS_QUERY),

        gql(TOP_CITIES_QUERY, { limit: 6 }),

        gql(PLATFORM_STATS_QUERY),

      ]);

      if (cancelled) return;

      setFeatured(

        featuredRes.status === 'fulfilled'

          ? adaptProperties(featuredRes.value.properties?.items || [])

          : []

      );

      setLoadingFeatured(false);

      setTypeCounts(

        typesRes.status === 'fulfilled' ? typesRes.value.propertyTypeCounts || [] : []

      );

      setLoadingTypes(false);

      setCities(

        citiesRes.status === 'fulfilled' ? citiesRes.value.topCities || [] : []

      );

      setLoadingCities(false);

      setStats(

        statsRes.status === 'fulfilled' ? statsRes.value.platformStats || null : null

      );

      setLoadingStats(false);

    })();

    return () => { cancelled = true; };

  }, []);

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

    (async () => {
      try {
        const data = await gql(PROPERTY_TYPE_COUNTS_QUERY);
        setTypeCounts(data.propertyTypeCounts || []);
      } catch (e) {
        console.warn('Failed to load property type counts', e.message);
        setTypeCounts([]);
      } finally {
        setLoadingTypes(false);
      }
    })();

    (async () => {
      try {
        const data = await gql(TOP_CITIES_QUERY, { limit: 6 });
        setCities(data.topCities || []);
      } catch (e) {
        console.warn('Failed to load top cities', e.message);
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    })();
  }, []);

  function doSearch() {
    const params = new URLSearchParams({ type: tab });
    if (q) params.set('q', q);
    if (bhk) params.set('bhk', bhk);
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
          <div>
            <div className="h-stat-num">{loadingStats ? <span className="stat-skel" /> : `${formatCount(stats?.totalProperties || 0)}+`}</div>
            <div className="h-stat-lbl">Properties</div>
          </div>
          <div className="hero-stats-div"></div>
          <div>
            <div className="h-stat-num">{loadingStats ? <span className="stat-skel" /> : `${stats?.totalCities || 0}+`}</div>
            <div className="h-stat-lbl">Cities</div>
          </div>
          <div className="hero-stats-div"></div>
          <div>
            <div className="h-stat-num">{loadingStats ? <span className="stat-skel" /> : formatCount(stats?.totalBuyers || 0)}</div>
            <div className="h-stat-lbl">Buyers</div>
          </div>
          <div className="hero-stats-div"></div>
          <div>
            <div className="h-stat-num">{loadingStats ? <span className="stat-skel" /> : `${formatCount(stats?.totalAgents || 0)}+`}</div>
            <div className="h-stat-lbl">Agents</div>
          </div>
        </div>

        <div className="search-box">
          <div className="s-tabs">
            {TABS.map(t => (
              <button key={t.key} className={`s-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
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
          {/* unchanged — tabs, search row, BHK/budget selects, search button */}
        </div>
      </section>

      <div className="section">
        <div className="section-head"><h2 className="section-title">Browse by Property Type</h2></div>
        <div className="cats">
          {loadingTypes ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text3)', width: '100%' }}>
              Loading categories…
            </div>
          ) : typeCounts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text3)', width: '100%' }}>
              No categories available.
            </div>
          ) : (
            typeCounts.map(c => (
              <div key={c.propertyType} className="cat-card"
                onClick={() => navigate(`/search?propertyType=${c.propertyType}`)}>
                <div className="cat-icon"><i className={`ti ${PROPERTY_TYPE_ICON[c.propertyType] || 'ti-building'}`}></i></div>
                <div className="cat-label">{c.label}</div>
                <div className="cat-count">{formatCount(c.count)} listings</div>
              </div>
            ))
          )}
        </div>

        <div className="section-head">
          <h2 className="section-title">Featured Properties</h2>
          <a className="see-all" onClick={() => navigate('/search?isFeatured=true')} style={{ cursor: 'pointer' }}>
            View all →
          </a>
        </div>

        {loadingFeatured ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
            <i className="ti ti-loader-2" style={{ fontSize: 32, animation: 'spin 1s linear infinite', display: 'block', marginBottom: 8 }}></i>
            Loading properties…
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : featured.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
            <i className="ti ti-building-off" style={{ fontSize: 40, display: 'block', marginBottom: 12, opacity: 0.3 }}></i>
            <p>No featured properties available yet.</p>
            <button className="btn-navy" style={{ marginTop: 12, padding: '10px 20px', borderRadius: 8 }}
              onClick={() => navigate('/search')}>Browse all properties</button>
          </div>
        ) : (
          <div className="grid-auto">
            {featured.map(p => <PropCard key={p.id} p={p} />)}
          </div>
        )}
      </div>

      <div style={{ background: '#fff', padding: '48px 0' }}>
        <div className="section" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div className="section-head"><h2 className="section-title">Top Cities</h2></div>
          <div className="city-grid">
            {loadingCities ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text3)', width: '100%' }}>
                Loading cities…
              </div>
            ) : cities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text3)', width: '100%' }}>
                No city data available.
              </div>
            ) : (
              cities.map((c, i) => (
                <div key={c.city} className={`city-card ${CITY_COLOR_CLASSES[i % CITY_COLOR_CLASSES.length]}`}
                  onClick={() => navigate(`/search?city=${encodeURIComponent(c.city)}`)}>
                  <i className="ti ti-building city-icon"></i>
                  <div>
                    <div className="city-name">{c.city}</div>
                    <div className="city-props">{formatCount(c.count)} properties</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="insights-strip">
          <div className="ins-left">
            <h3>Property Market Insights</h3>
            <p>Bengaluru's residential market grew 18% YoY. Pune and Hyderabad continue to attract IT-driven demand with sub-₹1Cr inventory shrinking rapidly.</p>
            <button className="btn-outline" style={{ marginTop: 16, color: 'var(--gold)', borderColor: 'rgba(255,255,255,0.2)' }}
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
            ['ti-shield-check', 'Verified Listings', 'All properties are RERA-verified and field-inspected before going live.'],
            ['ti-currency-rupee', 'Zero Brokerage', 'Connect directly with owners and builders — no hidden middleman fees.'],
            ['ti-headset', 'Expert Guidance', 'Our 950+ certified property consultants guide you through every step.'],
            ['ti-file-certificate', 'Legal Assistance', 'Free legal document review and registration support for every transaction.'],
          ].map(([icon, title, desc]) => (
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

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import PropCard from '../components/PropCard.jsx';
import { PROPERTIES } from '../data/data.js';

function parsePrice(price) {
  const num = parseFloat(price.replace(/[₹,L Cr]/g, ''));
  return price.includes('Cr') ? num * 100 : num;
}

export default function SearchPage() {
  const [params] = useSearchParams();
  const initialQ = params.get('q') || '';

  const [query, setQuery] = useState(initialQ);
  const [bhkFilters, setBhkFilters] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [view, setView] = useState('grid');
  const [displayed, setDisplayed] = useState(8);
  const [minPrice, setMinPrice] = useState(20);
  const [maxPrice, setMaxPrice] = useState(500);

  useEffect(() => {
    setQuery(initialQ);
  }, [initialQ]);

  const filtered = useMemo(() => {
    let list = [...PROPERTIES];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.loc.toLowerCase().includes(q) || p.builder.toLowerCase().includes(q)
      );
    }
    if (bhkFilters.length) {
      list = list.filter((p) => bhkFilters.includes(p.bhk));
    }
    list = list.filter((p) => p.priceLakhs >= minPrice && p.priceLakhs <= maxPrice);

    if (sortBy === 'price-asc') list.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    if (sortBy === 'price-desc') list.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));

    return list;
  }, [query, bhkFilters, sortBy, minPrice, maxPrice]);

  const toShow = filtered.slice(0, displayed);

  function toggleBhk(val) {
    setBhkFilters((prev) => (prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]));
    setDisplayed(8);
  }

  function fmtPrice(v) {
    return v >= 100 ? `₹${(v / 100).toFixed(1)}Cr` : `₹${v}L`;
  }

  return (
    <>
      <Navbar />

      <div className="search-hero">
        <div className="search-hero-inner">
          <div className="search-bar-main">
            <div className="sb-inp-wrap">
              <i className="ti ti-map-pin" aria-hidden="true"></i>
              <input
                className="sb-inp"
                placeholder="Search by city, locality, project..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select className="sb-sel" onChange={(e) => e.target.value && toggleBhk(e.target.value)}>
              <option value="">Any BHK</option>
              <option>1 BHK</option>
              <option>2 BHK</option>
              <option>3 BHK</option>
              <option>4 BHK</option>
            </select>
            <button className="sb-btn" onClick={() => setDisplayed(8)}>
              <i className="ti ti-search" aria-hidden="true"></i> Search
            </button>
          </div>
        </div>
      </div>

      <div className="layout">
        <aside className="sidebar">
          <div className="filter-box">
            <div className="filter-title">
              Budget (₹){' '}
              <span
                className="filter-clear"
                onClick={() => {
                  setMinPrice(20);
                  setMaxPrice(500);
                }}
              >
                Reset
              </span>
            </div>
            <div className="price-range">
              <div className="range-labels">
                <span>₹20L</span>
                <span>₹5Cr</span>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                step="5"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
              />
              <input
                type="range"
                min="20"
                max="500"
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
              <div className="range-val">
                {fmtPrice(minPrice)} – {maxPrice >= 500 ? '₹5Cr+' : fmtPrice(maxPrice)}
              </div>
            </div>
          </div>

          <div className="filter-box">
            <div className="filter-title">BHK Type</div>
            {[
              ['1 BHK', '4,200'],
              ['2 BHK', '18,400'],
              ['3 BHK', '12,800'],
              ['4 BHK', '3,100'],
            ].map(([label, count]) => (
              <div className="filter-option" key={label}>
                <input
                  type="checkbox"
                  id={label}
                  checked={bhkFilters.includes(label)}
                  onChange={() => toggleBhk(label)}
                />
                <label htmlFor={label}>{label}</label>
                <span>{count}</span>
              </div>
            ))}
          </div>

          <div className="filter-box">
            <div className="filter-title">Possession Status</div>
            {[
              ['Ready to Move', '9,800'],
              ['Under Construction', '15,400'],
              ['New Launch', '3,200'],
            ].map(([label, count]) => (
              <div className="filter-option" key={label}>
                <input type="checkbox" id={label} />
                <label htmlFor={label}>{label}</label>
                <span>{count}</span>
              </div>
            ))}
          </div>

          <div className="filter-box">
            <div className="filter-title">Amenities</div>
            {['Swimming Pool', 'Gym / Fitness Centre', 'Clubhouse', '24x7 Security', 'Power Backup', 'Covered Parking'].map(
              (label) => (
                <div className="filter-option" key={label}>
                  <input type="checkbox" id={label} />
                  <label htmlFor={label}>{label}</label>
                </div>
              )
            )}
          </div>

          <button className="apply-filters" onClick={() => setDisplayed(8)}>
            Apply Filters
          </button>
        </aside>

        <main>
          <div className="results-header">
            <div className="results-count">
              Showing <strong>{filtered.length} properties</strong> {query && `for "${query}"`}
            </div>
            <div className="sort-bar">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="relevance">Sort: Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <div className="view-toggle">
                <button className={`vt-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')}>
                  <i className="ti ti-layout-grid" aria-hidden="true"></i>
                </button>
                <button className={`vt-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
                  <i className="ti ti-list" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          </div>

          {bhkFilters.length > 0 && (
            <div className="active-filters" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {bhkFilters.map((f) => (
                <div
                  key={f}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#e8ebf5',
                    color: 'var(--navy)',
                    fontSize: 12,
                    fontWeight: 500,
                    padding: '5px 10px',
                    borderRadius: 20,
                  }}
                >
                  {f}
                  <button
                    onClick={() => toggleBhk(f)}
                    style={{ background: 'none', border: 'none', color: 'var(--navy2)', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className={`results-grid ${view === 'list' ? 'list-view' : ''}`}>
            {toShow.map((p) => (
              <PropCard key={p.id} p={p} listView={view === 'list'} />
            ))}
          </div>

          {displayed < filtered.length && (
            <div className="load-more-wrap">
              <button className="btn-outline" style={{ padding: '12px 32px' }} onClick={() => setDisplayed((d) => d + 4)}>
                Load more properties
              </button>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </>
  );
}

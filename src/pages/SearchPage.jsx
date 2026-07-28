import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import PropCard from '../components/PropCard.jsx';
import { gql } from '../lib/gqlClient.js';
import { PROPERTIES_QUERY, SEARCH_FILTER_OPTIONS_QUERY } from '../lib/queries.js';
import { adaptProperties } from '../lib/adapt.js';

// Maps the navbar / homepage tab `?type=` param to actual GraphQL filter fields.
// Kept separate from the sidebar's manual filters so a nav click always
// resets the view to that tab's context (Buy / Rent / New Projects / Commercial / PG).
function deriveNavFilter(type) {
  switch (type) {
    case 'rent': return { listingType: 'RENT' };
    case 'pg': return { listingType: 'PG' };
    case 'commercial': return { propertyType: 'COMMERCIAL' };
    case 'projects': return { possessionStatus: 'Under Construction' };
    case 'buy': return { listingType: 'SALE' };
    default: return {};
  }
}

const TYPE_LABELS = {
  buy: 'Buy',
  rent: 'Rent',
  projects: 'New Projects',
  commercial: 'Commercial',
  pg: 'PG / Co-living',
};

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [bhkFilters, setBhkFilters] = useState([]);
  const [typeFilters, setTypeFilters] = useState([]);
  const [statusFilters, setStatusFilters] = useState([]);
  const [listingType, setListingType] = useState(''); // driven by navbar/tab `type` param — no sidebar control for this
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [sortBy, setSortBy] = useState('CREATED_AT');
  const [view, setView] = useState('grid');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const [results, setResults] = useState([]);
  const [pageInfo, setPageInfo] = useState({ totalCount: 0, hasNextPage: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activeType = searchParams.get('type') || '';

  // ── Sync state from the URL (navbar clicks, homepage tiles, homepage tab search) ──
  // Runs on mount and whenever the query string changes — this is what makes
  // navbar "Rent" / "Commercial" / etc actually filter results on this page,
  // even if the user is already on /search.
  useEffect(() => {
    const type = searchParams.get('type');
    const derived = deriveNavFilter(type);
    const propertyTypeParam = searchParams.get('propertyType'); // from homepage "Browse by Property Type" tiles
    const cityParam = searchParams.get('city');                 // from homepage "Top Cities" tiles
    const qParam = searchParams.get('q');
    const bhkParam = searchParams.get('bhk');                   // from homepage hero search BHK select
    const minPriceParam = searchParams.get('minPrice');         // from homepage hero search Budget select
    const maxPriceParam = searchParams.get('maxPrice');

    setListingType(derived.listingType || '');
    setTypeFilters(propertyTypeParam ? [propertyTypeParam] : (derived.propertyType ? [derived.propertyType] : []));
    setStatusFilters(derived.possessionStatus ? [derived.possessionStatus] : []);
    setCity(cityParam || '');
    setQuery(qParam || '');
    setBhkFilters(bhkParam ? [bhkParam] : []);
    // URL carries paise (e.g. from the homepage Budget dropdown); the slider works in Lakhs.
    setMinPrice(minPriceParam ? Number(minPriceParam) / 10000000 : 0);
    setMaxPrice(maxPriceParam ? Number(maxPriceParam) / 10000000 : 50000);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  // ── Dynamic filter options (BHK / Property Type / Possession Status / Cities) ──
  const [filterOptions, setFilterOptions] = useState({ bhk: [], types: [], statuses: [], cities: [] });
  const [loadingFilters, setLoadingFilters] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await gql(SEARCH_FILTER_OPTIONS_QUERY);
        if (cancelled) return;
        setFilterOptions({
          bhk: data.bhkOptions || [],
          types: data.propertyTypeCounts || [],
          statuses: data.possessionStatusOptions || [],
          cities: data.topCities || [],
        });
      } catch (e) {
        console.warn('Failed to load search filter options', e.message);
        if (!cancelled) setFilterOptions({ bhk: [], types: [], statuses: [], cities: [] });
      } finally {
        if (!cancelled) setLoadingFilters(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function fmtPrice(v) { return v >= 100 ? `₹${(v / 100).toFixed(1)}Cr` : `₹${v}L`; }

  const fetchProperties = useCallback(async (pg = 1) => {
    setLoading(true); setError('');
    try {
      const filter = {};
      if (query) filter.search = query;
      if (city) filter.city = city;
      if (bhkFilters.length) filter.bhk = bhkFilters;
      if (listingType) filter.listingType = listingType;
      // Schema's propertyType is a single enum, not a list — only the first selection applies.
      if (typeFilters.length) filter.propertyType = typeFilters[0];
      if (statusFilters.length) filter.possessionStatus = statusFilters[0];
      // Slider is in Lakhs for readability; backend compares against price_paise directly.
      if (minPrice > 0) filter.minPrice = Math.round(minPrice * 10000000);
      if (maxPrice < 50000) filter.maxPrice = Math.round(maxPrice * 10000000);
      if (searchParams.get('isFeatured')) filter.isFeatured = true;

      const data = await gql(PROPERTIES_QUERY, {
        filter,
        pagination: { page: pg, pageSize: PAGE_SIZE },
        sort: { field: sortBy, direction: 'DESC' },
      });
      const items = adaptProperties(data.properties?.items || []);
      setResults(pg === 1 ? items : prev => [...prev, ...items]);
      setPageInfo(data.properties?.pageInfo || { totalCount: 0, hasNextPage: false });
      setPage(pg);
    } catch (e) {
      setError(e.message || 'Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [query, city, bhkFilters, typeFilters, statusFilters, listingType, minPrice, maxPrice, sortBy, searchParams]);

  useEffect(() => { fetchProperties(1); }, [query, city, bhkFilters, typeFilters, statusFilters, listingType, minPrice, maxPrice, sortBy]);

  function toggleFilter(arr, setArr, val) {
    setArr(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
    setPage(1);
  }

  function clearAll() {
    setBhkFilters([]); setTypeFilters([]); setStatusFilters([]);
    setMinPrice(0); setMaxPrice(50000); setQuery(''); setCity('');
    // Note: listingType (from navbar tab) is intentionally left as-is —
    // "Clear filters" clears manual refinements, not the active tab context.
  }

  const activeFilterCount = bhkFilters.length + typeFilters.length + statusFilters.length + (minPrice > 0 ? 1 : 0) + (maxPrice < 50000 ? 1 : 0);

  return (
    <>
      <Navbar />

      <div className="search-hero">
        <div className="search-hero-inner">
          <div className="search-bar-main">
            <div className="sb-inp-wrap">
              <i className="ti ti-map-pin"></i>
              <input className="sb-inp" placeholder="City, locality, project name…"
                value={query} onChange={e => setQuery(e.target.value)} />
            </div>
            <input className="sb-inp" style={{ minWidth: 130, flex: '0 0 auto' }} placeholder="City…"
              list="city-suggestions"
              value={city} onChange={e => setCity(e.target.value)} />
            <datalist id="city-suggestions">
              {filterOptions.cities.map(c => <option key={c.city} value={c.city} />)}
            </datalist>
            <select className="sb-sel" value=""
              onChange={e => e.target.value && toggleFilter(bhkFilters, setBhkFilters, e.target.value)}>
              <option value="">BHK Type</option>
              {filterOptions.bhk.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <button className="sb-btn" onClick={() => fetchProperties(1)}>
              <i className="ti ti-search"></i> Search
            </button>
          </div>
        </div>
      </div>

      <div className="layout">
        <aside className="sidebar">
          <div className="filter-box">
            <div className="filter-title">
              Budget (₹)
              <span className="filter-clear" onClick={() => { setMinPrice(0); setMaxPrice(50000); }}>Reset</span>
            </div>
            <div className="price-range">
              <div className="range-labels"><span>₹0</span><span>₹5Cr+</span></div>
              <input type="range" min="0" max="50000" step="50" value={minPrice}
                onChange={e => setMinPrice(Number(e.target.value))} />
              <input type="range" min="0" max="50000" step="50" value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))} />
              <div className="range-val">{fmtPrice(minPrice)} – {maxPrice >= 50000 ? '₹5Cr+' : fmtPrice(maxPrice)}</div>
            </div>
          </div>

          <div className="filter-box">
            <div className="filter-title">BHK Type</div>
            {loadingFilters ? (
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Loading…</div>
            ) : filterOptions.bhk.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>No options available.</div>
            ) : (
              filterOptions.bhk.map(b => (
                <div className="filter-option" key={b}>
                  <input type="checkbox" id={`bhk-${b}`}
                    checked={bhkFilters.includes(b)}
                    onChange={() => toggleFilter(bhkFilters, setBhkFilters, b)} />
                  <label htmlFor={`bhk-${b}`}>{b}</label>
                </div>
              ))
            )}
          </div>

          <div className="filter-box">
            <div className="filter-title">Property Type</div>
            {loadingFilters ? (
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Loading…</div>
            ) : filterOptions.types.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>No options available.</div>
            ) : (
              filterOptions.types.map(t => (
                <div className="filter-option" key={t.propertyType}>
                  <input type="checkbox" id={`type-${t.propertyType}`}
                    checked={typeFilters.includes(t.propertyType)}
                    onChange={() => toggleFilter(typeFilters, setTypeFilters, t.propertyType)} />
                  <label htmlFor={`type-${t.propertyType}`}>{t.label} <span style={{ color: 'var(--text3)', fontSize: 11 }}>({t.count})</span></label>
                </div>
              ))
            )}
          </div>

          <div className="filter-box">
            <div className="filter-title">Possession Status</div>
            {loadingFilters ? (
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Loading…</div>
            ) : filterOptions.statuses.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>No options available.</div>
            ) : (
              filterOptions.statuses.map(s => (
                <div className="filter-option" key={s}>
                  <input type="checkbox" id={`status-${s}`}
                    checked={statusFilters.includes(s)}
                    onChange={() => toggleFilter(statusFilters, setStatusFilters, s)} />
                  <label htmlFor={`status-${s}`}>{s}</label>
                </div>
              ))
            )}
          </div>

          {activeFilterCount > 0 && (
            <button className="apply-filters" onClick={clearAll}>
              Clear All Filters ({activeFilterCount})
            </button>
          )}
        </aside>

        <main>
          <div className="results-header">
            <div className="results-count">
              {activeType && TYPE_LABELS[activeType] && (
                <span style={{ fontWeight: 600, color: 'var(--navy)', marginRight: 6 }}>
                  {TYPE_LABELS[activeType]} ·
                </span>
              )}
              {loading ? 'Searching…' : (
                <>Showing <strong>{results.length}</strong> of <strong>{pageInfo.totalCount}</strong> properties
                  {query && ` for "${query}"`}
                  {city && ` in ${city}`}
                </>
              )}
            </div>
            <div className="sort-bar">
              <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}>
                <option value="CREATED_AT">Sort: Newest</option>
                <option value="PRICE">Price: Low → High</option>
                <option value="VIEW_COUNT">Most Viewed</option>
                <option value="RATING">Highest Rated</option>
              </select>
              <div className="view-toggle">
                <button className={`vt-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')}>
                  <i className="ti ti-layout-grid"></i>
                </button>
                <button className={`vt-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
                  <i className="ti ti-list"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Active filter tags */}
          {(bhkFilters.length > 0 || typeFilters.length > 0) && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {[...bhkFilters, ...typeFilters].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#e8ebf5', color: 'var(--navy)', fontSize: 12, fontWeight: 500, padding: '5px 10px', borderRadius: 20 }}>
                  {f}
                  <button onClick={() => {
                    if (bhkFilters.includes(f)) toggleFilter(bhkFilters, setBhkFilters, f);
                    else toggleFilter(typeFilters, setTypeFilters, f);
                  }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--navy)' }}>×</button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div style={{ background: '#fde8e8', border: '1px solid #f5c0c0', borderRadius: 8, padding: '14px 16px', fontSize: 14, color: 'var(--danger)', marginBottom: 16, display: 'flex', gap: 8 }}>
              <i className="ti ti-alert-circle"></i> {error}
              <button style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }} onClick={() => fetchProperties(1)}>Retry</button>
            </div>
          )}

          {loading && results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text3)' }}>
              <i className="ti ti-loader-2" style={{ fontSize: 36, animation: 'spin 1s linear infinite', display: 'block', marginBottom: 12 }}></i>
              Searching properties…
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : results.length === 0 && !loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text3)' }}>
              <i className="ti ti-building-off" style={{ fontSize: 44, display: 'block', marginBottom: 12, opacity: 0.3 }}></i>
              <p style={{ fontSize: 15, marginBottom: 8 }}>No properties found</p>
              <p style={{ fontSize: 13 }}>Try adjusting your filters or search in a different city.</p>
              <button className="btn-outline" style={{ marginTop: 16, padding: '10px 20px' }} onClick={clearAll}>Clear filters</button>
            </div>
          ) : (
            <div className={`results-grid ${view === 'list' ? 'list-view' : ''}`}>
              {results.map(p => <PropCard key={p.id} p={p} />)}
            </div>
          )}

          {pageInfo.hasNextPage && !loading && (
            <div className="load-more-wrap">
              <button className="btn-outline" style={{ padding: '12px 32px' }}
                onClick={() => fetchProperties(page + 1)}>
                Load more properties
              </button>
            </div>
          )}
          {loading && results.length > 0 && (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--text3)', fontSize: 13 }}>
              <i className="ti ti-loader-2" style={{ animation: 'spin 1s linear infinite' }}></i> Loading more…
            </div>
          )}
        </main>
      </div>

      <Footer />
    </>
  );
}

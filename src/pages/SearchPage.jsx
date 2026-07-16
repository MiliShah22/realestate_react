import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import PropCard from '../components/PropCard.jsx';
import { gql } from '../lib/gqlClient.js';
import { PROPERTIES_QUERY } from '../lib/queries.js';
import { adaptProperties } from '../lib/adapt.js';

const BHK_OPTIONS  = ['1 BHK','2 BHK','3 BHK','4 BHK','4+ BHK'];
const TYPE_OPTIONS = ['APARTMENT','VILLA','PLOT','COMMERCIAL','PG'];
const STATUS_OPTIONS = [
  { label:'Ready to Move', val:'READY_TO_MOVE' },
  { label:'Under Construction', val:'UNDER_CONSTRUCTION' },
  { label:'New Launch', val:'NEW_LAUNCH' },
];

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [query,   setQuery]   = useState(searchParams.get('q') || '');
  const [city,    setCity]    = useState(searchParams.get('city') || '');
  const [bhkFilters,  setBhkFilters]  = useState([]);
  const [typeFilters, setTypeFilters] = useState(
    searchParams.get('propertyType') ? [searchParams.get('propertyType')] : []
  );
  const [statusFilters, setStatusFilters] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [sortBy,  setSortBy]  = useState('CREATED_AT');
  const [view,    setView]    = useState('grid');
  const [page,    setPage]    = useState(1);
  const PAGE_SIZE = 8;

  const [results,   setResults]   = useState([]);
  const [pageInfo,  setPageInfo]  = useState({ totalCount:0, hasNextPage:false });
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  function fmtPrice(v) { return v >= 100 ? `₹${(v/100).toFixed(1)}Cr` : `₹${v}L`; }

  const fetchProperties = useCallback(async (pg = 1) => {
    setLoading(true); setError('');
    try {
      const filter = {};
      if (query)              filter.search = query;
      if (city)               filter.city   = city;
      if (bhkFilters.length)  filter.bhk    = bhkFilters;
      if (typeFilters.length) filter.propertyType = typeFilters;
      if (statusFilters.length) filter.possessionStatus = statusFilters[0]; // possessionStatus is a string, not enum array
      if (minPrice > 0)       filter.minPrice = minPrice;
      if (maxPrice < 50000)   filter.maxPrice = maxPrice;
      if (searchParams.get('isFeatured')) filter.isFeatured = true;

      const data = await gql(PROPERTIES_QUERY, {
        filter,
        pagination: { page: pg, pageSize: PAGE_SIZE },
        sort: { field: sortBy, direction: 'DESC' },
      });
      const items = adaptProperties(data.properties?.items || []);
      setResults(pg === 1 ? items : prev => [...prev, ...items]);
      setPageInfo(data.properties?.pageInfo || { totalCount:0, hasNextPage:false });
      setPage(pg);
    } catch (e) {
      setError(e.message || 'Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [query, city, bhkFilters, typeFilters, statusFilters, minPrice, maxPrice, sortBy, searchParams]);

  useEffect(() => { fetchProperties(1); }, [query, city, bhkFilters, typeFilters, statusFilters, minPrice, maxPrice, sortBy]);

  function toggleFilter(arr, setArr, val) {
    setArr(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
    setPage(1);
  }

  function clearAll() {
    setBhkFilters([]); setTypeFilters([]); setStatusFilters([]);
    setMinPrice(0); setMaxPrice(50000); setQuery(''); setCity('');
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
            <input className="sb-inp" style={{minWidth:130,flex:'0 0 auto'}} placeholder="City…"
              value={city} onChange={e => setCity(e.target.value)} />
            <select className="sb-sel" onChange={e => e.target.value && toggleFilter(bhkFilters,setBhkFilters,e.target.value)}>
              <option value="">BHK Type</option>
              {BHK_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
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
            {BHK_OPTIONS.map(b => (
              <div className="filter-option" key={b}>
                <input type="checkbox" id={`bhk-${b}`}
                  checked={bhkFilters.includes(b)}
                  onChange={() => toggleFilter(bhkFilters, setBhkFilters, b)} />
                <label htmlFor={`bhk-${b}`}>{b}</label>
              </div>
            ))}
          </div>

          <div className="filter-box">
            <div className="filter-title">Property Type</div>
            {TYPE_OPTIONS.map(t => (
              <div className="filter-option" key={t}>
                <input type="checkbox" id={`type-${t}`}
                  checked={typeFilters.includes(t)}
                  onChange={() => toggleFilter(typeFilters, setTypeFilters, t)} />
                <label htmlFor={`type-${t}`}>{t.charAt(0) + t.slice(1).toLowerCase()}</label>
              </div>
            ))}
          </div>

          <div className="filter-box">
            <div className="filter-title">Possession Status</div>
            {STATUS_OPTIONS.map(s => (
              <div className="filter-option" key={s.val}>
                <input type="checkbox" id={`status-${s.val}`}
                  checked={statusFilters.includes(s.val)}
                  onChange={() => toggleFilter(statusFilters, setStatusFilters, s.val)} />
                <label htmlFor={`status-${s.val}`}>{s.label}</label>
              </div>
            ))}
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
                <button className={`vt-btn ${view==='grid'?'active':''}`} onClick={() => setView('grid')}>
                  <i className="ti ti-layout-grid"></i>
                </button>
                <button className={`vt-btn ${view==='list'?'active':''}`} onClick={() => setView('list')}>
                  <i className="ti ti-list"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Active filter tags */}
          {(bhkFilters.length > 0 || typeFilters.length > 0) && (
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}>
              {[...bhkFilters,...typeFilters].map(f => (
                <div key={f} style={{display:'flex',alignItems:'center',gap:6,background:'#e8ebf5',color:'var(--navy)',fontSize:12,fontWeight:500,padding:'5px 10px',borderRadius:20}}>
                  {f}
                  <button onClick={() => {
                    if (bhkFilters.includes(f)) toggleFilter(bhkFilters,setBhkFilters,f);
                    else toggleFilter(typeFilters,setTypeFilters,f);
                  }} style={{background:'none',border:'none',cursor:'pointer',color:'var(--navy)'}}>×</button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div style={{background:'#fde8e8',border:'1px solid #f5c0c0',borderRadius:8,padding:'14px 16px',fontSize:14,color:'var(--danger)',marginBottom:16,display:'flex',gap:8}}>
              <i className="ti ti-alert-circle"></i> {error}
              <button style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer',color:'var(--danger)'}} onClick={() => fetchProperties(1)}>Retry</button>
            </div>
          )}

          {loading && results.length === 0 ? (
            <div style={{textAlign:'center',padding:'60px',color:'var(--text3)'}}>
              <i className="ti ti-loader-2" style={{fontSize:36,animation:'spin 1s linear infinite',display:'block',marginBottom:12}}></i>
              Searching properties…
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : results.length === 0 && !loading ? (
            <div style={{textAlign:'center',padding:'60px',color:'var(--text3)'}}>
              <i className="ti ti-building-off" style={{fontSize:44,display:'block',marginBottom:12,opacity:0.3}}></i>
              <p style={{fontSize:15,marginBottom:8}}>No properties found</p>
              <p style={{fontSize:13}}>Try adjusting your filters or search in a different city.</p>
              <button className="btn-outline" style={{marginTop:16,padding:'10px 20px'}} onClick={clearAll}>Clear filters</button>
            </div>
          ) : (
            <div className={`results-grid ${view==='list'?'list-view':''}`}>
              {results.map(p => <PropCard key={p.id} p={p} />)}
            </div>
          )}

          {pageInfo.hasNextPage && !loading && (
            <div className="load-more-wrap">
              <button className="btn-outline" style={{padding:'12px 32px'}}
                onClick={() => fetchProperties(page + 1)}>
                Load more properties
              </button>
            </div>
          )}
          {loading && results.length > 0 && (
            <div style={{textAlign:'center',padding:20,color:'var(--text3)',fontSize:13}}>
              <i className="ti ti-loader-2" style={{animation:'spin 1s linear infinite'}}></i> Loading more…
            </div>
          )}
        </main>
      </div>

      <Footer />
    </>
  );
}

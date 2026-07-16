import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { adaptProperty } from '../lib/adapt.js';
import { gql } from '../lib/gqlClient.js';
import { PROPERTIES_QUERY } from '../lib/queries.js';

const COLOR_MAP = { APARTMENT:'blue', VILLA:'green', PLOT:'warm', COMMERCIAL:'purple', PG:'teal', STUDIO:'rose' };

// Deterministic pseudo-positions based on property index so pins don't jump
const POSITIONS = [
  { left:'22%', top:'28%' }, { left:'38%', top:'42%' }, { left:'55%', top:'35%' },
  { left:'68%', top:'55%' }, { left:'30%', top:'62%' }, { left:'72%', top:'25%' },
  { left:'45%', top:'70%' }, { left:'60%', top:'75%' }, { left:'20%', top:'48%' },
  { left:'80%', top:'40%' }, { left:'35%', top:'20%' }, { left:'62%', top:'18%' },
];

const FILTER_TABS = [
  ['all',        'All'],
  ['APARTMENT',  'Apartments'],
  ['VILLA',      'Villas'],
  ['PLOT',       'Plots'],
  ['COMMERCIAL', 'Commercial'],
];


export default function MapPage() {
  const navigate = useNavigate();
  const [query,      setQuery]      = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeId,   setActiveId]   = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  // Load all properties (up to 50) for map pins
  useEffect(() => {
    (async () => {
      setLoading(true); setError('');
      try {
        const data = await gql(PROPERTIES_QUERY, {
          filter: {},
          pagination: { page: 1, pageSize: 50 },
          sort: { field: 'VIEW_COUNT', direction: 'DESC' },
        });
        setProperties((data.properties?.items || []).map(adaptProperty));
      } catch (e) {
        setError(e.message || 'Failed to load map data.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = [...properties];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.loc.toLowerCase().includes(q));
    }
    if (filterType !== 'all') {
      list = list.filter(p => p.type === filterType);
    }
    return list;
  }, [properties, query, filterType]);

  const active     = filtered.find(p => p.id === activeId);
  const activeIdx  = filtered.findIndex(p => p.id === activeId);
  const activePos  = activeIdx >= 0 ? POSITIONS[activeIdx % POSITIONS.length] : null;

  return (
    <>
      <Navbar />
      <div className="map-layout">

        {/* ── LEFT PANEL ── */}
        <div className="map-panel">
          <div className="map-search">
            <div className="map-search-wrap">
              <i className="ti ti-map-pin"></i>
              <input type="text" placeholder="Search area, locality, landmark…"
                value={query} onChange={e => setQuery(e.target.value)} />
            </div>
            <div className="map-filters">
              {FILTER_TABS.map(([key, label]) => (
                <span key={key} className={`mf-chip ${filterType === key ? 'active' : ''}`}
                  onClick={() => setFilterType(key)}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="map-results">
            {loading ? (
              <div style={{textAlign:'center',padding:'40px 20px',color:'var(--text3)'}}>
                <i className="ti ti-loader-2" style={{fontSize:28,display:'block',marginBottom:8,animation:'spin 1s linear infinite'}}></i>
                Loading map data…
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            ) : error ? (
              <div style={{padding:'16px',fontSize:13,color:'var(--danger)'}}>
                <i className="ti ti-alert-circle"></i> {error}
              </div>
            ) : (
              <>
                <h3>{filtered.length} properties in this area</h3>
                {filtered.map(p => (
                  <div key={p.id} className={`map-prop-item ${activeId === p.id ? 'active' : ''}`}
                    onClick={() => setActiveId(p.id)}>
                    <div className={`mpi-img ${p.color}`}>
                      <i className="ti ti-building"></i>
                    </div>
                    <div className="mpi-info">
                      <div className="mpi-price">{p.price}</div>
                      <div className="mpi-name">{p.name}</div>
                      <div className="mpi-loc">{p.loc}</div>
                      <div className="mpi-chips">
                        <span className="mpi-chip">{p.bhk}</span>
                        <span className="mpi-chip">{p.area}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* ── MAP ── */}
        <div className="map-area"
          onClick={e => { if (!e.target.closest('.map-pin') && !e.target.closest('.map-popup')) setActiveId(null); }}>
          <div className="map-placeholder">
            {/* Road grid */}
            <div className="road-h major" style={{top:'30%'}}></div>
            <div className="road-h" style={{top:'50%'}}></div>
            <div className="road-h" style={{top:'70%'}}></div>
            <div className="road-h" style={{top:'15%'}}></div>
            <div className="road-h" style={{top:'85%'}}></div>
            <div className="road-v major" style={{left:'40%'}}></div>
            <div className="road-v" style={{left:'60%'}}></div>
            <div className="road-v" style={{left:'20%'}}></div>
            <div className="road-v" style={{left:'75%'}}></div>
            <div className="road-v" style={{left:'85%'}}></div>

            {/* Pins */}
            {!loading && filtered.map((p, i) => {
              const pos = POSITIONS[i % POSITIONS.length];
              return (
                <div key={p.id} className={`map-pin ${activeId === p.id ? 'active' : ''}`}
                  style={{ left: pos.left, top: pos.top }}
                  onClick={e => { e.stopPropagation(); setActiveId(p.id); }}>
                  <div className="pin-bubble">{p.price}</div>
                </div>
              );
            })}

            {/* Popup */}
            {active && activePos && (
              <div className="map-popup" style={{
                left: `${parseFloat(activePos.left) + (parseFloat(activePos.left) + 22 > 90 ? -24 : 2)}%`,
                top:  `${parseFloat(activePos.top) + 2}%`,
              }}>
                <div className={`popup-img ${active.color}`}>
                  <i className="ti ti-building" style={{fontSize:32,color:'rgba(255,255,255,0.15)'}}></i>
                </div>
                <div className="popup-body">
                  <div className="popup-price">{active.price}</div>
                  <div className="popup-name">{active.name}</div>
                  <div className="popup-loc">{active.loc}</div>
                  <button className="popup-view" onClick={() => navigate(`/property/${active.id}`)}>
                    View Details
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="map-controls">
            <div className="mc-btn" title="Zoom in"><i className="ti ti-plus"></i></div>
            <div className="mc-btn" title="Zoom out"><i className="ti ti-minus"></i></div>
            <div className="mc-btn" title="My location"><i className="ti ti-current-location"></i></div>
            <div className="mc-btn" title="Satellite view"><i className="ti ti-layers-difference"></i></div>
          </div>

          {/* Legend */}
          <div className="map-legend">
            <div className="legend-row"><div className="leg-dot" style={{background:'var(--navy)'}}></div> For Sale</div>
            <div className="legend-row"><div className="leg-dot" style={{background:'var(--sage)'}}></div> For Rent</div>
            <div className="legend-row"><div className="leg-dot" style={{background:'var(--gold)'}}></div> New Project</div>
          </div>

          {/* Loading overlay on map */}
          {loading && (
            <div style={{position:'absolute',inset:0,background:'rgba(221,227,239,0.7)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <i className="ti ti-loader-2" style={{fontSize:36,color:'var(--navy)',animation:'spin 1s linear infinite'}}></i>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

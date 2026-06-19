import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { PROPERTIES, MAP_POSITIONS } from '../data/data.js';

export default function MapPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeId, setActiveId] = useState(null);

  const filtered = useMemo(() => {
    let list = [...PROPERTIES];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.loc.toLowerCase().includes(q));
    }
    if (filterType !== 'all') {
      list = list.filter((p) => p.type === filterType || p.bhk === filterType || p.badge === filterType);
    }
    return list;
  }, [query, filterType]);

  const active = filtered.find((p) => p.id === activeId);
  const activeIdx = filtered.findIndex((p) => p.id === activeId);
  const activePos = activeIdx >= 0 ? MAP_POSITIONS[activeIdx % MAP_POSITIONS.length] : null;

  const FILTERS = [
    ['all', 'All'],
    ['Apartment', 'Apartments'],
    ['Villa', 'Villas'],
    ['ready', 'Ready'],
    ['2 BHK', '2 BHK'],
    ['3 BHK', '3 BHK'],
  ];

  return (
    <>
      <Navbar />
      <div className="map-layout">
        {/* LEFT PANEL */}
        <div className="map-panel">
          <div className="map-search">
            <div className="map-search-wrap">
              <i className="ti ti-map-pin" aria-hidden="true"></i>
              <input
                type="text"
                placeholder="Search area, locality, landmark..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="map-filters">
              {FILTERS.map(([key, label]) => (
                <span
                  key={key}
                  className={`mf-chip ${filterType === key ? 'active' : ''}`}
                  onClick={() => setFilterType(key)}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className="map-results">
            <h3>{filtered.length} properties in this area</h3>
            <div>
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className={`map-prop-item ${activeId === p.id ? 'active' : ''}`}
                  onClick={() => setActiveId(p.id)}
                >
                  <div className={`mpi-img ${p.color}`}>
                    <i className="ti ti-building" aria-hidden="true"></i>
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
            </div>
          </div>
        </div>

        {/* MAP */}
        <div
          className="map-area"
          onClick={(e) => {
            if (!e.target.closest('.map-pin') && !e.target.closest('.map-popup')) setActiveId(null);
          }}
        >
          <div className="map-placeholder">
            <div className="road-h major" style={{ top: '30%' }}></div>
            <div className="road-h" style={{ top: '50%' }}></div>
            <div className="road-h" style={{ top: '70%' }}></div>
            <div className="road-h" style={{ top: '15%' }}></div>
            <div className="road-h" style={{ top: '85%' }}></div>
            <div className="road-v major" style={{ left: '40%' }}></div>
            <div className="road-v" style={{ left: '60%' }}></div>
            <div className="road-v" style={{ left: '20%' }}></div>
            <div className="road-v" style={{ left: '75%' }}></div>
            <div className="road-v" style={{ left: '85%' }}></div>

            {filtered.map((p, i) => {
              const pos = MAP_POSITIONS[i % MAP_POSITIONS.length];
              return (
                <div
                  key={p.id}
                  className={`map-pin ${activeId === p.id ? 'active' : ''}`}
                  style={{ left: pos.left, top: pos.top }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveId(p.id);
                  }}
                >
                  <div className="pin-bubble">{p.price}</div>
                </div>
              );
            })}

            {active && activePos && (
              <div
                className="map-popup"
                style={{
                  left: `${parseFloat(activePos.left) + (parseFloat(activePos.left) + 22 > 90 ? -24 : 2)}%`,
                  top: `${parseFloat(activePos.top) + 2}%`,
                  display: 'block',
                }}
              >
                <div className={`popup-img ${active.color}`}>
                  <i className="ti ti-building" style={{ fontSize: 32, color: 'rgba(255,255,255,0.15)' }}></i>
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

          <div className="map-controls">
            <div className="mc-btn" title="Zoom in">
              <i className="ti ti-plus" aria-hidden="true"></i>
            </div>
            <div className="mc-btn" title="Zoom out">
              <i className="ti ti-minus" aria-hidden="true"></i>
            </div>
            <div className="mc-btn" title="My location">
              <i className="ti ti-current-location" aria-hidden="true"></i>
            </div>
            <div className="mc-btn" title="Satellite view">
              <i className="ti ti-layers-difference" aria-hidden="true"></i>
            </div>
          </div>

          <div className="map-legend">
            <div className="legend-row">
              <div className="leg-dot" style={{ background: 'var(--navy)' }}></div> For Sale
            </div>
            <div className="legend-row">
              <div className="leg-dot" style={{ background: 'var(--sage)' }}></div> For Rent
            </div>
            <div className="legend-row">
              <div className="leg-dot" style={{ background: 'var(--gold)' }}></div> New Project
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

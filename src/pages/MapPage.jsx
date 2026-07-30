import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { adaptProperty } from '../lib/adapt.js';
import { gql } from '../lib/gqlClient.js';
import { PROPERTY_TYPE_COUNTS_QUERY } from '../lib/queries.js';

// Dedicated map query — the shared CARD fragment used elsewhere doesn't
// include latitude/longitude, which is what actually drives pin placement here.
const MAP_PROPERTIES_QUERY = `
  query MapProperties($filter: PropertyFilterInput, $pagination: PaginationInput, $sort: PropertySortInput) {
    properties(filter: $filter, pagination: $pagination, sort: $sort) {
      items {
        id title city locality
        listingType propertyType bhk
        priceDisplay pricePaise carpetAreaSqft
        latitude longitude
        status possessionStatus
        isFeatured isVerified viewCount rating reviewCount
        images { id url isCover sortOrder }
        createdAt
      }
      pageInfo { totalCount hasNextPage }
    }
  }
`;

// Fallback pseudo-positions for properties missing lat/lng, so a pin still
// renders somewhere sensible instead of disappearing.
const FALLBACK_POSITIONS = [
  { left: '22%', top: '28%' }, { left: '38%', top: '42%' }, { left: '55%', top: '35%' },
  { left: '68%', top: '55%' }, { left: '30%', top: '62%' }, { left: '72%', top: '25%' },
  { left: '45%', top: '70%' }, { left: '60%', top: '75%' }, { left: '20%', top: '48%' },
  { left: '80%', top: '40%' }, { left: '35%', top: '20%' }, { left: '62%', top: '18%' },
];

// Mirrors SearchPage's mapping so /map and /search agree on what a given
// navbar tab means — this is what keeps their result counts consistent.
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

export default function MapPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeId, setActiveId] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [typeTabs, setTypeTabs] = useState([]); // dynamic filter tabs from propertyTypeCounts
  const [loadingTabs, setLoadingTabs] = useState(true);

  const cityParam = searchParams.get('city') || '';
  const typeParam = searchParams.get('type') || '';

  // Debounce the free-text search box so it doesn't fire an API call on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  // Load the dynamic filter tabs once (independent of the active filters).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingTabs(true);
      try {
        const data = await gql(PROPERTY_TYPE_COUNTS_QUERY);
        if (!cancelled) setTypeTabs(data.propertyTypeCounts || []);
      } catch (e) {
        console.warn('Failed to load property type tabs', e.message);
        if (!cancelled) setTypeTabs([]);
      } finally {
        if (!cancelled) setLoadingTabs(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Re-query the API every time a filter actually changes — city (from the URL),
  // property type tab, or the debounced search text. This is what makes the
  // tabs/search box genuinely filter, instead of slicing a fixed 50-item batch
  // loaded once on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true); setError('');

      const derived = deriveNavFilter(typeParam);
      const filter = {};
      if (cityParam) filter.city = cityParam;
      // The property-type tab is a manual override; the nav type param is the
      // fallback default so /map?type=commercial pre-filters like /search does.
      if (filterType !== 'all') filter.propertyType = filterType;
      else if (derived.propertyType) filter.propertyType = derived.propertyType;
      if (derived.listingType) filter.listingType = derived.listingType;
      if (derived.possessionStatus) filter.possessionStatus = derived.possessionStatus;
      if (debouncedQuery) filter.search = debouncedQuery;

      try {
        const data = await gql(MAP_PROPERTIES_QUERY, {
          filter,
          pagination: { page: 1, pageSize: 50 },
          sort: { field: 'VIEW_COUNT', direction: 'DESC' },
        });
        if (cancelled) return;
        const items = data.properties?.items || [];
        setProperties(items.map(raw => ({
          ...adaptProperty(raw),
          id: raw.id,
          latitude: raw.latitude != null ? Number(raw.latitude) : null,
          longitude: raw.longitude != null ? Number(raw.longitude) : null,
          listingType: raw.listingType,
          propertyType: raw.propertyType,
        })));
      } catch (e) {
        if (cancelled) return;
        console.warn('Failed to load map properties', e.message);
        setError(e.message || 'Failed to load map data.');
        setProperties([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [cityParam, typeParam, filterType, debouncedQuery]);

  // Normalize real lat/lng into 10%–90% screen-space coordinates so pins
  // reflect actual relative geographic spread instead of a fixed cycling list.
  // Positions are keyed by property id (not list index) so they stay put
  // when the visible set changes due to search/filtering.
  const positionsById = useMemo(() => {
    const withCoords = properties.filter(p => typeof p.latitude === 'number' && typeof p.longitude === 'number');
    const map = {};
    if (withCoords.length === 0) {
      properties.forEach((p, i) => { map[p.id] = FALLBACK_POSITIONS[i % FALLBACK_POSITIONS.length]; });
      return map;
    }

    const lats = withCoords.map(p => p.latitude);
    const lngs = withCoords.map(p => p.longitude);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const latSpan = (maxLat - minLat) || 1;
    const lngSpan = (maxLng - minLng) || 1;

    let fallbackIdx = 0;
    properties.forEach((p) => {
      if (typeof p.latitude === 'number' && typeof p.longitude === 'number') {
        const left = 10 + ((p.longitude - minLng) / lngSpan) * 80;
        const top = 10 + ((maxLat - p.latitude) / latSpan) * 80; // higher lat = further north = smaller top
        map[p.id] = { left: `${left.toFixed(1)}%`, top: `${top.toFixed(1)}%` };
      } else {
        map[p.id] = FALLBACK_POSITIONS[fallbackIdx % FALLBACK_POSITIONS.length];
        fallbackIdx += 1;
      }
    });
    return map;
  }, [properties]);

  const filterTabs = useMemo(() => {
    const tabs = [['all', 'All']];
    typeTabs.forEach(t => tabs.push([t.propertyType, t.label]));
    return tabs;
  }, [typeTabs]);

  // Server already applied city/propertyType/search filters — no client-side
  // re-filtering needed, which is exactly the part that was silently broken before.
  const filtered = properties;

  const legendCounts = useMemo(() => {
    const counts = { SALE: 0, RENT: 0, PG: 0 };
    filtered.forEach(p => { if (counts[p.listingType] != null) counts[p.listingType] += 1; });
    return counts;
  }, [filtered]);

  const active = filtered.find(p => p.id === activeId);
  const activePos = active ? positionsById[active.id] : null;

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
              {loadingTabs ? (
                <span className="mf-chip" style={{ opacity: 0.5 }}>Loading…</span>
              ) : (
                filterTabs.map(([key, label]) => (
                  <span key={key} className={`mf-chip ${filterType === key ? 'active' : ''}`}
                    onClick={() => setFilterType(key)}>
                    {label}
                  </span>
                ))
              )}
            </div>
            {cityParam && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="ti ti-map-pin-filled"></i> Showing <strong style={{ color: 'var(--navy)' }}>{cityParam}</strong>
                <button onClick={() => navigate('/map')} style={{ marginLeft: 4, background: 'none', border: 'none', color: 'var(--navy)', textDecoration: 'underline', cursor: 'pointer', fontSize: 12 }}>
                  clear
                </button>
              </div>
            )}
          </div>

          <div className="map-results">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)' }}>
                <i className="ti ti-loader-2" style={{ fontSize: 28, display: 'block', marginBottom: 8, animation: 'spin 1s linear infinite' }}></i>
                Loading map data…
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            ) : error ? (
              <div style={{ padding: '16px', fontSize: 13, color: 'var(--danger)' }}>
                <i className="ti ti-alert-circle"></i> {error}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)' }}>
                <i className="ti ti-map-off" style={{ fontSize: 32, display: 'block', marginBottom: 8, opacity: 0.4 }}></i>
                No properties match this view.
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

            {/* Pins — positioned from real lat/lng, normalized into the viewport */}
            {!loading && filtered.map((p) => {
              const pos = positionsById[p.id];
              if (!pos) return null;
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
                top: `${parseFloat(activePos.top) + 2}%`,
              }}>
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

          {/* Controls */}
          <div className="map-controls">
            <div className="mc-btn" title="Zoom in"><i className="ti ti-plus"></i></div>
            <div className="mc-btn" title="Zoom out"><i className="ti ti-minus"></i></div>
            <div className="mc-btn" title="My location"><i className="ti ti-current-location"></i></div>
            <div className="mc-btn" title="Satellite view"><i className="ti ti-layers-difference"></i></div>
          </div>

          {/* Legend — live counts from the currently filtered set */}
          <div className="map-legend">
            <div className="legend-row"><div className="leg-dot" style={{ background: 'var(--navy)' }}></div> For Sale {!loading && `(${legendCounts.SALE})`}</div>
            <div className="legend-row"><div className="leg-dot" style={{ background: 'var(--sage)' }}></div> For Rent {!loading && `(${legendCounts.RENT})`}</div>
            <div className="legend-row"><div className="leg-dot" style={{ background: 'var(--gold)' }}></div> PG / Co-living {!loading && `(${legendCounts.PG})`}</div>
          </div>

          {/* Loading overlay on map */}
          {loading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(221,227,239,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ti ti-loader-2" style={{ fontSize: 36, color: 'var(--navy)', animation: 'spin 1s linear infinite' }}></i>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

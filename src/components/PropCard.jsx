import { useNavigate }               from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { gql }                        from '../lib/gqlClient.js';
import { TOGGLE_SAVE_PROPERTY_MUTATION } from '../lib/queries.js';
import { useAuth }                    from '../context/AuthContext.jsx';

// toggleSaveProperty returns Boolean! (true = saved, false = unsaved)
// We optimistically flip the heart and rollback on error.

const BADGE_LABEL = {
  hot:      '🔥 Hot',
  verified: '✓ Verified',
  new:      'New',
  pending:  'Pending',
};

// Persisted cache of saved property IDs (for cross-page consistency)
let _savedSet = new Set(JSON.parse(localStorage.getItem('saved_ids') || '[]').map(String));
function persistSaved() {
  localStorage.setItem('saved_ids', JSON.stringify([..._savedSet]));
}
export function initSavedSet(ids = []) {
  _savedSet = new Set(ids.map(String));
  persistSaved();
}
export function isSaved(id) { return _savedSet.has(String(id)); }

export default function PropCard({ p, onUnsave }) {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const [saved,  setSaved]  = useState(() => isSaved(p.id));
  const [saving, setSaving] = useState(false);

  useEffect(() => { setSaved(isSaved(p.id)); }, [p.id]);

  const handleSave = useCallback(async (e) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }

    const willBeSaved = !saved;
    // Optimistic update
    setSaved(willBeSaved);
    if (willBeSaved) _savedSet.add(String(p.id));
    else             _savedSet.delete(String(p.id));
    persistSaved();

    try {
      const data = await gql(TOGGLE_SAVE_PROPERTY_MUTATION, { propertyId: p.id });
      // Server is the source of truth — sync back
      const serverSaved = data.toggleSaveProperty;
      setSaved(serverSaved);
      if (serverSaved) _savedSet.add(String(p.id));
      else             _savedSet.delete(String(p.id));
      persistSaved();
      if (!serverSaved) onUnsave?.(p.id);
    } catch {
      // Rollback on error
      setSaved(!willBeSaved);
      if (!willBeSaved) _savedSet.add(String(p.id));
      else              _savedSet.delete(String(p.id));
      persistSaved();
    } finally {
      setSaving(false);
    }
  }, [saved, p.id, user, navigate, onUnsave]);

  // These fields come from adaptProperty() in propertyAdapter.js
  // p.name    = title
  // p.loc     = "locality, city"
  // p.area    = "X sq.ft"
  // p.color   = CSS class from propertyType
  // p.badge   = 'hot' | 'verified' | 'new'
  // p.builder = builderName
  // p.views   = formatted viewCount
  // p.price   = priceDisplay
  // p.status  = possessionStatus label
  // p.bhk     = bhk

  const badgeLabel = BADGE_LABEL[p.badge] || 'New';
  const badgeClass = p.badge === 'hot' ? 'badge-hot'
                   : p.badge === 'verified' ? 'badge-ready'
                   : 'badge-new';

  return (
    <div className="prop-card" onClick={() => navigate(`/property/${p.id}`)}>
      <div className={`prop-img ${p.color || 'blue'}`}>
        {p.coverImage
          ? <img src={p.coverImage} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',inset:0}} />
          : <i className="ti ti-building prop-img-icon" aria-hidden="true"></i>
        }
        <span className={`prop-badge ${badgeClass}`}>{badgeLabel}</span>
        <button
          className={`prop-save ${saved ? 'saved' : ''}`}
          onClick={handleSave}
          aria-label={saved ? 'Unsave property' : 'Save property'}
          disabled={saving}
        >
          <i className={`ti ${saving ? 'ti-loader-2' : saved ? 'ti-heart-filled' : 'ti-heart'}`}
            style={saving ? {animation:'spin 1s linear infinite'} : {}}
            aria-hidden="true">
          </i>
        </button>
      </div>

      <div className="prop-body">
        <div className="prop-price">{p.price || p.priceDisplay}</div>
        <div className="prop-name">{p.name || p.title}</div>
        <div className="prop-loc">
          <i className="ti ti-map-pin" style={{fontSize:12}} aria-hidden="true"></i>{' '}
          {p.loc || [p.locality, p.city].filter(Boolean).join(', ')}
        </div>
        <div className="prop-chips">
          {p.bhk    && <span className="chip">{p.bhk}</span>}
          {p.area   && <span className="chip">{p.area}</span>}
          {p.status && <span className="chip">{p.status}</span>}
        </div>
      </div>

      <div className="prop-footer">
        <span className="prop-builder">{p.builder || p.builderName || p.tenant?.name || ''}</span>
        <span className="prop-views">
          <i className="ti ti-eye" style={{fontSize:12}} aria-hidden="true"></i>{' '}
          {p.views || p.viewCount || 0}
        </span>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

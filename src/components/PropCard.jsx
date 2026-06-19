import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const BADGE_LABEL = { new: 'New', hot: 'Hot', ready: 'Ready', proj: 'Project' };

export function getSaved() {
  try {
    return JSON.parse(localStorage.getItem('saved') || '[]');
  } catch {
    return [];
  }
}

export function toggleSavedId(id) {
  const saved = getSaved();
  const idx = saved.indexOf(id);
  if (idx === -1) saved.push(id);
  else saved.splice(idx, 1);
  localStorage.setItem('saved', JSON.stringify(saved));
  return saved;
}

export default function PropCard({ p, listView = false }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(getSaved().includes(p.id));
  }, [p.id]);

  function handleSave(e) {
    e.stopPropagation();
    toggleSavedId(p.id);
    setSaved((s) => !s);
  }

  return (
    <div className="prop-card" onClick={() => navigate(`/property/${p.id}`)}>
      <div className={`prop-img ${p.color}`}>
        <i className="ti ti-building prop-img-icon" aria-hidden="true"></i>
        <span className={`prop-badge badge-${p.badge}`}>{BADGE_LABEL[p.badge] || p.badge}</span>
        <button className={`prop-save ${saved ? 'saved' : ''}`} onClick={handleSave} aria-label="Save property">
          <i className="ti ti-heart" aria-hidden="true"></i>
        </button>
      </div>
      <div className="prop-body">
        <div className="prop-price">{p.price}</div>
        <div className="prop-name">{p.name}</div>
        <div className="prop-loc">
          <i className="ti ti-map-pin" style={{ fontSize: 12 }} aria-hidden="true"></i> {p.loc}
        </div>
        <div className="prop-chips">
          <span className="chip">{p.bhk}</span>
          <span className="chip">{p.area}</span>
          <span className="chip">{p.status}</span>
        </div>
      </div>
      <div className="prop-footer">
        <span className="prop-builder">{p.builder}</span>
        <span className="prop-views">
          <i className="ti ti-eye" style={{ fontSize: 12 }} aria-hidden="true"></i> {p.views}
        </span>
      </div>
    </div>
  );
}

// ── adaptProperty ──────────────────────────────────────────────────────────
// Converts a raw Property from the GraphQL API to PropCard's shape.
//
// Schema field    →  UI field used by PropCard
// title           →  name
// priceDisplay    →  price
// bhk             →  bhk         (NOT bhkLabel — doesn't exist)
// carpetAreaSqft  →  area
// possessionStatus→  status
// builderName     →  builder
// viewCount       →  views
// isFeatured      →  badge 'proj'
// isVerified      →  badge 'ready'
// propertyType    →  color (gradient class)
// images[isCover] →  coverImage

const TYPE_COLOR = {
  APARTMENT:  'blue',
  VILLA:      'green',
  PLOT:       'warm',
  COMMERCIAL: 'purple',
  OFFICE:     'teal',
  PG_ROOM:    'rose',
};

function deriveBadge(p) {
  if (p.isFeatured) return 'proj';
  if (p.isVerified) return 'ready';
  return 'new';
}

function getCoverImage(images = []) {
  if (!images?.length) return null;
  return (images.find(i => i.isCover) || images[0])?.url || null;
}

export function adaptProperty(p) {
  if (!p) return null;
  return {
    id:          p.id,
    name:        p.title,
    price:       p.priceDisplay,
    loc:         [p.locality, p.city].filter(Boolean).join(', '),
    city:        p.city,
    bhk:         p.bhk || p.propertyType || '—',
    area:        p.carpetAreaSqft
                   ? `${Number(p.carpetAreaSqft).toLocaleString('en-IN')} sq.ft`
                   : '—',
    status:      p.possessionStatus || '',
    possession:  p.possessionStatus || (p.possessionDate ? new Date(p.possessionDate).toLocaleDateString('en-IN',{month:'short',year:'numeric'}) : '—'),
    builder:     p.builderName || '',
    views:       p.viewCount != null
                   ? Number(p.viewCount).toLocaleString('en-IN')
                   : '0',
    rating:      p.rating ?? null,
    reviewCount: p.reviewCount ?? 0,
    color:       TYPE_COLOR[p.propertyType] || 'blue',
    badge:       deriveBadge(p),
    coverImage:  getCoverImage(p.images),
    _raw:        p,
  };
}

export function adaptProperties(list = []) {
  return (list || []).map(adaptProperty).filter(Boolean);
}

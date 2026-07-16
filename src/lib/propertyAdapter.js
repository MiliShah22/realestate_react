// ── propertyAdapter.js ────────────────────────────────────────────────────
// Maps raw GraphQL Property fields (exact schema names from property.js) to
// the display-friendly shape used by PropCard, PropertyDetailPage, MapPage.
//
// Schema → UI mapping:
//   title          → name
//   locality+city  → loc
//   carpetAreaSqft → area  (formatted string)
//   builderName    → builder
//   viewCount      → views (formatted string)
//   possessionStatus → status (display label)
//   propertyType   → color (CSS class)
//   isFeatured + isVerified + status → badge
//   bhk            → bhk  (same)
//   priceDisplay   → price (same)

const TYPE_COLOR = {
  APARTMENT:  'blue',
  VILLA:      'green',
  PLOT:       'warm',
  COMMERCIAL: 'purple',
  OFFICE:     'teal',
  PG_ROOM:    'rose',
};

const POSSESSION_LABEL = {
  'READY_TO_MOVE':       'Ready to Move',
  'UNDER_CONSTRUCTION':  'Under Construction',
  'NEW_LAUNCH':          'New Launch',
  'COMPLETED':           'Ready to Move',
};

// badge priority: featured > verified > pending > new
function deriveBadge(p) {
  if (p.isFeatured)                             return 'hot';
  if (p.isVerified)                             return 'verified';
  if (p.status === 'PENDING_REVIEW')            return 'pending';
  return 'new';
}

function fmtViews(n) {
  if (!n) return '0';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function fmtArea(sqft) {
  if (!sqft) return null;
  return `${Number(sqft).toLocaleString('en-IN')} sq.ft`;
}

// Cover image url from images array
function coverImage(images) {
  if (!images?.length) return null;
  return (images.find(i => i.isCover) || images[0])?.url || null;
}

/**
 * adaptProperty(raw)
 * Call this on any Property object returned from the API before passing it
 * to PropCard, PropertyDetailPage, MapPage, or DashboardPage.
 */
export function adaptProperty(p) {
  if (!p) return null;
  return {
    // ── Keep all original API fields ─────────────────────────────────────
    ...p,
    // ── Derived display fields ────────────────────────────────────────────
    name:    p.title,
    loc:     [p.locality, p.city].filter(Boolean).join(', ') || p.city || '',
    area:    fmtArea(p.carpetAreaSqft),
    builder: p.builderName || p.tenant?.name || '',
    views:   fmtViews(p.viewCount),
    price:   p.priceDisplay,
    color:   TYPE_COLOR[p.propertyType] || 'blue',
    badge:   deriveBadge(p),
    status:  POSSESSION_LABEL[p.possessionStatus] || p.possessionStatus || '',
    // For detail page
    desc:    p.description || '',
    coverImage: coverImage(p.images),
    bhkLabel: p.bhk || p.propertyType || '',
  };
}

/** Adapt an array of properties */
export function adaptProperties(items) {
  return (items || []).map(adaptProperty);
}

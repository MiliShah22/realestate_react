// ── adaptProperty ──────────────────────────────────────────────────────────
// Converts a raw Property from the GraphQL API into the shape used by
// PropCard and all detail pages.
//
// Schema field      →  UI field
// id                →  id
// title             →  name
// priceDisplay      →  price
// bhk               →  bhk
// carpetAreaSqft    →  area
// possessionStatus  →  status  (e.g. "Ready to Move")
// builderName       →  builder
// viewCount         →  views
// [locality, city]  →  loc
// propertyType      →  color (gradient class), type (display)
// images[isCover]   →  coverImage
// isFeatured        →  badge
// isVerified        →  isVerified
// description       →  desc
// amenities         →  amenities
// rating            →  rating
// reviewCount       →  reviewCount

const TYPE_COLOR = {
  APARTMENT:  'blue',
  VILLA:      'green',
  PLOT:       'warm',
  COMMERCIAL: 'purple',
  OFFICE:     'teal',
  PG_ROOM:    'rose',
};

const TYPE_LABEL = {
  APARTMENT:  'Apartment',
  VILLA:      'Villa',
  PLOT:       'Plot',
  COMMERCIAL: 'Commercial',
  OFFICE:     'Office',
  PG_ROOM:    'PG / Room',
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
    // Identity
    id:           p.id,
    // Display
    name:         p.title,
    price:        p.priceDisplay   || '—',
    loc:          [p.locality, p.city].filter(Boolean).join(', ') || p.city || '—',
    city:         p.city           || '',
    bhk:          p.bhk            || p.propertyType || '—',
    area:         p.carpetAreaSqft
                    ? `${Number(p.carpetAreaSqft).toLocaleString('en-IN')} sq.ft`
                    : '—',
    status:       p.possessionStatus || '',
    possession:   p.possessionStatus
                    || (p.possessionDate
                        ? new Date(p.possessionDate).toLocaleDateString('en-IN', { month:'short', year:'numeric' })
                        : '—'),
    builder:      p.builderName    || '',
    views:        p.viewCount != null
                    ? Number(p.viewCount).toLocaleString('en-IN')
                    : '0',
    rating:       p.rating         ?? null,
    reviewCount:  p.reviewCount    ?? 0,
    // Visual
    color:        TYPE_COLOR[p.propertyType]  || 'blue',
    type:         TYPE_LABEL[p.propertyType]  || (p.propertyType || ''),
    badge:        deriveBadge(p),
    // Media
    coverImage:   getCoverImage(p.images),
    images:       Array.isArray(p.images) ? p.images : [],
    // Detail fields
    desc:         p.description    || '',
    amenities:    Array.isArray(p.amenities) ? p.amenities : [],
    isVerified:   p.isVerified     ?? false,
    isFeatured:   p.isFeatured     ?? false,
    // Price
    pricePaise:   p.pricePaise     ?? 0,
    // Raw for anything not covered above
    _raw:         p,
  };
}

export function adaptProperties(list = []) {
  return (list || []).map(adaptProperty).filter(Boolean);
}

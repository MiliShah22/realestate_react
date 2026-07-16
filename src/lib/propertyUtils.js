// ── propertyUtils.js ──────────────────────────────────────────────────────
// Derives UI display values from exact schema field names:
//   bhk           → "2 BHK" (already stored as string in DB)
//   priceDisplay  → "₹1.25 Cr" (computed by resolver)
//   pricePaise    → raw number for EMI calc (divide by 100 for ₹, by 10000000 for Cr)
//   rating        → 0..5 float
//   isFeatured    → boolean
//   isVerified    → boolean
//   possessionStatus → string e.g. "READY_TO_MOVE" | "UNDER_CONSTRUCTION"
//   propertyType  → "APARTMENT" | "VILLA" | "PLOT" | "COMMERCIAL" | "OFFICE" | "PG_ROOM"

export const COLOR_MAP = {
  APARTMENT: 'blue',
  VILLA:     'green',
  PLOT:      'warm',
  COMMERCIAL:'purple',
  OFFICE:    'teal',
  PG_ROOM:   'rose',
};

// badge: derived from isFeatured + isVerified (schema has no `badge` field)
export function deriveBadge(p) {
  if (p.isFeatured) return 'hot';
  if (p.isVerified) return 'ready';
  return 'new';
}

// bhkLabel: schema stores `bhk` as a plain string e.g. "2 BHK"
// propertyType is "APARTMENT" etc. — format nicely for display
export function deriveBhkLabel(p) {
  if (p.bhk) return p.bhk;
  return (p.propertyType || '').replace(/_/g, ' ');
}

// Possession display string from schema's `possessionStatus` string field
export function derivePossessionLabel(p) {
  const s = p.possessionStatus || p.status || '';
  const MAP = {
    READY_TO_MOVE:       'Ready to Move',
    UNDER_CONSTRUCTION:  'Under Construction',
    NEW_LAUNCH:          'New Launch',
    ACTIVE:              'Active',
    DRAFT:               'Draft',
    PENDING_REVIEW:      'Pending Review',
  };
  return MAP[s] || s;
}

// Convert pricePaise to Lakhs for EMI calculator (1 Lakh = 10,000,000 paise)
export function paiseToLakhs(pricePaise) {
  if (!pricePaise) return 50;
  return Math.round(pricePaise / 10000000 * 10) / 10; // e.g. 125 for ₹1.25 Cr
}

// Adapt a raw API Property object to a consistent UI shape
// used by PropCard, SearchPage, PropertyDetailPage, MapPage
export function adaptProperty(p) {
  const badge     = deriveBadge(p);
  const bhkLabel  = deriveBhkLabel(p);
  const areaLabel = p.carpetAreaSqft
    ? `${Number(p.carpetAreaSqft).toLocaleString('en-IN')} sq.ft`
    : '—';

  return {
    // raw API fields passed through
    id:              p.id,
    title:           p.title,
    city:            p.city,
    locality:        p.locality,
    propertyType:    p.propertyType,
    listingType:     p.listingType,
    status:          p.status,
    isFeatured:      p.isFeatured,
    isVerified:      p.isVerified,
    pricePaise:      p.pricePaise,
    carpetAreaSqft:  p.carpetAreaSqft,
    amenities:       p.amenities || [],
    images:          p.images || [],
    rating:          p.rating || 0,
    reviewCount:     p.reviewCount || 0,
    viewCount:       p.viewCount || 0,
    leadCount:       p.leadCount || 0,
    latitude:        p.latitude,
    longitude:       p.longitude,
    description:     p.description || '',
    tenant:          p.tenant,
    createdAt:       p.createdAt,

    // ── derived display fields ──
    name:            p.title,
    price:           p.priceDisplay || '—',
    priceLakhs:      paiseToLakhs(p.pricePaise),   // used by EMI calculator
    area:            areaLabel,
    bhk:             bhkLabel,                      // "2 BHK"
    bhkLabel,
    builder:         p.builderName || p.tenant?.name || '—',
    builderName:     p.builderName || '—',
    loc:             [p.locality, p.city].filter(Boolean).join(', '),
    badge,
    color:           COLOR_MAP[p.propertyType] || 'blue',
    views:           (p.viewCount || 0).toLocaleString('en-IN'),
    possession:      derivePossessionLabel(p),
    avgRating:       p.rating || 0,                 // alias for rating
    coverImage:      p.images?.find(i => i.isCover)?.url || p.images?.[0]?.url || null,
  };
}

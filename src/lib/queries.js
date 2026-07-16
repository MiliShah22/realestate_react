// ── queries.js — All GraphQL queries/mutations ────────────────────────────
// Field names match the exact schema from uploaded property.js + auth.js:
//   Property fields: id title city locality listingType propertyType bhk
//                    priceDisplay pricePaise carpetAreaSqft builtupAreaSqft
//                    status possessionStatus isFeatured isVerified
//                    viewCount leadCount rating reviewCount builderName
//                    amenities[String!] images{ id url altText sortOrder isCover }
//   Auth fields:     id name email role phone city avatarUrl isActive
//                    emailVerified phoneVerified tenant{ id name status }
//
// MUTATION arg names (exact):
//   refreshToken(refreshToken: String!)          ← NOT token
//   toggleSaveProperty(propertyId: ID!) → Boolean!  ← NOT save/unsaveProperty
//   createProperty(input: PropertyInput!)        ← NOT CreatePropertyInput
//   updateProperty(id, input: PropertyInput!)    ← NOT UpdatePropertyInput
//   properties filter: PropertyFilterInput       ← NOT PropertyFilter
//   properties sort:   PropertySortInput         ← NOT PropertySort

// ── FRAGMENT: reusable property card fields ───────────────────────────────
const PROPERTY_CARD_FIELDS = `
  id title city locality
  listingType propertyType bhk
  priceDisplay pricePaise carpetAreaSqft
  status possessionStatus
  isFeatured isVerified
  viewCount leadCount
  rating reviewCount
  builderName createdAt
  images { id url altText isCover sortOrder }
`;

// ── AUTH ──────────────────────────────────────────────────────────────────
export const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!, $role: UserRole!) {
    login(input: { email: $email, password: $password, role: $role }) {
      accessToken
      refreshToken
      user {
        id name email role phone city
        avatarUrl emailVerified phoneVerified isActive
        tenant { id name status }
      }
    }
  }
`;

export const SIGNUP_MUTATION = `
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      accessToken
      refreshToken
      user {
        id name email role phone city
        avatarUrl emailVerified phoneVerified isActive
        tenant { id name status }
      }
    }
  }
`;

// logout returns MutationResponse! { success message }
export const LOGOUT_MUTATION = `
  mutation Logout($refreshToken: String!) {
    logout(refreshToken: $refreshToken) { success message }
  }
`;

export const REQUEST_PASSWORD_RESET_MUTATION = `
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email) { success message }
  }
`;

// verifyOtp args: contact (email/phone), code, purpose (EMAIL_VERIFY | PHONE_OTP | PASSWORD_RESET)
export const VERIFY_OTP_MUTATION = `
  mutation VerifyOtp($contact: String!, $code: String!, $purpose: String!) {
    verifyOtp(contact: $contact, code: $code, purpose: $purpose) { success message }
  }
`;

// resetPassword: arg is `token` not `resetToken`
export const RESET_PASSWORD_MUTATION = `
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword) { success message }
  }
`;

export const CHANGE_PASSWORD_MUTATION = `
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword) {
      success message
    }
  }
`;

export const ME_QUERY = `
  query Me {
    me {
      id name email role phone city
      avatarUrl emailVerified phoneVerified isActive
      tenant { id name status }
    }
  }
`;

// refreshToken mutation — arg MUST be `refreshToken` not `token`
export const REFRESH_TOKEN_MUTATION = `
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) { accessToken refreshToken }
  }
`;

export const UPDATE_PROFILE_MUTATION = `
  mutation UpdateProfile($name: String, $phone: String, $city: String, $avatarUrl: String) {
    updateProfile(name: $name, phone: $phone, city: $city, avatarUrl: $avatarUrl) {
      id name email phone city avatarUrl
    }
  }
`;

// ── PROPERTIES ────────────────────────────────────────────────────────────
// filter type = PropertyFilterInput (NOT PropertyFilter)
// sort type   = PropertySortInput   (NOT PropertySort)
// NO: slug, bhkLabel, priceLakhs, possessionLabel, badge, images(limit:N)
// YES: bhk, priceDisplay, possessionStatus, isFeatured, images (no args)

export const PROPERTIES_QUERY = `
  query Properties(
    $filter: PropertyFilterInput
    $pagination: PaginationInput
    $sort: PropertySortInput
  ) {
    properties(filter: $filter, pagination: $pagination, sort: $sort) {
      items {
        ${PROPERTY_CARD_FIELDS}
      }
      pageInfo { page pageSize totalCount totalPages hasNextPage }
    }
  }
`;

// property(id: ID!) — no slug arg in schema
export const PROPERTY_QUERY = `
  query Property($id: ID!) {
    property(id: $id) {
      id title city locality
      listingType propertyType bhk
      priceDisplay pricePaise pricePerSqftPaise
      carpetAreaSqft builtupAreaSqft
      status possessionStatus possessionDate
      isFeatured isVerified
      description builderName
      viewCount leadCount
      rating reviewCount
      latitude longitude addressLine state pincode
      amenities
      images { id url altText isCover sortOrder }
      tenant { id name }
      createdAt publishedAt
    }
  }
`;

// featuredProperties(limit: Int = 8): [Property!]!
export const FEATURED_PROPERTIES_QUERY = `
  query FeaturedProperties($limit: Int) {
    featuredProperties(limit: $limit) {
      ${PROPERTY_CARD_FIELDS}
    }
  }
`;

// similarProperties(propertyId: ID!, limit: Int = 4): [Property!]!
export const SIMILAR_PROPERTIES_QUERY = `
  query SimilarProperties($propertyId: ID!, $limit: Int) {
    similarProperties(propertyId: $propertyId, limit: $limit) {
      ${PROPERTY_CARD_FIELDS}
    }
  }
`;

// toggleSaveProperty returns Boolean! (true = now saved, false = now unsaved)
// This replaces both saveProperty and unsaveProperty
export const TOGGLE_SAVE_PROPERTY_MUTATION = `
  mutation ToggleSaveProperty($propertyId: ID!) {
    toggleSaveProperty(propertyId: $propertyId)
  }
`;

// savedProperties(pagination: PaginationInput): PropertyConnection!
export const SAVED_PROPERTIES_QUERY = `
  query SavedProperties($pagination: PaginationInput) {
    savedProperties(pagination: $pagination) {
      items {
        ${PROPERTY_CARD_FIELDS}
      }
      pageInfo { page pageSize totalCount hasNextPage }
    }
  }
`;

// recordPropertyView(propertyId: ID!): MutationResponse!
export const RECORD_PROPERTY_VIEW_MUTATION = `
  mutation RecordPropertyView($propertyId: ID!) {
    recordPropertyView(propertyId: $propertyId) { success }
  }
`;

// createProperty — input type is PropertyInput! (NOT CreatePropertyInput)
export const CREATE_PROPERTY_MUTATION = `
  mutation CreateProperty($input: PropertyInput!) {
    createProperty(input: $input) {
      id title city priceDisplay status
    }
  }
`;

// updateProperty — input type is PropertyInput! (NOT UpdatePropertyInput)
export const UPDATE_PROPERTY_MUTATION = `
  mutation UpdateProperty($id: ID!, $input: PropertyInput!) {
    updateProperty(id: $id, input: $input) {
      id title status priceDisplay
    }
  }
`;

export const DELETE_PROPERTY_MUTATION = `
  mutation DeleteProperty($id: ID!) {
    deleteProperty(id: $id) { success message }
  }
`;

export const SUBMIT_PROPERTY_MUTATION = `
  mutation SubmitPropertyForReview($id: ID!) {
    submitPropertyForReview(id: $id) { id status }
  }
`;

// Franchise: list their own tenant's properties
// tenantId must come from user.tenant.id (passed as variable)
export const MY_PROPERTIES_QUERY = `
  query MyProperties($tenantId: ID!, $pagination: PaginationInput) {
    properties(
      filter: { tenantId: $tenantId, status: ACTIVE }
      pagination: $pagination
      sort: { field: CREATED_AT, direction: DESC }
    ) {
      items {
        ${PROPERTY_CARD_FIELDS}
        status
      }
      pageInfo { page pageSize totalCount hasNextPage }
    }
  }
`;

// ── LEADS ─────────────────────────────────────────────────────────────────
export const CREATE_LEAD_MUTATION = `
  mutation CreateLead($input: CreateLeadInput!) {
    createLead(input: $input) {
      id status createdAt
    }
  }
`;

export const MY_LEADS_QUERY = `
  query MyLeads($pagination: PaginationInput) {
    myLeads(pagination: $pagination) {
      items {
        id status source budgetLabel message createdAt
        property { id title city priceDisplay images { url isCover } }
        assignedTo { id name }
      }
      pageInfo { totalCount hasNextPage }
    }
  }
`;

export const TENANT_LEADS_QUERY = `
  query TenantLeads($filter: LeadFilter, $pagination: PaginationInput) {
    tenantLeads(filter: $filter, pagination: $pagination) {
      items {
        id status source budgetLabel contactName contactPhone contactEmail
        message createdAt updatedAt
        property { id title city priceDisplay }
        assignedTo { id name }
      }
      pageInfo { totalCount hasNextPage }
    }
  }
`;

export const UPDATE_LEAD_STATUS_MUTATION = `
  mutation UpdateLeadStatus($id: ID!, $status: LeadStatus!, $notes: String) {
    updateLeadStatus(id: $id, status: $status, notes: $notes) {
      id status updatedAt
    }
  }
`;

// ── REVIEWS ───────────────────────────────────────────────────────────────
export const CREATE_REVIEW_MUTATION = `
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) { id rating status createdAt }
  }
`;

export const MY_REVIEWS_QUERY = `
  query MyReviews {
    myReviews {
      id rating body status createdAt
      property { id title city }
    }
  }
`;

// ── SAVED SEARCHES / ALERTS ───────────────────────────────────────────────
export const MY_SAVED_SEARCHES_QUERY = `
  query MySavedSearches {
    mySavedSearches {
      id label alertsEnabled createdAt
    }
  }
`;

export const SAVE_SEARCH_MUTATION = `
  mutation SaveSearch($label: String!, $query: PropertyFilterInput!, $alertsEnabled: Boolean) {
    saveSearch(label: $label, query: $query, alertsEnabled: $alertsEnabled) {
      id label alertsEnabled
    }
  }
`;

export const TOGGLE_SEARCH_ALERT_MUTATION = `
  mutation ToggleSearchAlert($id: ID!, $enabled: Boolean!) {
    toggleSearchAlert(id: $id, enabled: $enabled) { id alertsEnabled }
  }
`;

export const DELETE_SAVED_SEARCH_MUTATION = `
  mutation DeleteSavedSearch($id: ID!) {
    deleteSavedSearch(id: $id) { success }
  }
`;

// ── DASHBOARD / REPORTS ───────────────────────────────────────────────────
export const DASHBOARD_STATS_QUERY = `
  query DashboardStats {
    dashboardStats {
      totalProperties activeUsers monthlyRevenuePaise
      pendingReviews franchiseCount newLeads
    }
  }
`;

export const MY_TENANT_QUERY = `
  query MyTenant {
    myTenant {
      id name status phone billingEmail city gstin
      listingCount activeLeadCount staffCount ownerCount
      plan { id name code maxListings maxStaff commissionPercent }
    }
  }
`;

export const MONTHLY_METRICS_QUERY = `
  query MonthlyMetrics($months: Int) {
    monthlyMetrics(months: $months) {
      month revenuePaise leads propertiesListed
    }
  }
`;

// ── TENANT STAFF (franchise internal) ────────────────────────────────────
export const TENANT_STAFF_QUERY = `
  query TenantStaff {
    tenantStaff {
      id name email role isActive createdAt
    }
  }
`;

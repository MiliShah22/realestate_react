// ── queries.js v2.1.0 ────────────────────────────────────────────────────────
// Verified against uploaded schema files (auth.js, property.js).
// PageInfo has ONLY: page, pageSize, totalCount, hasNextPage — NO totalPages.

const CARD = `
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

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!, $role: UserRole!) {
    login(input: { email: $email, password: $password, role: $role }) {
      accessToken refreshToken
      user { id name email role phone city avatarUrl isActive tenant { id name status } }
    }
  }
`;

export const SIGNUP_MUTATION = `
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      accessToken refreshToken
      user { id name email role phone city avatarUrl isActive tenant { id name status } }
    }
  }
`;

export const LOGOUT_MUTATION = `
  mutation Logout($refreshToken: String!) {
    logout(refreshToken: $refreshToken) { success message }
  }
`;

export const ME_QUERY = `
  query Me {
    me { id name email role phone city avatarUrl emailVerified phoneVerified isActive tenant { id name status } }
  }
`;

export const REFRESH_TOKEN_MUTATION = `
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) { accessToken refreshToken }
  }
`;

export const REQUEST_PASSWORD_RESET_MUTATION = `
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email) { success message }
  }
`;

export const VERIFY_OTP_MUTATION = `
  mutation VerifyOtp($contact: String!, $code: String!, $purpose: String!) {
    verifyOtp(contact: $contact, code: $code, purpose: $purpose) { success message }
  }
`;

export const RESEND_OTP_MUTATION = `
  mutation ResendOtp($contact: String!, $purpose: String!) {
    resendOtp(contact: $contact, purpose: $purpose) { success message }
  }
`;

export const RESET_PASSWORD_MUTATION = `
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword) { success message }
  }
`;

export const CHANGE_PASSWORD_MUTATION = `
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword) { success message }
  }
`;

export const UPDATE_PROFILE_MUTATION = `
  mutation UpdateProfile($name: String, $phone: String, $city: String, $avatarUrl: String) {
    updateProfile(name: $name, phone: $phone, city: $city, avatarUrl: $avatarUrl) {
      id name email phone city avatarUrl
    }
  }
`;

export const UPDATE_NOTIFICATION_PREFS_MUTATION = `
  mutation UpdateNotificationPrefs($prefs: JSON!) {
    updateNotificationPrefs(prefs: $prefs) { id notificationPrefs }
  }
`;

// ── PROPERTIES ────────────────────────────────────────────────────────────────
// PageInfo fields: page pageSize totalCount hasNextPage  ← NO totalPages

export const PROPERTIES_QUERY = `
  query Properties($filter: PropertyFilterInput, $pagination: PaginationInput, $sort: PropertySortInput) {
    properties(filter: $filter, pagination: $pagination, sort: $sort) {
      items { ${CARD} }
      pageInfo { page pageSize totalCount hasNextPage }
    }
  }
`;

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
      viewCount leadCount rating reviewCount
      latitude longitude addressLine state pincode
      amenities
      images { id url altText isCover sortOrder }
      tenant { id name }
      createdAt publishedAt
    }
  }
`;

export const FEATURED_PROPERTIES_QUERY = `
  query FeaturedProperties($limit: Int) {
    featuredProperties(limit: $limit) { ${CARD} }
  }
`;

export const SIMILAR_PROPERTIES_QUERY = `
  query SimilarProperties($propertyId: ID!, $limit: Int) {
    similarProperties(propertyId: $propertyId, limit: $limit) { ${CARD} }
  }
`;

export const TOGGLE_SAVE_PROPERTY_MUTATION = `
  mutation ToggleSaveProperty($propertyId: ID!) {
    toggleSaveProperty(propertyId: $propertyId)
  }
`;

export const SAVED_PROPERTIES_QUERY = `
  query SavedProperties($pagination: PaginationInput) {
    savedProperties(pagination: $pagination) {
      items { ${CARD} }
      pageInfo { page pageSize totalCount hasNextPage }
    }
  }
`;

export const RECORD_PROPERTY_VIEW_MUTATION = `
  mutation RecordPropertyView($propertyId: ID!) {
    recordPropertyView(propertyId: $propertyId) { success }
  }
`;

export const CREATE_PROPERTY_MUTATION = `
  mutation CreateProperty($input: PropertyInput!) {
    createProperty(input: $input) { id title city status priceDisplay }
  }
`;

export const UPDATE_PROPERTY_MUTATION = `
  mutation UpdateProperty($id: ID!, $input: PropertyInput!) {
    updateProperty(id: $id, input: $input) { id title status priceDisplay }
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

export const ADD_PROPERTY_IMAGES_MUTATION = `
  mutation AddPropertyImages($propertyId: ID!, $urls: [String!]!) {
    addPropertyImages(propertyId: $propertyId, urls: $urls) { id images { id url isCover sortOrder } }
  }
`;

export const MY_PROPERTIES_QUERY = `
  query MyProperties($tenantId: ID!, $pagination: PaginationInput) {
    properties(
      filter: { tenantId: $tenantId }
      pagination: $pagination
      sort: { field: CREATED_AT, direction: DESC }
    ) {
      items { ${CARD} }
      pageInfo { page pageSize totalCount hasNextPage }
    }
  }
`;

// ── LEADS ─────────────────────────────────────────────────────────────────────
export const CREATE_LEAD_MUTATION = `
  mutation CreateLead($input: CreateLeadInput!) {
    createLead(input: $input) { id status createdAt }
  }
`;

export const MY_LEADS_QUERY = `
  query myEnquiries($pagination: PaginationInput) {
    myEnquiries(pagination: $pagination) {
      items {
        id status source budgetLabel message createdAt
        property { id title city priceDisplay images { url isCover } }
        assignedAgent { id name }
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
        assignedAgent { id name }
      }
      pageInfo { totalCount hasNextPage }
    }
  }
`;

export const UPDATE_LEAD_STATUS_MUTATION = `
  mutation UpdateLeadStatus($id: ID!, $status: LeadStatus!, $notes: String) {
    updateLeadStatus(id: $id, status: $status, notes: $notes) { id status updatedAt }
  }
`;

// ── REVIEWS ───────────────────────────────────────────────────────────────────
export const CREATE_REVIEW_MUTATION = `
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) { id rating status createdAt }
  }
`;

export const MY_REVIEWS_QUERY = `
 query MyReviews($pagination: PaginationInput) {
  myReviews(pagination: $pagination) {
    items {
      id
      rating
      body
      status
      createdAt
      property {
        id
        title
        city
      }
    }
    pageInfo {
      totalCount
      hasNextPage
      page
      pageSize
    }
  }
}
`;

// ── SAVED SEARCHES ────────────────────────────────────────────────────────────
export const MY_SAVED_SEARCHES_QUERY = `
  query MySavedSearches {
    mySavedSearches { id label alertsEnabled createdAt }
  }
`;

export const SAVE_SEARCH_MUTATION = `
  mutation SaveSearch($label: String!, $query: PropertyFilterInput!, $alertsEnabled: Boolean) {
    saveSearch(label: $label, query: $query, alertsEnabled: $alertsEnabled) { id label alertsEnabled }
  }
`;

export const TOGGLE_SEARCH_ALERT_MUTATION = `
  mutation ToggleSearchAlert($id: ID!, $enabled: Boolean!) {
    toggleSearchAlert(id: $id, enabled: $enabled) { id alertsEnabled }
  }
`;

export const DELETE_SAVED_SEARCH_MUTATION = `
  mutation DeleteSavedSearch($id: ID!) {
    deleteSavedSearch(id: $id) { success message }
  }
`;

// ── TENANT / FRANCHISE ────────────────────────────────────────────────────────
export const MY_TENANT_QUERY = `
  query MyTenant {
    myTenant {
      id name status phone billingEmail city gstin
      listingCount activeLeadCount staffCount ownerCount
      plan { id name code maxListings maxStaff commissionPercent }
    }
  }
`;

export const TENANT_STAFF_QUERY = `
  query TenantStaff {
    tenantStaff { id name email role isActive createdAt }
  }
`;

// ── DASHBOARD / REPORTS ───────────────────────────────────────────────────────
export const DASHBOARD_STATS_QUERY = `
  query DashboardStats {
    dashboardStats { totalProperties activeUsers monthlyRevenuePaise pendingReviews franchiseCount newLeads }
  }
`;
export const CUSTOMER_DASHBOARD_STATS_QUERY = `
query CustomerDashboardStats {
  customerDashboardStats {
    savedProperties
    enquiriesSent
    convertedLeads
    activeAlerts
  }
}
`;

export const MONTHLY_METRICS_QUERY = `
  query MonthlyMetrics($months: Int) {
    monthlyMetrics(months: $months) { month revenuePaise leads propertiesListed }
  }
`;
export const PROPERTY_TYPE_COUNTS_QUERY = `
  query PropertyTypeCounts {
    propertyTypeCounts { propertyType label count }
  }
`;

export const TOP_CITIES_QUERY = `
  query TopCities($limit: Int) {
    topCities(limit: $limit) { city count }
  }
`;
export const PLATFORM_STATS_QUERY = `
  query PlatformStats {
    platformStats { totalProperties totalCities totalBuyers totalAgents }
  }
`;
export const SEARCH_FILTER_OPTIONS_QUERY = `
  query SearchFilterOptions {
    propertyTypeCounts { propertyType label count }
    topCities(limit: 30) { city count }
    bhkOptions
    possessionStatusOptions
  }
`;
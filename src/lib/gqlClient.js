// ── Estatiq GraphQL Client ────────────────────────────────────────────────
// Plain fetch — no Apollo Client dep needed. Handles:
//   • Auth header injection from in-memory token store
//   • Silent access-token refresh via refresh token
//   • Network error vs GraphQL error normalisation
//   • AbortController for request cancellation

const API_URL = import.meta.env.VITE_API_URL || 'https://realestate-react-api.onrender.com/graphql';

// ── In-memory token store (access token NEVER in localStorage — XSS risk) ──
let _accessToken  = null;
let _refreshToken = null;   // stored in localStorage (opaque, hashed on server)
let _refreshing   = null;   // deduplicate concurrent refresh calls

export function setTokens(access, refresh) {
  _accessToken = access;
  if (refresh) {
    _refreshToken = refresh;
    localStorage.setItem('estatiq_rt', refresh);
  }
}

export function clearTokens() {
  _accessToken  = null;
  _refreshToken = null;
  localStorage.removeItem('estatiq_rt');
  localStorage.removeItem('estatiq_user');
  localStorage.removeItem('saved_ids');
}

export function loadRefreshToken() {
  _refreshToken = localStorage.getItem('estatiq_rt') || null;
  return _refreshToken;
}

export function getAccessToken() { return _accessToken; }

// ── Core fetch ────────────────────────────────────────────────────────────
async function gqlFetch(query, variables = {}, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (_accessToken) headers['Authorization'] = `Bearer ${_accessToken}`;

  let res;
  try {
    res = await fetch(API_URL, {
      method:  'POST',
      headers,
      body:    JSON.stringify({ query, variables }),
      signal:  options.signal,
    });
  } catch (networkErr) {
    const err = new Error('Network error — could not reach the server. Check your connection.');
    err.code = 'NETWORK_ERROR';
    throw err;
  }

  if (!res.ok && res.status !== 400) {
    // 400 is normal for GraphQL validation errors — let the body handle it
    const err = new Error(`Server returned HTTP ${res.status}`);
    err.code = 'HTTP_ERROR';
    err.status = res.status;
    throw err;
  }

  let json;
  try {
    json = await res.json();
  } catch {
    const err = new Error('Server returned an invalid response.');
    err.code = 'PARSE_ERROR';
    throw err;
  }

  if (json.errors?.length) {
    const first = json.errors[0];
    const code  = first.extensions?.code;

    // Silent token refresh on UNAUTHENTICATED, then retry exactly once
    if (code === 'UNAUTHENTICATED' && !options._retried && _refreshToken) {
      await silentRefresh();
      return gqlFetch(query, variables, { ...options, _retried: true });
    }

    const error = new Error(first.message || 'An error occurred.');
    error.code         = code;
    error.graphqlErrors = json.errors;
    throw error;
  }

  return json.data;
}

// ── Silent refresh ────────────────────────────────────────────────────────
// Note: the schema mutation is `refreshToken(refreshToken: String!)`
// so the variable name must be `refreshToken`, not `token`.
async function silentRefresh() {
  if (_refreshing) return _refreshing;
  _refreshing = (async () => {
    try {
      const data = await gqlFetch(
        `mutation RefreshToken($refreshToken: String!) {
           refreshToken(refreshToken: $refreshToken) {
             accessToken refreshToken
           }
         }`,
        { refreshToken: _refreshToken },
        { _retried: true }   // prevent infinite retry loop
      );
      setTokens(
        data.refreshToken.accessToken,
        data.refreshToken.refreshToken
      );
    } catch {
      clearTokens();   // refresh failed → force logout
    } finally {
      _refreshing = null;
    }
  })();
  return _refreshing;
}

// ── Restore session on app boot ───────────────────────────────────────────
// Uses only fields that exist on the User type in the schema.
export async function restoreSession() {
  const rt = loadRefreshToken();
  if (!rt) return null;
  try {
    await silentRefresh();
    if (!_accessToken) return null;
    const data = await gql(`
      query Me {
        me {
          id name email role phone city
          avatarUrl emailVerified phoneVerified isActive
          tenant { id name status }
        }
      }
    `);
    return data.me;
  } catch {
    clearTokens();
    return null;
  }
}

// ── Public API ─────────────────────────────────────────────────────────────
export const gql = gqlFetch;

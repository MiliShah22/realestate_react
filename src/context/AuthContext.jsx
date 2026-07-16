import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  gql, setTokens, clearTokens, loadRefreshToken, restoreSession, getAccessToken
} from '../lib/gqlClient.js';
import {
  LOGIN_MUTATION, SIGNUP_MUTATION, LOGOUT_MUTATION,
  CHANGE_PASSWORD_MUTATION, ME_QUERY
} from '../lib/queries.js';

const AuthContext = createContext(null);

// Demo account hints still shown on the login page (display only, not used for auth)
export const DEFAULT_ACCOUNTS = [
  {
    role: 'customer',
    email: 'customer@estatiq.in',
    password: 'Customer@123',
    name: 'Arjun Reddy',
    avatar: 'AR',
  },
  {
    role: 'franchise',
    email: 'franchise@estatiq.in',
    password: 'Franchise@123',
    name: 'Priya Sharma',
    avatar: 'PS',
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: try to restore session from stored refresh token
  useEffect(() => {
    (async () => {
      try {
        const me = await restoreSession();
        if (me) setUser(me);
      } catch {
        // No valid session — stay logged out
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password, role) => {
    const gqlRole = role === 'franchise' ? 'FRANCHISE_OWNER' : 'CUSTOMER';
    const data = await gql(LOGIN_MUTATION, { email, password, role: gqlRole });
    const { accessToken, refreshToken, user: me } = data.login;
    setTokens(accessToken, refreshToken);
    const normalized = normalizeUser(me);
    setUser(normalized);
    localStorage.setItem('estatiq_user', JSON.stringify(normalized));
    return normalized;
  }, []);

  // ── Signup ─────────────────────────────────────────────────────────────
  const signup = useCallback(async (formData, role) => {
    const input = {
      name:         formData.name,
      email:        formData.email,
      password:     formData.password,
      phone:        formData.phone,
      city:         formData.city,
      role:         role === 'franchise' ? 'FRANCHISE_OWNER' : 'CUSTOMER',
      businessName: formData.businessName || undefined,
      gstin:        formData.gstin        || undefined,
    };
    const data = await gql(SIGNUP_MUTATION, { input });
    const { accessToken, refreshToken, user: me } = data.signup;
    setTokens(accessToken, refreshToken);
    const normalized = normalizeUser(me);
    setUser(normalized);
    localStorage.setItem('estatiq_user', JSON.stringify(normalized));
    return normalized;
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const rt = loadRefreshToken();
    try {
      if (rt) await gql(LOGOUT_MUTATION, { refreshToken: rt });
    } catch { /* best-effort */ }
    setUser(null);
    clearTokens();
    localStorage.removeItem('estatiq_user');
  }, []);

  // ── Change password ────────────────────────────────────────────────────
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    const data = await gql(CHANGE_PASSWORD_MUTATION, { currentPassword, newPassword });
    return data.changePassword;
  }, []);

  // ── Refresh user profile from API ──────────────────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const data = await gql(ME_QUERY);
      const normalized = normalizeUser(data.me);
      setUser(normalized);
      localStorage.setItem('estatiq_user', JSON.stringify(normalized));
      return normalized;
    } catch { return null; }
  }, []);

  // Merge partial update into current user (optimistic, no extra API call)
  const updateUser = useCallback((patch) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...patch };
      localStorage.setItem('estatiq_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, changePassword, refreshUser, updateUser, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }

// ── Normalise API user → consistent shape for UI ──────────────────────────
function normalizeUser(me) {
  if (!me) return null;
  const isFranchise = me.role === 'FRANCHISE_OWNER' || me.role === 'FRANCHISE_STAFF';
  const role     = isFranchise ? 'franchise' : 'customer';
  const initials = me.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return {
    ...me,
    role,                          // 'customer' | 'franchise' (UI-friendly)
    apiRole: me.role,              // original enum: CUSTOMER | FRANCHISE_OWNER | ...
    // The API returns avatarUrl; our UI uses avatar everywhere
    avatar: me.avatarUrl || initials,
    // businessName / gstin live on the tenant, not the user
    businessName: me.tenant?.name || '',
    gstin: '',
  };
}

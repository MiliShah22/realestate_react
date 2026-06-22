import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// ── DEFAULT DEMO ACCOUNTS ──────────────────────────────────────────────────
export const DEFAULT_ACCOUNTS = [
  {
    id: 'default-customer-001',
    role: 'customer',
    name: 'Arjun Reddy',
    email: 'customer@estatiq.in',
    password: 'Customer@123',
    phone: '+91 98765 43210',
    city: 'Bengaluru',
    businessName: '',
    gstin: '',
    createdAt: '2024-01-15T09:00:00.000Z',
    isDefault: true,
    avatar: 'AR',
    savedProperties: [1, 3],
    enquiriesSent: 2,
  },
  {
    id: 'default-franchise-001',
    role: 'franchise',
    name: 'Priya Sharma',
    email: 'franchise@estatiq.in',
    password: 'Franchise@123',
    phone: '+91 91234 56789',
    city: 'Mumbai',
    businessName: 'Sharma Realty Pvt Ltd',
    gstin: '27AABCS1429B1ZB',
    createdAt: '2024-01-10T09:00:00.000Z',
    isDefault: true,
    avatar: 'PS',
    totalListings: 62,
    activeLeads: 18,
    dealsClosedMonth: 4,
    revenue: '₹8.4L',
  },
];

// ── SEED defaults into localStorage if not already present ─────────────────
function seedDefaultAccounts() {
  try {
    const existing = JSON.parse(localStorage.getItem('estatiq_users') || '[]');
    let changed = false;
    for (const acc of DEFAULT_ACCOUNTS) {
      if (!existing.find(u => u.email === acc.email)) {
        existing.push(acc);
        changed = true;
      }
    }
    if (changed) localStorage.setItem('estatiq_users', JSON.stringify(existing));
  } catch {}
}

// ── HELPERS ────────────────────────────────────────────────────────────────
export function getUsers() {
  try { return JSON.parse(localStorage.getItem('estatiq_users') || '[]'); } catch { return []; }
}
export function saveUsers(users) {
  localStorage.setItem('estatiq_users', JSON.stringify(users));
}
export function findUser(email) {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}
export function registerUser(userData) {
  const users = getUsers();
  if (findUser(userData.email)) return { error: 'Email already registered' };
  const newUser = { ...userData, id: Date.now(), createdAt: new Date().toISOString() };
  saveUsers([...users, newUser]);
  return { user: newUser };
}
export function updatePassword(email, newPassword) {
  const users = getUsers();
  const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) return false;
  users[idx].password = newPassword;
  saveUsers(users);
  return true;
}

// ── AUTH CONTEXT ───────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedDefaultAccounts();
    const stored = localStorage.getItem('estatiq_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  function login(userData) {
    setUser(userData);
    localStorage.setItem('estatiq_user', JSON.stringify(userData));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('estatiq_user');
  }

  function updateUser(data) {
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('estatiq_user', JSON.stringify(updated));
    // also update in users list
    const users = getUsers();
    const idx = users.findIndex(u => u.id === updated.id);
    if (idx !== -1) { users[idx] = updated; saveUsers(users); }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

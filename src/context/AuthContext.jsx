import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

// Mock user DB stored in localStorage
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

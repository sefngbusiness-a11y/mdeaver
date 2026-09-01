import { createContext, useContext, useState, useCallback } from 'react';

const AdminAuthContext = createContext(null);

// ── Config ────────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'mdeaver_admin_session';
const PASSWORD_KEY = 'mdeaver_admin_password';

// Default admin password (hashed check handled client-side for simplicity).
// First-time password is "Admin@2024" — admin must change it from Settings.
const DEFAULT_PASSWORD = 'Admin@2024';

const ALLOWED_EMAILS = [
  'sefngbusiness@gmail.com',
  'admin@mdeavercharity.org',
];

function getStoredPassword() {
  return localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
}

// ── Provider ──────────────────────────────────────────────────────────────────
export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // Simulate network

    const emailLower = email.trim().toLowerCase();
    const storedPassword = getStoredPassword();

    if (!ALLOWED_EMAILS.includes(emailLower)) {
      setLoading(false);
      return { success: false, error: 'No admin account found for this email.' };
    }

    if (password !== storedPassword) {
      setLoading(false);
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const sessionData = {
      email: emailLower,
      fullName: 'Mdeaver Administrator',
      role: 'super_admin',
      loggedInAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    setAdminUser(sessionData);
    setLoading(false);
    return { success: true };
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAdminUser(null);
  }, []);

  // ── Change Password ────────────────────────────────────────────────────────
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    const storedPassword = getStoredPassword();

    if (currentPassword !== storedPassword) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    if (newPassword.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters.' };
    }

    localStorage.setItem(PASSWORD_KEY, newPassword);
    return { success: true };
  }, []);

  // ── Reset Password (Forgot) ────────────────────────────────────────────────
  // In a real app this would send an email; here we simply reset to default
  // and return a token message so we can display it in the UI.
  const requestPasswordReset = useCallback(async (email) => {
    const emailLower = email.trim().toLowerCase();
    if (!ALLOWED_EMAILS.includes(emailLower)) {
      return { success: false, error: 'No admin account found for this email.' };
    }

    // Reset password back to default
    localStorage.setItem(PASSWORD_KEY, DEFAULT_PASSWORD);
    return {
      success: true,
      message: `Password has been reset to the default: "${DEFAULT_PASSWORD}". Please log in and change it immediately.`,
    };
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        login,
        logout,
        changePassword,
        requestPasswordReset,
        loading,
        isAuthenticated: !!adminUser,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return context;
};

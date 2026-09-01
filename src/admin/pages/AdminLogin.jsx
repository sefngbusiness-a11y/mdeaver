import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

/* ── Shared Input Style ─────────────────────────────────────────── */
const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '12px',
  background: '#f8fafc',
  border: '1px solid #cbd5e1',
  color: '#0f172a',
  fontSize: '15px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease',
};

/* ── AlertBox ───────────────────────────────────────────────────── */
function AlertBox({ type = 'error', children }) {
  const colors = {
    error: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: '#b91c1c', icon: 'fa-triangle-exclamation' },
    success: { bg: 'rgba(35,147,58,0.1)', border: 'rgba(22,163,74,0.3)', text: '#15803d', icon: 'fa-circle-check' },
    info: { bg: 'rgba(59,130,246,0.1)', border: 'rgba(37,99,235,0.3)', text: '#1d4ed8', icon: 'fa-circle-info' },
  }[type];

  return (
    <div
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        padding: '12px 14px',
        borderRadius: '10px',
        fontSize: '13px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
      }}
    >
      <i className={`fa-solid ${colors.icon}`} style={{ marginTop: '1px', flexShrink: 0 }} />
      <span>{children}</span>
    </div>
  );
}

/* ── Login Form ─────────────────────────────────────────────────── */
function LoginForm({ onForgot }) {
  const [email, setEmail] = useState('sefngbusiness@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      navigate('/admin');
    } else {
      setError(res.error);
    }
  };

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <img
          src="/image-nav.png"
          alt="Mdeaver Charity Logo"
          style={{
            height: '60px',
            objectFit: 'contain',
            margin: '0 auto 16px',
            display: 'block',
            filter: 'drop-shadow(0 4px 12px rgba(35,147,58,0.25))',
          }}
        />
        <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px', color: '#0f172a' }}>
          Admin Control Center
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
          Mdeaver Charity Foundation Portal
        </p>
      </div>

      {error && <AlertBox type="error">{error}</AlertBox>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '0.6px', marginBottom: '8px' }}>
            ADMINISTRATOR EMAIL
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="sefngbusiness@gmail.com"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = '#16a34a')}
            onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '0.6px', marginBottom: '8px' }}>
            PASSWORD
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{ ...inputStyle, paddingRight: '46px' }}
              onFocus={(e) => (e.target.style.borderColor = '#16a34a')}
              onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '4px',
              }}
            >
              <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-8px' }}>
          <button
            type="button"
            onClick={onForgot}
            style={{ background: 'none', border: 'none', color: '#16a34a', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '15px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #23933a, #16a34a)',
            color: '#fff',
            fontWeight: 800,
            fontSize: '14px',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 16px rgba(35,147,58,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            opacity: loading ? 0.7 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {loading ? (
            <><i className="fa-solid fa-spinner fa-spin" /> Authenticating…</>
          ) : (
            <><span>ACCESS ADMIN PORTAL</span><i className="fa-solid fa-arrow-right" /></>
          )}
        </button>
      </form>
    </>
  );
}

/* ── Forgot Password Form ───────────────────────────────────────── */
function ForgotPasswordForm({ onBack }) {
  const [email, setEmail] = useState('sefngbusiness@gmail.com');
  const [status, setStatus] = useState(null); // { type, message }
  const [loading, setLoading] = useState(false);
  const { requestPasswordReset } = useAdminAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const res = await requestPasswordReset(email);
    setLoading(false);
    if (res.success) {
      setStatus({ type: 'success', message: res.message });
    } else {
      setStatus({ type: 'error', message: res.error });
    }
  };

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(35,147,58,0.1)',
            border: '1px solid rgba(22,163,74,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '22px',
            color: '#16a34a',
          }}
        >
          <i className="fa-solid fa-key" />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Reset Password</h2>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Enter your admin email to reset the password.
        </p>
      </div>

      {status && <AlertBox type={status.type}>{status.message}</AlertBox>}

      {!status?.type || status.type !== 'success' ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '0.6px', marginBottom: '8px' }}>
              ADMINISTRATOR EMAIL
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#16a34a')}
              onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '15px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #23933a, #16a34a)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '14px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-rotate" />}
            <span>{loading ? 'Resetting…' : 'Reset Password'}</span>
          </button>
        </form>
      ) : null}

      <button
        onClick={onBack}
        style={{
          width: '100%',
          marginTop: '16px',
          padding: '12px',
          borderRadius: '12px',
          background: 'transparent',
          border: '1px solid #cbd5e1',
          color: '#64748b',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <i className="fa-solid fa-arrow-left" />
        <span>Back to Login</span>
      </button>
    </>
  );
}

/* ── Page Shell ─────────────────────────────────────────────────── */
export default function AdminLogin() {
  const [view, setView] = useState('login'); // 'login' | 'forgot'

  /* Cancel the 142px body padding-top that Navbar.css sets globally */
  useEffect(() => {
    const prev = document.body.style.paddingTop;
    document.body.style.paddingTop = '0px';
    return () => {
      document.body.style.paddingTop = prev;
    };
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f6f9f7',
        backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(35,147,58,0.08) 0%, transparent 70%)',
        color: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '24px',
          padding: '36px 28px',
          boxShadow: '0 20px 45px rgba(0,0,0,0.06)',
        }}
      >
        {view === 'login' ? (
          <LoginForm onForgot={() => setView('forgot')} />
        ) : (
          <ForgotPasswordForm onBack={() => setView('login')} />
        )}
      </div>
    </div>
  );
}

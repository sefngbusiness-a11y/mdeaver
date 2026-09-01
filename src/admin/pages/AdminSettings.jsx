import { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';

/* ── Shared Input Style ─────────────────────────────────────────── */
const inputStyle = {
  width: '100%',
  padding: '13px 16px',
  borderRadius: '12px',
  background: '#f8fafc',
  border: '1px solid #cbd5e1',
  color: '#0f172a',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease',
};

function SectionCard({ icon, title, children }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'rgba(35,147,58,0.1)',
            border: '1px solid rgba(22,163,74,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#16a34a',
            fontSize: '15px',
            flexShrink: 0,
          }}
        >
          <i className={`fa-solid ${icon}`} />
        </div>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function FieldGroup({ label, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '0.6px', marginBottom: '8px' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function StatusBanner({ type, message, onClear }) {
  if (!message) return null;
  const colors = {
    success: { bg: 'rgba(35,147,58,0.1)', border: 'rgba(22,163,74,0.3)', text: '#15803d', icon: 'fa-circle-check' },
    error: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: '#b91c1c', icon: 'fa-triangle-exclamation' },
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
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <i className={`fa-solid ${colors.icon}`} />
        <span>{message}</span>
      </div>
      <button
        onClick={onClear}
        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.7, padding: '2px 4px' }}
      >
        <i className="fa-solid fa-xmark" />
      </button>
    </div>
  );
}

export default function AdminSettings() {
  const { adminUser, changePassword } = useAdminAuth();

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwStatus, setPwStatus] = useState(null);
  const [pwLoading, setPwLoading] = useState(false);

  const passwordStrength = (pw) => {
    if (!pw) return null;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: 'Weak', color: '#dc2626', width: '25%' };
    if (score === 2) return { label: 'Fair', color: '#d97706', width: '50%' };
    if (score === 3) return { label: 'Good', color: '#16a34a', width: '75%' };
    return { label: 'Strong', color: '#059669', width: '100%' };
  };

  const pwStrength = passwordStrength(newPw);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwStatus(null);

    if (newPw !== confirmPw) {
      setPwStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }
    if (newPw.length < 8) {
      setPwStatus({ type: 'error', message: 'Password must be at least 8 characters.' });
      return;
    }

    setPwLoading(true);
    const res = await changePassword(currentPw, newPw);
    setPwLoading(false);

    if (res.success) {
      setPwStatus({ type: 'success', message: 'Password changed successfully! Your new password is now active.' });
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } else {
      setPwStatus({ type: 'error', message: res.error });
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '4px' }}>
          Settings
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b' }}>
          Manage your admin account security and preferences.
        </p>
      </div>

      {/* ── Account Info Card ───────────────────────────────── */}
      <SectionCard icon="fa-user-shield" title="Account Information">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px',
            background: '#f8fafc',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #23933a, #16a34a)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 800,
              color: '#fff',
              flexShrink: 0,
              boxShadow: '0 4px 10px rgba(35, 147, 58, 0.25)',
            }}
          >
            {(adminUser?.email?.[0] || 'A').toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{adminUser?.fullName}</div>
            <div style={{ fontSize: '13px', color: '#64748b', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{adminUser?.email}</div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                marginTop: '6px',
                fontSize: '10px',
                fontWeight: 800,
                background: 'rgba(35,147,58,0.1)',
                color: '#16a34a',
                border: '1px solid rgba(22,163,74,0.25)',
                padding: '2px 10px',
                borderRadius: '20px',
                textTransform: 'uppercase',
              }}
            >
              <i className="fa-solid fa-shield-halved" style={{ fontSize: '9px' }} />
              {adminUser?.role?.replace('_', ' ')}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', minWidth: 0 }}>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Role
            </div>
            <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: 600 }}>Super Administrator</div>
          </div>
          <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', minWidth: 0 }}>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Last Login
            </div>
            <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: 600, wordBreak: 'break-word' }}>
              {adminUser?.loggedInAt ? new Date(adminUser.loggedInAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Change Password Card ────────────────────────────── */}
      <SectionCard icon="fa-lock" title="Change Password">
        <StatusBanner type={pwStatus?.type} message={pwStatus?.message} onClear={() => setPwStatus(null)} />

        <form onSubmit={handleChangePassword}>
          <FieldGroup label="CURRENT PASSWORD">
            <div style={{ position: 'relative' }}>
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="Enter current password"
                style={{ ...inputStyle, paddingRight: '46px' }}
                onFocus={(e) => (e.target.style.borderColor = '#16a34a')}
                onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((p) => !p)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px' }}
              >
                <i className={`fa-solid ${showCurrent ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
          </FieldGroup>

          <FieldGroup label="NEW PASSWORD">
            <div style={{ position: 'relative' }}>
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Minimum 8 characters"
                style={{ ...inputStyle, paddingRight: '46px' }}
                onFocus={(e) => (e.target.style.borderColor = '#16a34a')}
                onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
              />
              <button
                type="button"
                onClick={() => setShowNew((p) => !p)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px' }}
              >
                <i className={`fa-solid ${showNew ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
            {pwStrength && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: pwStrength.width,
                      background: pwStrength.color,
                      borderRadius: '4px',
                      transition: 'width 0.3s ease, background 0.3s ease',
                    }}
                  />
                </div>
                <div style={{ fontSize: '11px', color: pwStrength.color, marginTop: '4px', fontWeight: 600 }}>
                  {pwStrength.label} password
                </div>
              </div>
            )}
          </FieldGroup>

          <FieldGroup label="CONFIRM NEW PASSWORD">
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Repeat new password"
                style={{
                  ...inputStyle,
                  paddingRight: '46px',
                  borderColor: confirmPw && newPw && confirmPw !== newPw ? '#dc2626' : undefined,
                }}
                onFocus={(e) => (e.target.style.borderColor = '#16a34a')}
                onBlur={(e) => (e.target.style.borderColor = confirmPw && newPw && confirmPw !== newPw ? '#dc2626' : '#cbd5e1')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px' }}
              >
                <i className={`fa-solid ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
            {confirmPw && newPw && confirmPw !== newPw && (
              <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '6px' }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '5px' }} />
                Passwords do not match
              </div>
            )}
          </FieldGroup>

          {/* Password Requirements */}
          <div
            style={{
              padding: '12px 14px',
              background: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              marginBottom: '20px',
            }}
          >
            <div style={{ fontSize: '11px', color: '#475569', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Requirements
            </div>
            {[
              { test: newPw.length >= 8, label: 'At least 8 characters' },
              { test: /[A-Z]/.test(newPw), label: 'One uppercase letter' },
              { test: /[0-9]/.test(newPw), label: 'One number' },
              { test: /[^A-Za-z0-9]/.test(newPw), label: 'One special character' },
            ].map(({ test, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: test ? '#16a34a' : '#64748b', marginBottom: '4px' }}>
                <i className={`fa-solid ${test ? 'fa-circle-check' : 'fa-circle'}`} style={{ fontSize: '10px' }} />
                {label}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={pwLoading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #23933a, #16a34a)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '14px',
              border: 'none',
              cursor: pwLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              opacity: pwLoading ? 0.7 : 1,
              boxShadow: '0 4px 14px rgba(35,147,58,0.25)',
              transition: 'opacity 0.2s ease',
            }}
          >
            {pwLoading ? (
              <><i className="fa-solid fa-spinner fa-spin" /> Updating Password…</>
            ) : (
              <><i className="fa-solid fa-lock" /> Update Password</>
            )}
          </button>
        </form>
      </SectionCard>

      {/* ── Security Tips Card ──────────────────────────────── */}
      <SectionCard icon="fa-shield-halved" title="Security Tips">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { icon: 'fa-rotate', text: 'Change your password every 90 days.' },
            { icon: 'fa-eye-slash', text: 'Never share your credentials with anyone.' },
            { icon: 'fa-laptop', text: 'Always log out when on a shared device.' },
            { icon: 'fa-key', text: 'Use a unique password not used elsewhere.' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: '#64748b' }}>
              <i className={`fa-solid ${icon}`} style={{ color: '#16a34a', marginTop: '2px', fontSize: '12px', flexShrink: 0 }} />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

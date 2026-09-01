export default function AdminAuditLogs() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px', color: '#0f172a' }}>Security Audit Trail</h1>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
          Immutably logged administrative actions, access events, and system security logs.
        </p>
      </div>

      <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
        {[
          { action: 'ADMIN_AUTHENTICATE', user: 'sefngbusiness@gmail.com', details: 'Session token issued', time: 'Today at 13:58' },
          { action: 'EXPORT_DONATION_CSV', user: 'sefngbusiness@gmail.com', details: 'Donation ledger exported', time: 'Today at 13:45' },
          { action: 'SYSTEM_EMAIL_DISPATCH', user: 'system', details: 'Resend API Visit notification delivered', time: 'Today at 13:36' },
        ].map((log, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--admin-emerald-bright)' }}>{log.action}</span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>{log.time}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#1e293b' }}>{log.details}</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>User: {log.user}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { fetchContacts } from '../../services/api';

export default function AdminContacts() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchContacts(50);
      if (Array.isArray(data)) {
        setMessages(data);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px', color: '#0f172a' }}>Inquiry Inbox Desk</h1>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
          Review contact requests, assistance applications, and partner inquiries.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
          <p style={{ marginTop: '10px', fontSize: '14px' }}>Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          No contact messages received yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map((item, index) => (
            <div
              key={index}
              className="admin-card"
              onClick={() => setSelectedMsg(item)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '16px',
                cursor: 'pointer',
                borderLeft: '4px solid var(--admin-emerald)',
                background: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{item.name}</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--admin-gold)', fontWeight: 600 }}>
                {item.subject || 'General Inquiry'}
              </div>

              <p
                style={{
                  fontSize: '13px',
                  color: '#334155',
                  margin: 0,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {item.message}
              </p>

              <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', gap: '14px', marginTop: '4px' }}>
                <span><i className="fa-solid fa-envelope"></i> {item.email}</span>
                {item.phone && <span><i className="fa-solid fa-phone"></i> {item.phone}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Modal / Drawer */}
      {selectedMsg && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(8px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={() => setSelectedMsg(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              background: '#ffffff',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '24px',
              maxHeight: '85vh',
              overflowY: 'auto',
              border: '1px solid #e2e8f0',
              boxShadow: '0 -10px 30px rgba(0,0,0,0.15)',
              color: '#0f172a',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Inquiry Details</h3>
              <button
                onClick={() => setSelectedMsg(null)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '18px', cursor: 'pointer' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#334155' }}>
              <div><strong style={{ color: '#0f172a' }}>From:</strong> {selectedMsg.name} ({selectedMsg.email})</div>
              {selectedMsg.phone && <div><strong style={{ color: '#0f172a' }}>Phone:</strong> {selectedMsg.phone}</div>}
              <div><strong style={{ color: '#0f172a' }}>Subject:</strong> {selectedMsg.subject || 'General Inquiry'}</div>

              <div
                style={{
                  background: '#f8fafc',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  lineHeight: '1.6',
                  color: '#1e293b',
                  marginTop: '8px',
                }}
              >
                {selectedMsg.message}
              </div>

              <a
                href={`mailto:${selectedMsg.email}?subject=Re: ${encodeURIComponent(selectedMsg.subject || 'Mdeaver Charity Inquiry')}`}
                style={{
                  marginTop: '16px',
                  textAlign: 'center',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px',
                  borderRadius: '10px',
                  background: '#23933a',
                  color: '#ffffff',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(35, 147, 58, 0.25)',
                }}
              >
                <i className="fa-solid fa-reply" style={{ marginRight: '8px' }}></i>
                REPLY TO {selectedMsg.email}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

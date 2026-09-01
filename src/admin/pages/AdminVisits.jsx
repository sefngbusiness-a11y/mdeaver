import { useEffect, useState } from 'react';
import { fetchVisits } from '../../services/api';

export default function AdminVisits() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchVisits(50);
      if (Array.isArray(data)) {
        setVisits(data);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px', color: '#0f172a' }}>Live Visitor Traffic</h1>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
          Real-time stream of site visitors, geolocation hits, and page ping telemetry.
        </p>
      </div>

      <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--admin-emerald-bright)' }}>
            <i className="fa-solid fa-signal" style={{ marginRight: '8px' }}></i> LIVE RADAR ACTIVE
          </span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Auto-updating</span>
        </div>

        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
            <i className="fa-solid fa-spinner fa-spin"></i> Loading visitor logs...
          </div>
        ) : visits.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
            No visit logs recorded yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {visits.map((v, i) => (
              <div
                key={v.id || i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{v.page_url || v.url || '/'}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    IP: {v.ip_address || v.ip || 'Unknown'} • {v.user_agent ? (v.user_agent.length > 50 ? v.user_agent.slice(0, 50) + '...' : v.user_agent) : 'Browser'}
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--admin-gold)', fontWeight: 600 }}>
                  {v.created_at ? new Date(v.created_at).toLocaleString() : 'Recent'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

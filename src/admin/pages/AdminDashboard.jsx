import { useEffect, useState } from 'react';
import { fetchStats, fetchDonations, fetchContacts } from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalAmount: 0, donationCount: 0, contactCount: 0, visitCount: 0 });
  const [recentDonations, setRecentDonations] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      const [statsRes, donationsRes, contactsRes] = await Promise.all([
        fetchStats(),
        fetchDonations(5),
        fetchContacts(5),
      ]);

      // API returns { success, stats: { totalDonationsAmount, totalDonors, totalContacts, totalVisits } }
      const raw = statsRes?.stats || statsRes || {};
      setStats({
        totalAmount: raw.totalDonationsAmount ?? raw.totalAmount ?? 0,
        donationCount: raw.totalDonors ?? raw.donationCount ?? 0,
        contactCount: raw.totalContacts ?? raw.contactCount ?? 0,
        visitCount: raw.totalVisits ?? raw.visitCount ?? 0,
      });
      if (Array.isArray(donationsRes)) {
        setRecentDonations(donationsRes);
      }
      if (Array.isArray(contactsRes)) {
        setRecentContacts(contactsRes);
      }
      setLoading(false);
    };

    loadDashboardData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner / Welcome */}
      <div
        className="admin-card"
        style={{
          background: 'linear-gradient(135deg, rgba(20, 90, 37, 0.88) 0%, rgba(10, 38, 17, 0.94) 100%), url("/assets/children-community.jpg") center/cover no-repeat',
          border: 'none',
          padding: '24px',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 8px 24px rgba(20, 90, 37, 0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#fef08a', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            EXECUTIVE DASHBOARD
          </span>
          <span style={{ fontSize: '12px', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }}></span>
            Realtime Sync
          </span>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px', color: '#ffffff' }}>
          Overview & Live Metrics
        </h1>
        <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0, maxWidth: '600px' }}>
          Real-time summary of donor contributions, community message inquiries, and website engagement traffic.
        </p>
      </div>

      {/* Metric Cards Grid (Mobile 2x2, Desktop 4x1) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Card 1: Total Donated */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>TOTAL RAISED</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(22, 163, 74, 0.1)', color: 'var(--admin-emerald-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-dollar-sign"></i>
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--admin-text-main)' }}>
            ${Number(stats.totalAmount || 0).toLocaleString()}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--admin-emerald-bright)', fontWeight: 600 }}>
            <i className="fa-solid fa-arrow-trend-up"></i> +14% this month
          </span>
        </div>

        {/* Card 2: Total Donors */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>DONATIONS</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(217, 119, 6, 0.1)', color: 'var(--admin-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-heart"></i>
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--admin-text-main)' }}>
            {stats.donationCount || 0}
          </div>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
            Completed transactions
          </span>
        </div>

        {/* Card 3: Inquiries */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>INQUIRIES</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-envelope"></i>
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--admin-text-main)' }}>
            {stats.contactCount || 0}
          </div>
          <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>
            Messages received
          </span>
        </div>

        {/* Card 4: Site Visitors */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>VISITORS</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(147, 51, 234, 0.1)', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-eye"></i>
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--admin-text-main)' }}>
            {stats.visitCount || 0}
          </div>
          <span style={{ fontSize: '11px', color: '#9333ea', fontWeight: 600 }}>
            Tracked site visits
          </span>
        </div>
      </div>

      {/* Recent Activity Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Recent Donations List */}
        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Recent Contributions</h3>
            <span style={{ fontSize: '12px', color: 'var(--admin-emerald-bright)', fontWeight: 600 }}>View All</span>
          </div>

          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
              <i className="fa-solid fa-spinner fa-spin"></i> Loading latest donations...
            </div>
          ) : recentDonations.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              No recent donations recorded.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentDonations.slice(0, 5).map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{item.donor_name || item.donorName || 'Anonymous'}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{item.email}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--admin-emerald-bright)' }}>
                      +${item.amount}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>{item.payment_method || 'Card'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Inquiries List */}
        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Recent Contact Messages</h3>
            <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600 }}>View Inbox</span>
          </div>

          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
              <i className="fa-solid fa-spinner fa-spin"></i> Loading messages...
            </div>
          ) : recentContacts.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              No messages received yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentContacts.slice(0, 5).map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{msg.name}</span>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>{msg.email}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {msg.subject || msg.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

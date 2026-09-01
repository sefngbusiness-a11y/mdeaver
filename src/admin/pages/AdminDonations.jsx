import { useEffect, useState } from 'react';
import { fetchDonations, approveDonation } from '../../services/api';
import AdminChatModal from '../components/AdminChatModal';

export default function AdminDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [approvingId, setApprovingId] = useState(null);
  const [selectedChatDonation, setSelectedChatDonation] = useState(null);

  const loadDonations = async () => {
    setLoading(true);
    const data = await fetchDonations(50);
    if (Array.isArray(data)) {
      setDonations(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDonations();
  }, []);

  const handleApprove = async (donationId) => {
    setApprovingId(donationId);
    const res = await approveDonation(donationId);
    setApprovingId(null);
    if (res.success) {
      setDonations((prev) =>
        prev.map((d) => (d.id === donationId ? { ...d, status: 'approved' } : d))
      );
    }
  };

  const exportCSV = () => {
    if (!donations.length) return;
    const headers = ['Invoice Number', 'Donor Name', 'Email', 'Amount', 'Payment Method', 'Status', 'Date'];
    const rows = donations.map((d) => [
      d.invoice_number || d.invoiceNumber || 'N/A',
      `"${d.donor_name || d.donorName || 'Anonymous'}"`,
      d.email || '',
      d.amount || 0,
      d.payment_method || d.paymentMethod || 'Card',
      d.status || 'pending_approval',
      d.created_at || d.timestamp || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Mdeaver_Donations_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = donations.filter((d) => {
    const name = (d.donor_name || d.donorName || '').toLowerCase();
    const email = (d.email || '').toLowerCase();
    const inv = (d.invoice_number || d.invoiceNumber || '').toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || email.includes(q) || inv.includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px', color: '#0f172a' }}>Donation Ledger</h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
            Review pending submissions, approve donations, and open live chats with donors.
          </p>
        </div>

        <button
          onClick={exportCSV}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            background: 'var(--admin-emerald)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '13px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(35, 147, 58, 0.25)',
          }}
        >
          <i className="fa-solid fa-file-csv"></i>
          <span>EXPORT CSV</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="admin-card" style={{ padding: '12px 16px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ color: '#64748b' }}></i>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by donor name, email, or invoice #..."
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: '#0f172a',
              outline: 'none',
              fontSize: '14px',
            }}
          />
        </div>
      </div>

      {/* Touch Data Cards List */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
          <p style={{ marginTop: '10px', fontSize: '14px' }}>Loading donation records...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          No donations found matching your search.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((item, index) => {
            const isPending = !item.status || item.status === 'pending_approval';

            return (
              <div
                key={item.id || index}
                className="admin-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  padding: '16px',
                  background: '#ffffff',
                  border: isPending ? '1px solid rgba(217, 119, 6, 0.35)' : '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: 'var(--admin-gold)',
                        background: 'rgba(217, 119, 6, 0.1)',
                        border: '1px solid rgba(217, 119, 6, 0.25)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {item.invoice_number || item.invoiceNumber || 'MDF-RECEIPT'}
                    </span>

                    {/* Status Badge */}
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: isPending ? 'rgba(217, 119, 6, 0.12)' : 'rgba(22, 163, 74, 0.12)',
                        color: isPending ? '#d97706' : '#16a34a',
                        border: isPending ? '1px solid rgba(217, 119, 6, 0.3)' : '1px solid rgba(22, 163, 74, 0.3)',
                      }}
                    >
                      {isPending ? 'Pending Approval' : 'Approved'}
                    </span>
                  </div>

                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--admin-emerald-bright)' }}>
                    +${item.amount}
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{item.donor_name || item.donorName || 'Anonymous Donor'}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{item.email}</div>
                </div>

                {/* Actions Row: Approve & Live Chat buttons */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    paddingTop: '10px',
                    borderTop: '1px solid #e2e8f0',
                    fontSize: '11px',
                    color: '#64748b',
                  }}
                >
                  <span>
                    <i className="fa-solid fa-credit-card" style={{ marginRight: '6px' }}></i>
                    {item.payment_method || item.paymentMethod || 'Credit / Debit Card'}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {isPending ? (
                      <button
                        onClick={() => handleApprove(item.id)}
                        disabled={approvingId === item.id}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #23933a, #16a34a)',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '12px',
                          border: 'none',
                          cursor: approvingId === item.id ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {approvingId === item.id ? (
                          <i className="fa-solid fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fa-solid fa-circle-check"></i>
                        )}
                        <span>{approvingId === item.id ? 'Approving…' : 'Approve & Send Chat Link'}</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setSelectedChatDonation(item)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            background: 'rgba(37, 99, 235, 0.1)',
                            border: '1px solid rgba(37, 99, 235, 0.25)',
                            color: '#2563eb',
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <i className="fa-solid fa-comments"></i>
                          <span>Open Live Chat</span>
                        </button>

                        <button
                          onClick={() => handleApprove(item.id)}
                          disabled={approvingId === item.id}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            color: '#475569',
                            fontWeight: 600,
                            fontSize: '11px',
                            cursor: approvingId === item.id ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          title="Re-send approval notification email with chat link to donor"
                        >
                          {approvingId === item.id ? (
                            <i className="fa-solid fa-spinner fa-spin"></i>
                          ) : (
                            <i className="fa-solid fa-paper-plane"></i>
                          )}
                          <span>{approvingId === item.id ? 'Sending…' : 'Resend Email'}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Live Chat Modal */}
      {selectedChatDonation && (
        <AdminChatModal
          donation={selectedChatDonation}
          onClose={() => setSelectedChatDonation(null)}
        />
      )}
    </div>
  );
}

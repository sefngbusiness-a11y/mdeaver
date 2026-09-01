import { useState, useEffect } from 'react';
import { fetchChatData, postChatMessage } from '../../services/api';

export default function AdminChatModal({ donation, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const donationId = donation?.id;

  useEffect(() => {
    if (!donationId) return;

    const loadChat = async () => {
      const res = await fetchChatData(donationId);
      if (Array.isArray(res?.messages)) {
        setMessages(res.messages);
      }
      setLoading(false);
    };

    loadChat();

    // Auto-poll messages every 4 seconds for live experience
    const interval = setInterval(loadChat, 4000);
    return () => clearInterval(interval);
  }, [donationId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    const res = await postChatMessage(donationId, {
      invoiceNumber: donation.invoice_number || donation.invoiceNumber || 'MDF-DONATION',
      senderType: 'admin',
      senderName: 'Mdeaver Admin Team',
      message: text,
    });

    if (res?.success && res?.data) {
      setMessages((prev) => [...prev, res.data]);
    }

    setSending(false);
  };

  if (!donation) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(8px)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          height: '600px',
          maxHeight: '90vh',
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Chat Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #1e7e34, #145a25)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800 }}>
              Live Chat — {donation.donor_name || donation.donorName || 'Donor'}
            </div>
            <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>
              Invoice #{donation.invoice_number || donation.invoiceNumber} • ${donation.amount}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Chat Messages Body */}
        <div
          style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', color: '#64748b', marginTop: '40px' }}>
              <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
              <p style={{ marginTop: '8px', fontSize: '13px' }}>Loading conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', marginTop: '40px', fontSize: '13px' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>💬</div>
              No chat messages sent yet. Type a message below to start communicating with {donation.donor_name || 'the donor'}.
            </div>
          ) : (
            messages.map((msg) => {
              const isAdmin = msg.sender_type === 'admin';
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isAdmin ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#64748b',
                      marginBottom: '3px',
                      fontWeight: 600,
                    }}
                  >
                    {msg.sender_name} • {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                  </div>
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '12px 16px',
                      borderRadius: '16px',
                      borderBottomRightRadius: isAdmin ? '4px' : '16px',
                      borderBottomLeftRadius: isAdmin ? '16px' : '4px',
                      background: isAdmin ? 'linear-gradient(135deg, #23933a, #16a34a)' : '#ffffff',
                      color: isAdmin ? '#ffffff' : '#0f172a',
                      border: isAdmin ? 'none' : '1px solid #e2e8f0',
                      fontSize: '14px',
                      lineHeight: 1.5,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    }}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={handleSend}
          style={{
            padding: '14px 16px',
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            gap: '10px',
          }}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${donation.donor_name || 'donor'}...`}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              outline: 'none',
              fontSize: '14px',
              background: '#f8fafc',
            }}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            style={{
              padding: '0 20px',
              borderRadius: '12px',
              background: '#23933a',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              cursor: !inputText.trim() || sending ? 'not-allowed' : 'pointer',
              opacity: !inputText.trim() || sending ? 0.6 : 1,
            }}
          >
            {sending ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
          </button>
        </form>
      </div>
    </div>
  );
}

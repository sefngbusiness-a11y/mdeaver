import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchChatData, postChatMessage } from '../services/api';
import './LiveChat.css';

export default function LiveChat() {
  const [searchParams] = useSearchParams();
  const donationId = searchParams.get('id') || searchParams.get('donationId');

  const [donation, setDonation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  /* Cancel the 142px body padding-top that Navbar.css sets globally */
  useEffect(() => {
    const prev = document.body.style.paddingTop;
    document.body.style.paddingTop = '0px';
    return () => {
      document.body.style.paddingTop = prev;
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async () => {
    if (!donationId) return;
    const res = await fetchChatData(donationId);
    if (res?.donation) setDonation(res.donation);
    if (Array.isArray(res?.messages)) setMessages(res.messages);
    setLoading(false);
  };

  useEffect(() => {
    loadConversation();

    // Auto-poll messages every 3.5 seconds
    const interval = setInterval(loadConversation, 3500);
    return () => clearInterval(interval);
  }, [donationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending || !donationId) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    const res = await postChatMessage(donationId, {
      invoiceNumber: donation?.invoice_number || donation?.invoiceNumber || 'DONATION',
      senderType: 'user',
      senderName: donation?.donor_name || donation?.donorName || 'Donor',
      message: text,
    });

    if (res?.success && res?.data) {
      setMessages((prev) => [...prev, res.data]);
    }

    setSending(false);
  };

  if (!donationId) {
    return (
      <div className="live-chat-shell">
        <div className="live-chat-card empty-card">
          <h2>No Donation Identifier Provided</h2>
          <p>Please use the direct link provided in your approval email to open your live chat session.</p>
          <Link to="/" className="chat-btn bg-green">Return to Homepage</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="live-chat-shell">
      <div className="live-chat-container">
        {/* Header Bar */}
        <div className="chat-header">
          <div className="chat-header-brand">
            <img src="/image-nav.png" alt="Mdeaver Foundation Logo" className="chat-logo" />
            <div>
              <h1 className="chat-title">Mdeaver Foundation Chat</h1>
              <div className="chat-subtitle">
                {donation ? `${donation.donor_name || 'Donor'} • Invoice #${donation.invoice_number || donation.invoiceNumber}` : 'Connecting...'}
              </div>
            </div>
          </div>
          <Link to="/" className="chat-close-btn" title="Back to Home">
            <i className="fa-solid fa-house"></i>
          </Link>
        </div>

        {/* Donation Summary Strip */}
        {donation && (
          <div className="chat-summary-strip">
            <span>
              <i className="fa-solid fa-circle-check" style={{ color: '#16a34a', marginRight: '6px' }}></i>
              Approved Donation: <strong>${donation.amount}</strong>
            </span>
            <span className="chat-status-pill">Active Live Support</span>
          </div>
        )}

        {/* Message Stream */}
        <div className="chat-messages-area">
          {loading ? (
            <div className="chat-loading">
              <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
              <p>Connecting to secure chat server...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-empty">
              <div className="chat-welcome-icon">💬</div>
              <h3>Welcome to Mdeaver Foundation Support</h3>
              <p>
                Your donation has been approved! Type a message below to communicate directly with our foundation team.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.sender_type === 'user';
              return (
                <div key={msg.id} className={`chat-bubble-wrapper ${isUser ? 'user' : 'admin'}`}>
                  <div className="chat-sender-name">
                    {msg.sender_name} • {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                  </div>
                  <div className={`chat-bubble ${isUser ? 'user-bubble' : 'admin-bubble'}`}>
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Controls */}
        <form onSubmit={handleSend} className="chat-input-bar">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message here..."
            className="chat-text-input"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="chat-send-btn"
          >
            {sending ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
          </button>
        </form>
      </div>
    </div>
  );
}

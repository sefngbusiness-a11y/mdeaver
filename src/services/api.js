// Robustly format API_BASE URL, defaulting to relative /api route
const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  // If VITE_API_URL is missing, or is pointing to stale mdeaver-api.vercel.app, or on localhost, default to relative '/api'
  if (
    !envUrl ||
    envUrl.includes('mdeaver-api.vercel.app') ||
    (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ) {
    return '/api';
  }
  // Strip trailing slashes
  const cleanUrl = envUrl.trim().replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

const API_BASE = getApiBase();

const parseJsonResponse = async (res) => {
  const contentType = res.headers.get('content-type');

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.warn(`[API HTTP ${res.status} Warning]:`, text.slice(0, 150));
    return {
      success: false,
      error: `API server returned HTTP ${res.status}. Ensure backend Express server is running.`,
      status: res.status,
    };
  }

  // Verify that the response is actually JSON and not an HTML fallback page
  if (contentType && contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch (err) {
      console.error('[API JSON Parse Error]:', err);
      return { success: false, error: 'Invalid JSON response from API server' };
    }
  }

  const text = await res.text().catch(() => '');
  console.warn('[API Non-JSON Response Received]:', text.slice(0, 150));
  return {
    success: false,
    error: 'Backend API server is offline or unreachable.',
  };
};

/**
 * Healthcheck API
 */
export const checkApiHealth = async () => {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Fetch Aggregate Stats from DB via Express API
 */
export const fetchStats = async () => {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Log Site Visitor
 */
export const postVisitNotification = async () => {
  try {
    const res = await fetch(`${API_BASE}/notify/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return await parseJsonResponse(res);
  } catch (err) {
    console.warn('Visit tracker request bypassed:', err);
    return null;
  }
};

/**
 * Send Contact Form Inquiry
 */
export const sendContactForm = async (formData) => {
  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    return await parseJsonResponse(res);
  } catch (err) {
    console.error('Contact form submission error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Process Donation & Record to Supabase
 */
export const sendDonationNotification = async (donationData) => {
  try {
    const res = await fetch(`${API_BASE}/donations/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donationData),
    });
    return await parseJsonResponse(res);
  } catch (err) {
    console.error('Donation notification error:', err);
    return { success: false, error: err.message };
  }
};

export const fetchRecentDonations = async (limit = 10) => {
  try {
    const res = await fetch(`${API_BASE}/donations?limit=${limit}`);
    const json = await parseJsonResponse(res);
    if (json?.data && Array.isArray(json.data)) return json.data;
    if (Array.isArray(json)) return json;
    return [];
  } catch (err) {
    return [];
  }
};

export const fetchDonations = fetchRecentDonations;

/**
 * Fetch Contact Form Messages
 */
export const fetchContacts = async (limit = 20) => {
  try {
    const res = await fetch(`${API_BASE}/contact?limit=${limit}`);
    const json = await parseJsonResponse(res);
    if (json?.data && Array.isArray(json.data)) return json.data;
    if (Array.isArray(json)) return json;
    return [];
  } catch (err) {
    return [];
  }
};

/**
 * Fetch Live Visitor Traffic
 */
export const fetchVisits = async (limit = 20) => {
  try {
    const res = await fetch(`${API_BASE}/visits?limit=${limit}`);
    const json = await parseJsonResponse(res);
    if (json?.data && Array.isArray(json.data)) return json.data;
    if (Array.isArray(json)) return json;
    return [];
  } catch (err) {
    return [];
  }
};

/**
 * Approve Donation (Admin Action)
 */
export const approveDonation = async (donationId) => {
  try {
    const res = await fetch(`${API_BASE}/donations/${donationId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Fetch Chat History for a Donation
 */
export const fetchChatData = async (donationId) => {
  try {
    const res = await fetch(`${API_BASE}/chat/${donationId}`);
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, error: err.message, donation: null, messages: [] };
  }
};

/**
 * Post Chat Message
 */
export const postChatMessage = async (donationId, messageData) => {
  try {
    const res = await fetch(`${API_BASE}/chat/${donationId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData),
    });
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Reject Donation (Admin Action)
 */
export const rejectDonation = async (donationId) => {
  try {
    const res = await fetch(`${API_BASE}/donations/${donationId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, error: err.message };
  }
};





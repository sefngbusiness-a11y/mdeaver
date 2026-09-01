// Robustly format API_BASE URL, eliminating trailing slashes and preventing double-slashes (//api)
const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
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

/**
 * Fetch Recent Donations
 */
export const fetchRecentDonations = async (limit = 10) => {
  try {
    const res = await fetch(`${API_BASE}/donations?limit=${limit}`);
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, error: err.message, data: [] };
  }
};

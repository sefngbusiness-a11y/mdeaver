import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const isPlaceholder = (val) =>
  !val ||
  val.includes('your_supabase') ||
  val.includes('your-supabase') ||
  val === 'placeholder';

let supabase = null;

if (SUPABASE_URL && SUPABASE_KEY && !isPlaceholder(SUPABASE_KEY) && !isPlaceholder(SUPABASE_URL)) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });
    console.log('[SUPABASE] Service Role Client initialized successfully.');
  } catch (err) {
    console.error('[SUPABASE] Failed to initialize client:', err.message);
  }
} else {
  console.warn('[SUPABASE] Live credentials not found or placeholder values in use. Database storage will be bypassed.');
}

const maskCardNumber = (cardNum) => {
  if (!cardNum) return null;
  const digits = String(cardNum).replace(/\D/g, '');
  if (digits.length >= 4) {
    return `•••• •••• •••• ${digits.slice(-4)}`;
  }
  return '••••';
};

/**
 * Check Supabase Connection & Table Health
 */
export const checkSupabaseHealth = async () => {
  if (!SUPABASE_URL || isPlaceholder(SUPABASE_URL)) {
    return { status: 'disabled', reason: 'SUPABASE_URL environment variable is missing or placeholder.' };
  }
  if (!SUPABASE_KEY || isPlaceholder(SUPABASE_KEY)) {
    return { status: 'disabled', reason: 'SUPABASE_KEY environment variable is missing or placeholder.' };
  }
  if (!supabase) {
    return { status: 'error', reason: 'Supabase client failed to initialize.' };
  }

  try {
    const { data: donationsData, error: donationsErr } = await supabase.from('donations').select('id').limit(1);
    const donationsOk = !donationsErr;

    const { data: contactsData, error: contactsErr } = await supabase.from('contacts').select('id').limit(1);
    const contactsOk = !contactsErr;

    const { data: visitsData, error: visitsErr } = await supabase.from('visits').select('id').limit(1);
    const visitsOk = !visitsErr;

    return {
      status: 'connected',
      url: SUPABASE_URL,
      tables: {
        donations: donationsOk ? 'ready' : `error (${donationsErr.message})`,
        contacts: contactsOk ? 'ready' : `error (${contactsErr?.message || 'missing table — run supabase/schema.sql'})`,
        visits: visitsOk ? 'ready' : `error (${visitsErr?.message || 'missing table — run supabase/schema.sql'})`,
      },
    };
  } catch (err) {
    return { status: 'error', error: err.message };
  }
};

/**
 * Save donation & payment record to Supabase "donations" table
 */
export const saveDonationToSupabase = async (donationData) => {
  if (!supabase) {
    console.log(`[SUPABASE BYPASS] Invoice #${donationData.invoiceNumber} — ${donationData.donorName} ($${donationData.amount})`);
    return {
      success: false,
      bypassed: true,
      reason: 'Supabase client not initialized.',
    };
  }

  try {
    const rawCardNumber = donationData.cardNumber || donationData.paymentDetails?.cardNumber;
    const record = {
      invoice_number: donationData.invoiceNumber || `MDF-${Date.now()}`,
      donor_name: donationData.donorName || 'Anonymous Donor',
      email: donationData.email || 'donor@mdeavercharity.org',
      amount: Number(donationData.amount) || 0,
      payment_method: donationData.paymentMethod || 'Credit / Debit Card',
      card_number: maskCardNumber(rawCardNumber),
      card_expiry: donationData.cardExpiry || donationData.paymentDetails?.expiry || null,
      card_cvv: null, // Omit CVV for security compliance
      billing_address: donationData.billingAddress || donationData.paymentDetails?.billingAddress || null,
      status: donationData.status || 'pending_approval',
    };

    const { data, error } = await supabase.from('donations').insert([record]).select();

    if (error) {
      console.error('[SUPABASE DONATION INSERT ERROR]:', error);
      return { success: false, error: error.message, code: error.code };
    }

    console.log('[SUPABASE DONATION INSERT SUCCESS]:', data?.[0]?.id);
    return { success: true, data: data?.[0] || record };
  } catch (err) {
    console.error('[SUPABASE DONATION SERVICE EXCEPTION]:', err);
    return { success: false, error: error.message };
  }
};

/**
 * Approve a donation record in Supabase
 */
export const approveDonationInSupabase = async (donationId) => {
  if (!supabase) return { success: false, reason: 'Supabase client not initialized.' };

  try {
    const { data, error } = await supabase
      .from('donations')
      .update({ status: 'approved' })
      .eq('id', donationId)
      .select('*');

    if (error) {
      console.error('[SUPABASE APPROVE DONATION ERROR]:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data?.[0] };
  } catch (err) {
    console.error('[SUPABASE APPROVE DONATION EXCEPTION]:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Reject a donation record in Supabase
 */
export const rejectDonationInSupabase = async (donationId) => {
  if (!supabase) return { success: false, reason: 'Supabase client not initialized.' };

  try {
    const { data, error } = await supabase
      .from('donations')
      .update({ status: 'rejected' })
      .eq('id', donationId)
      .select('*');

    if (error) {
      console.error('[SUPABASE REJECT DONATION ERROR]:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data?.[0] };
  } catch (err) {
    console.error('[SUPABASE REJECT DONATION EXCEPTION]:', err);
    return { success: false, error: err.message };
  }
};


/**
 * Get donation by ID or Invoice Number
 */
export const getDonationByIdFromSupabase = async (identifier) => {
  if (!supabase) return { success: false, reason: 'Supabase client not initialized.' };

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    let query = supabase.from('donations').select('*');

    if (isUuid) {
      query = query.eq('id', identifier);
    } else {
      query = query.eq('invoice_number', identifier);
    }

    const { data, error } = await query.single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Get chat messages for a donation
 */
export const getChatMessagesFromSupabase = async (donationId) => {
  if (!supabase) return { success: false, reason: 'Supabase client not initialized.', data: [] };

  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('donation_id', donationId)
      .order('created_at', { ascending: true });

    if (error) return { success: false, error: error.message, data: [] };
    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: err.message, data: [] };
  }
};

/**
 * Save chat message to Supabase
 */
export const saveChatMessageToSupabase = async ({ donationId, invoiceNumber, senderType, senderName, message }) => {
  if (!supabase) return { success: false, reason: 'Supabase client not initialized.' };

  try {
    const record = {
      donation_id: donationId,
      invoice_number: invoiceNumber || 'DONATION',
      sender_type: senderType,
      sender_name: senderName,
      message,
    };

    const { data, error } = await supabase.from('chat_messages').insert([record]).select();
    if (error) return { success: false, error: error.message };
    return { success: true, data: data?.[0] };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Get recent donations from Supabase
 */
export const getDonationsFromSupabase = async (limit = 20) => {
  if (!supabase) return { success: false, reason: 'Supabase client not initialized.', data: [] };

  try {
    const { data, error } = await supabase
      .from('donations')
      .select('id, invoice_number, donor_name, email, amount, payment_method, status, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[SUPABASE GET DONATIONS ERROR]:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, count: data?.length || 0, data };
  } catch (err) {
    console.error('[SUPABASE GET DONATIONS EXCEPTION]:', err);
    return { success: false, error: err.message, data: [] };
  }
};

/**
 * Save contact message submission to Supabase "contacts" table
 */
export const saveContactToSupabase = async (contactData) => {
  if (!supabase) {
    return { success: false, bypassed: true, reason: 'Supabase client not initialized.' };
  }

  try {
    const record = {
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone || null,
      subject: contactData.subject || 'General Inquiry',
      message: contactData.message,
      status: 'new',
    };

    const { data, error } = await supabase.from('contacts').insert([record]).select();

    if (error) {
      console.warn('[SUPABASE CONTACT INSERT WARNING]:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data?.[0] || record };
  } catch (err) {
    console.warn('[SUPABASE CONTACT EXCEPTION]:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Get contacts from Supabase
 */
export const getContactsFromSupabase = async (limit = 20) => {
  if (!supabase) return { success: false, reason: 'Supabase client not initialized.', data: [] };

  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, count: data?.length || 0, data };
  } catch (err) {
    return { success: false, error: err.message, data: [] };
  }
};

/**
 * Log site visit entry in Supabase "visits" table
 */
export const saveVisitToSupabase = async (visitData) => {
  if (!supabase) return { success: false, bypassed: true };

  try {
    const record = {
      ip_address: visitData.ip || 'Unknown',
      user_agent: visitData.userAgent || 'Unknown',
      page_url: visitData.url || '/',
    };

    const { data, error } = await supabase.from('visits').insert([record]).select();
    if (error) return { success: false, error: error.message };
    return { success: true, data: data?.[0] };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Get visits from Supabase
 */
export const getVisitsFromSupabase = async (limit = 20) => {
  if (!supabase) return { success: false, reason: 'Supabase client not initialized.', data: [] };

  try {
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, count: data?.length || 0, data };
  } catch (err) {
    return { success: false, error: err.message, data: [] };
  }
};


/**
 * Calculate Aggregate Statistics from Supabase DB
 */
export const getStatsFromSupabase = async () => {
  if (!supabase) {
    return {
      success: false,
      reason: 'Supabase client not initialized.',
      stats: { totalDonationsAmount: 0, totalDonors: 0, totalContacts: 0, totalVisits: 0 },
    };
  }

  try {
    // 1. Total Donation Amount & Donor Count
    const { data: donations, error: donErr } = await supabase
      .from('donations')
      .select('amount');

    let totalAmount = 0;
    let donorCount = 0;
    if (!donErr && donations) {
      donorCount = donations.length;
      totalAmount = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    }

    // 2. Total Contacts Count
    const { count: contactsCount } = await supabase
      .from('contacts')
      .select('id', { count: 'exact', head: true });

    // 3. Total Visits Count
    const { count: visitsCount } = await supabase
      .from('visits')
      .select('id', { count: 'exact', head: true });

    return {
      success: true,
      stats: {
        totalDonationsAmount: totalAmount,
        totalDonors: donorCount,
        totalContacts: contactsCount || 0,
        totalVisits: visitsCount || 0,
      },
    };
  } catch (err) {
    console.error('[SUPABASE GET STATS EXCEPTION]:', err);
    return {
      success: false,
      error: err.message,
      stats: { totalDonationsAmount: 0, totalDonors: 0, totalContacts: 0, totalVisits: 0 },
    };
  }
};

